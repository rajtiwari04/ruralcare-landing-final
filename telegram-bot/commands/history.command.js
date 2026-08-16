const api = require("../services/api.service");

module.exports = async (ctx) => {
  if (!api.isLoggedIn(ctx.chat.id)) {
    return await ctx.reply(
      "Please login: LOGIN <phone> <password>"
    );
  }

  try {
    await ctx.reply("⏳ Fetching your health history...");

    const records = await api.getHealthHistory(ctx.chat.id);

    if (!records?.length) {
      return await ctx.reply(
        `📋 No health records yet.
Use /symptom to report symptoms!`
      );
    }

    const emoji = {
      low: "🟢",
      medium: "🟡",
      high: "🔴",
      emergency: "🚨",
    };

    let msg = `📋 *Your Recent Health Records*

`;

    records.forEach((r, i) => {
      msg += `${i + 1}. ${
        emoji[r.riskLevel] || "⚪"
      } *${new Date(r.createdAt).toLocaleDateString("en-IN")}*
   ${(r.symptoms || "").substring(0, 80)}
   Risk: ${(r.riskLevel || "low").toUpperCase()}

`;
    });

    return await ctx.reply(msg, {
      parse_mode: "Markdown",
    });
  } catch (e) {
    console.error("Health history error:", e);

    return await ctx.reply(
      "❌ Could not fetch history."
    );
  }
};