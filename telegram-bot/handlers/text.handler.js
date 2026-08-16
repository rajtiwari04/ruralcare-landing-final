const api = require("../services/api.service");

module.exports = async (ctx) => {
  const chatId = ctx.chat.id;
  const text = (ctx.message?.text || "").trim();

  ctx.session = ctx.session || {};

  const upper = text.toUpperCase();

  if (upper.startsWith("LINK ")) {
    const parts = text.split(/\s+/);

    if (parts.length < 3) {
      return await ctx.reply(
        "Format: LINK <phone> <password>"
      );
    }

    await ctx.reply("Linking account...");

    try {
      const r = await api.linkAndSendOTP(
        parts[1],
        parts.slice(2).join(" "),
        chatId
      );

      api.saveUserSession(
        chatId,
        r.token,
        r.user
      );

      return await ctx.reply(
        `✅ Linked! Welcome ${r.user.fullName}!

Your OTP sent above ↑
Enter on website → Profile → Telegram Verification

OTP valid 10 minutes.`
      );
    } catch (e) {
      console.error("LINK error:", e);

      return await ctx.reply(
        `❌ ${e.message || "Unable to link account."}`
      );
    }
  }

  if (upper.startsWith("LOGIN ")) {
    const parts = text.split(/\s+/);

    if (parts.length < 3) {
      return await ctx.reply(
        "Format: LOGIN <phone> <password>"
      );
    }

    await ctx.reply("Logging in...");

    try {
      const { user, token } =
        await api.loginByPhone(
          parts[1],
          parts.slice(2).join(" ")
        );

      api.saveUserSession(
        chatId,
        token,
        user
      );

      return await ctx.reply(
        `✅ Login successful!

Welcome, ${user.fullName}!

• Type symptoms in any language
• Send voice note 🎙️
• Send medical report photo 📄
• Use /help for commands`
      );
    } catch (e) {
      console.error("LOGIN error:", e);

      return await ctx.reply(
        "❌ Login failed. Check phone and password."
      );
    }
  }

  if (!api.isLoggedIn(chatId)) {
    return await ctx.reply(
      `👋 Welcome to RuralCare AI!

To start, link your account:
LINK <phone> <password>

Example: LINK 9876543210 mypassword`
    );
  }

  if (ctx.session.awaitingSymptoms) {
    ctx.session.awaitingSymptoms = false;

    await ctx.reply("🔍 Analyzing symptoms...");

    try {
      const { analysis } =
        await api.analyzeSymptoms(
          chatId,
          text
        );

      const emojiMap = {
        low: "🟢",
        medium: "🟡",
        high: "🔴",
        emergency: "🚨",
      };

      const emoji =
        emojiMap[analysis?.riskLevel] || "⚪";

      let msg = ` ${emoji} *Symptom Analysis*

*Summary:*
${analysis?.aiSummary || "No summary available."}

`;

      if (analysis?.isEmergency) {
        msg += `🚨 *EMERGENCY* — Call 108 immediately!

`;
      }

      if (analysis?.homeRemedies?.length) {
        msg += `🌿 *Home Remedies:*
${analysis.homeRemedies
  .map((r) => `• ${r}`)
  .join("\n")}

`;
      }

      if (analysis?.recommendedActions?.length) {
        msg += `✅ *Actions:*
${analysis.recommendedActions
  .map((a) => `• ${a}`)
  .join("\n")}`;
      }

      return await ctx.reply(
        msg,
        {
          parse_mode: "Markdown",
        }
      );
    } catch (e) {
      console.error(
        "Symptom analysis error:",
        e
      );

      return await ctx.reply(
        "❌ Could not analyze. Please try again."
      );
    }
  }

  try {
    await ctx.sendChatAction("typing");

    if (!ctx.session.sessionId) {
      ctx.session.sessionId =
        require("crypto").randomUUID();
    }

    const { response } =
      await api.sendChatMessage(
        chatId,
        text,
        ctx.session.sessionId
      );

    return await ctx.reply(response);
  } catch (e) {
    console.error(
      "Chat processing error:",
      e
    );

    if (e.message === "NOT_LOGGED_IN") {
      ctx.session = {};

      return await ctx.reply(
        "Session expired. LOGIN <phone> <password>"
      );
    }

    return await ctx.reply(
      "❌ Could not process. Please try again."
    );
  }
};