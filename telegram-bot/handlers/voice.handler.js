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
    await ctx.reply("🎙️ Processing voice message...");

    const fileId = ctx.message?.voice?.file_id;

    if (!fileId) {
      return await ctx.reply(
        "❌ Voice message could not be read."
      );
    }

    if (!BOT_TOKEN) {
      console.error(
        "TELEGRAM_BOT_TOKEN is not configured."
      );

      return await ctx.reply(
        "❌ Voice processing is not configured."
      );
    }

    const fileInfo = await ctx.telegram.getFile(
      fileId
    );

    if (!fileInfo?.file_path) {
      return await ctx.reply(
        "❌ Could not retrieve the voice file."
      );
    }

    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileInfo.file_path}`;

    const audioRes = await axios.get(fileUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    const buffer = Buffer.from(audioRes.data);

    const session = api.getUserSession(chatId);

    if (!session?.token) {
      return await ctx.reply(
        "Session expired. LOGIN <phone> <password>"
      );
    }

    const FormData = require("form-data");

    const form = new FormData();

    form.append("audio", buffer, {
      filename: "voice.ogg",
      contentType: "audio/ogg",
    });

    let response;

    try {
      response = await axios.post(
        `${API_URL}/chat/voice`,
        form,
        {
          headers: {
            Authorization: `Bearer ${session.token}`,
            ...form.getHeaders(),
          },
          timeout: 90000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );
    } catch (apiErr) {
      const data = apiErr.response?.data;

      if (data?.noSTT) {
        return await ctx.reply(
          `🎙️ Voice needs setup.

Add GROQ_API_KEY to backend .env
(free at console.groq.com)

For now, type your symptoms.`
        );
      }

      console.error(
        "Voice API error:",
        apiErr.response?.status,
        data?.message || apiErr.message
      );

      return await ctx.reply(
        `❌ Voice failed.

💬 Please type your symptoms instead.`
      );
    }

    const result = response?.data?.data;

    if (!result) {
      throw new Error(
        "Invalid response received from voice API."
      );
    }

    const {
      transcript,
      aiResponse,
    } = result;

    await ctx.reply(
      `🎙️ *You said:*
_${transcript || "Could not determine transcript."}_

🤖 *RuralCare AI:*
${aiResponse || "No response generated."}`,
      {
        parse_mode: "Markdown",
      }
    );
  } catch (e) {
    console.error(
      "Voice handler error:",
      e
    );

    return await ctx.reply(
      `❌ Could not process voice.

💬 Please type your symptoms instead.`
    );
  }
};