const waService = require("../services/whatsapp.service");
const aiService = require("../services/ai.service");
const ocrService = require("../services/ocr.service");
const { WhatsAppSession } = require("../models/phase5_6.models");
const { uploadToCloudinary } = require("../middleware/index");
const MedicalReport = require("../models/MedicalReport.model");

const VERIFY_TOKEN =
  process.env.WHATSAPP_VERIFY_TOKEN || "ruralcare_verify_2024";

const verifyWebhook = (req, res) => {
  if (
    req.query["hub.mode"] === "subscribe" &&
    req.query["hub.verify_token"] === VERIFY_TOKEN
  ) {
    console.log("✅ WhatsApp webhook verified");
    return res.status(200).send(req.query["hub.challenge"]);
  }

  return res.sendStatus(403);
};

const handleWebhook = async (req, res) => {
  // WhatsApp expects a quick 200 response.
  res.sendStatus(200);

  try {
    const message =
      req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) return;

    const waId = message.from;
    const session = await waService.getSession(waId);

    if (message.type === "text") {
      await handleText(waId, message.text?.body || "", session);
    } else if (message.type === "audio") {
      await handleAudio(waId, message.audio?.id, session);
    } else if (
      message.type === "image" ||
      message.type === "document"
    ) {
      const id = message.image?.id || message.document?.id;
      const name =
        message.document?.filename || "report.jpg";

      await handleMedia(waId, id, name, session);
    }
  } catch (e) {
    console.error("WA webhook error:", e);
  }
};

async function handleText(waId, text, session) {
  const normalizedText = String(text || "").trim();

  if (normalizedText.toUpperCase().startsWith("LINK ")) {
    const parts = normalizedText.split(/\s+/);

    if (parts.length < 3) {
      return waService.sendTextMessage(
        waId,
        "Format: LINK <phone> <password>"
      );
    }

    try {
      const result = await waService.linkAccount(
        waId,
        parts[1],
        parts.slice(2).join(" ")
      );

      await waService.sendTextMessage(
        waId,
        `✅ Linked! Welcome ${result.user.fullName}!

OTP sent above. Enter on RuralCare website → Profile.

Now type symptoms in any language!`
      );
    } catch (e) {
      await waService.sendTextMessage(
        waId,
        `❌ ${e.message || "Unable to link account."}`
      );
    }

    return;
  }

  if (normalizedText.toUpperCase() === "HELP") {
    return waService.sendTextMessage(
      waId,
      `🏥 RuralCare AI

LINK <phone> <pass> — Link account
HELP — Show commands

Or just type your symptoms in any language!

Emergency: Call 108`
    );
  }

  if (!session?.isLinked) {
    return waService.sendTextMessage(
      waId,
      `👋 Welcome to RuralCare AI!

Send: LINK <phone> <password>
Example: LINK 9876543210 mypassword`
    );
  }

  try {
    const lang = session.language || "hindi";

    const response = await aiService.generateChatResponse(
      normalizedText,
      lang,
      []
    );

    await waService.sendTextMessage(waId, response);
  } catch (e) {
    console.error("WA text processing error:", e);

    await waService.sendTextMessage(
      waId,
      "❌ Could not process your message. Please try again."
    );
  }
}

async function handleAudio(waId, mediaId, session) {
  if (!session?.isLinked) {
    return waService.sendTextMessage(
      waId,
      "Link account first: LINK <phone> <password>"
    );
  }

  if (!mediaId) {
    return waService.sendTextMessage(
      waId,
      "❌ Voice message could not be read."
    );
  }

  await waService.sendTextMessage(
    waId,
    "🎙️ Processing voice..."
  );

  try {
    const { buffer, mimeType } =
      await waService.downloadMedia(mediaId);

    const FormData = require("form-data");
    const axios = require("axios");

    const form = new FormData();

    form.append("audio", buffer, {
      filename: "voice.ogg",
      contentType: mimeType || "audio/ogg",
    });

    const sttServerUrl =
      process.env.STT_SERVER_URL ||
      "http://localhost:8765/transcribe";

    const stt = await axios
      .post(sttServerUrl, form, {
        headers: form.getHeaders(),
        timeout: 60000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      })
      .catch((error) => {
        console.error(
          "STT request failed:",
          error?.response?.data || error.message
        );

        return null;
      });

    if (!stt?.data?.text) {
      return waService.sendTextMessage(
        waId,
        "❌ Could not transcribe. Please type symptoms."
      );
    }

    const response = await aiService.generateChatResponse(
      stt.data.text,
      session.language || "hindi",
      []
    );

    await waService.sendTextMessage(
      waId,
      `🎙️ You said: "${stt.data.text}"

🤖 ${response}`
    );
  } catch (e) {
    console.error("WA voice processing error:", e);

    await waService.sendTextMessage(
      waId,
      "❌ Voice failed. Please type symptoms."
    );
  }
}

async function handleMedia(waId, mediaId, filename, session) {
  if (!session?.isLinked) {
    return waService.sendTextMessage(
      waId,
      "Link account first: LINK <phone> <password>"
    );
  }

  if (!mediaId) {
    return waService.sendTextMessage(
      waId,
      "❌ Could not read the uploaded file."
    );
  }

  await waService.sendTextMessage(
    waId,
    "📄 Processing document..."
  );

  try {
    const { buffer, mimeType } =
      await waService.downloadMedia(mediaId);

    if (!buffer) {
      throw new Error("Downloaded media buffer is empty.");
    }

    const safeFilename = String(filename || "report.jpg");

    const isPDF =
      String(mimeType || "").toLowerCase().includes("pdf") ||
      safeFilename.toLowerCase().endsWith(".pdf");

    const cloud = await uploadToCloudinary(buffer, {
      folder: "ruralcare/reports",
      resource_type: "auto",
    });

    if (!cloud?.secure_url) {
      throw new Error("Failed to upload report to Cloudinary.");
    }

    const report = await MedicalReport.create({
      patient: session.userId,
      reportType: "other",
      reportTitle: `WA Report — ${new Date().toLocaleDateString()}`,
      fileUrl: cloud.secure_url,
      filePublicId: cloud.public_id,
      fileType: isPDF ? "pdf" : "image",
      status: "processing",
    });

    const { extractedText } =
      await ocrService.processReportBuffer(
        buffer,
        isPDF ? "pdf" : "image",
        mimeType
      );

    const analysis =
      await aiService.summarizeMedicalReport(
        extractedText || "",
        "other",
        session.language || "hindi"
      );

    await MedicalReport.findByIdAndUpdate(
      report._id,
      {
        extractedText: extractedText || "",
        aiSummary: analysis?.aiSummary || "",
        keyFindings: analysis?.keyFindings || [],
        abnormalValues: analysis?.abnormalValues || [],
        recommendations: analysis?.recommendations || [],
        riskLevel: analysis?.riskLevel || "normal",
        status: "completed",
      },
      { new: true }
    );

    let msg = `📊 *Report Analysis*

${analysis?.aiSummary || "No summary available."}`;

    if (analysis?.keyFindings?.length) {
      msg += `

*Findings:*
${analysis.keyFindings
  .map((f) => `• ${f}`)
  .join("\n")}`;
    }

    if (analysis?.abnormalValues?.length) {
      msg += `

⚠️ *Abnormal:*
${analysis.abnormalValues
  .map((v) => `• ${v}`)
  .join("\n")}`;
    }

    if (analysis?.recommendations?.length) {
      msg += `

💡 *Recommendations:*
${analysis.recommendations
  .map((r) => `• ${r}`)
  .join("\n")}`;
    }

    await waService.sendTextMessage(waId, msg);
  } catch (e) {
    console.error("WA medical report processing error:", e);

    await waService.sendTextMessage(
      waId,
      `❌ Analysis failed: ${
        e.message || "Unable to process the report."
      }`
    );
  }
}

const getStatus = (req, res) => {
  return res.json({
    success: true,
    configured: Boolean(
      process.env.WHATSAPP_TOKEN &&
        process.env.WHATSAPP_PHONE_NUMBER_ID
    ),
    verifyToken: VERIFY_TOKEN,
  });
};

module.exports = {
  verifyWebhook,
  handleWebhook,
  getStatus,
};