const axios = require("axios");
const api = require("../services/api.service");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL =
  process.env.BACKEND_API_URL || "http://localhost:5000/api";

module.exports = async (ctx) => {
  const chatId = ctx.chat.id;

  if (!api.isLoggedIn(chatId)) {
    return await ctx.reply(
      "Please login first: LOGIN <phone> <password>"
    );
  }

  try {
    await ctx.reply("📄 Processing your document...");

    let fileId;
    let fileName;
    let mimeType;

    if (ctx.message?.photo?.length) {
      const photos = ctx.message.photo;

      fileId = photos[photos.length - 1].file_id;
      fileName = "report.jpg";
      mimeType = "image/jpeg";
    } else if (ctx.message?.document) {
      fileId = ctx.message.document.file_id;
      fileName =
        ctx.message.document.file_name || "report.pdf";
      mimeType =
        ctx.message.document.mime_type ||
        "application/octet-stream";
    } else {
      return await ctx.reply(
        "❌ Please send a photo or document."
      );
    }

    if (!BOT_TOKEN) {
      console.error(
        "TELEGRAM_BOT_TOKEN is not configured."
      );

      return await ctx.reply(
        "❌ Telegram bot configuration is missing."
      );
    }

    const reportType = detectType(
      ctx.message?.caption || "",
      fileName
    );

    const fileInfo =
      await ctx.telegram.getFile(fileId);

    if (!fileInfo?.file_path) {
      return await ctx.reply(
        "❌ Could not retrieve the uploaded file."
      );
    }

    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileInfo.file_path}`;

    const fileRes = await axios.get(fileUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    const buffer = Buffer.from(fileRes.data);

    const session = api.getUserSession(chatId);

    if (!session?.token) {
      return await ctx.reply(
        "Session expired. LOGIN <phone> <password>"
      );
    }

    const FormData = require("form-data");

    const form = new FormData();

    form.append("report", buffer, {
      filename: fileName,
      contentType: mimeType,
    });

    form.append("reportType", reportType);

    const response = await axios.post(
      `${API_URL}/reports`,
      form,
      {
        headers: {
          Authorization: `Bearer ${session.token}`,
          ...form.getHeaders(),
        },
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    const reportId =
      response?.data?.data?.reportId;

    if (!reportId) {
      throw new Error(
        "Report ID was not returned by the backend."
      );
    }

    const fileType = fileName
      .toLowerCase()
      .endsWith(".pdf")
      ? "PDF"
      : "image";

    await ctx.reply(
      `✅ Report uploaded!
📊 AI analyzing your ${fileType}...
Results in ~30 seconds.
Report ID: ${reportId}`,
      {
        parse_mode: "Markdown",
      }
    );

    // Start polling without blocking the webhook handler.
    pollReport(
      ctx,
      reportId,
      session.token,
      fileType
    );
  } catch (e) {
    console.error(
      "Photo handler error:",
      e.response?.data?.message || e.message
    );

    return await ctx.reply(
      `❌ Upload failed: ${
        e.response?.data?.message ||
        "Please try again."
      }`
    );
  }
};

function detectType(caption, name) {
  const t = `${caption} ${name}`.toLowerCase();

  if (t.match(/blood|cbc|haemoglobin/)) {
    return "blood_report";
  }

  if (t.match(/prescription|rx/)) {
    return "prescription";
  }

  if (t.match(/xray|x-ray|scan|ct|mri/)) {
    return "xray";
  }

  return "other";
}

async function pollReport(
  ctx,
  id,
  token,
  fileType
) {
  let n = 0;

  const t = setInterval(async () => {
    n++;

    try {
      const res = await axios.get(
        `${API_URL}/reports/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        }
      );

      const report =
        res?.data?.data?.report;

      if (!report) {
        if (n >= 24) {
          clearInterval(t);

          await ctx.reply(
            "⏳ Taking longer than expected. Check results on the website."
          );
        }

        return;
      }

      if (report.status === "completed") {
        clearInterval(t);

        let msg = `📊 *${fileType} Analysis Complete*

${report.aiSummary || "No summary available."}`;

        if (report.keyFindings?.length) {
          msg += `

*Findings:*
${report.keyFindings
  .map((f) => `• ${f}`)
  .join("\n")}`;
        }

        if (report.abnormalValues?.length) {
          msg += `

⚠️ *Abnormal:*
${report.abnormalValues
  .map((v) => `• ${v}`)
  .join("\n")}`;
        }

        if (report.recommendations?.length) {
          msg += `

✅ *Advice:*
${report.recommendations
  .map((r) => `• ${r}`)
  .join("\n")}`;
        }

        await ctx.reply(msg, {
          parse_mode: "Markdown",
        });
      } else if (report.status === "failed") {
        clearInterval(t);

        await ctx.reply(
          `❌ Analysis failed: ${
            report.aiSummary ||
            "Unknown error"
          }

For PDFs: ensure text is selectable.
For images: upload a clear photo.`
        );
      } else if (n >= 24) {
        clearInterval(t);

        await ctx.reply(
          "⏳ Taking longer than expected. Check results on the website."
        );
      }
    } catch (e) {
      console.error(
        "Report polling error:",
        e.response?.data?.message ||
          e.message
      );

      if (n >= 24) {
        clearInterval(t);

        await ctx.reply(
          "⏳ Taking longer than expected. Check results on the website."
        );
      }
    }
  }, 5000);
}