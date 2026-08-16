const api = require("../services/api.service");

module.exports = async (ctx) => {
  const s = api.getUserSession(ctx.chat.id);

  if (s) {
    return await ctx.reply(
      `✅ Welcome back, ${s.user.fullName}!

• Type symptoms
• Send voice note 🎙️
• Send medical report 📄

/symptom /history /reminder /appointment /help`,
      {
        parse_mode: "Markdown",
      }
    );
  }

  return await ctx.reply(
    `🏥 *Welcome to RuralCare AI!*

*Step 1:* Register at RuralCare website
*Step 2:* Send: \`LINK <phone> <password>\`

Example: \`LINK 9876543210 mypassword\`

_Links account + sends OTP automatically._`,
    {
      parse_mode: "Markdown",
    }
  );
};