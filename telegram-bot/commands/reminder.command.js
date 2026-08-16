const api = require("../services/api.service");

module.exports = async (ctx) => {
  if (!api.isLoggedIn(ctx.chat.id)) {
    return await ctx.reply(
      "Please login: LOGIN <phone> <password>"
    );
  }

  try {
    const reminders = await api.getReminders(ctx.chat.id);

    if (!reminders?.length) {
      return await ctx.reply(
        `💊 No active medication reminders.
Add them on the RuralCare website.`
      );
    }

    let msg = `💊 *Your Medication Reminders*

`;

    reminders.forEach((r, i) => {
      msg += `${i + 1}. *${r.medicationName}*
   ${r.dosage || "As prescribed"} · ${
        (r.reminderTimes || []).join(", ")
      }

`;
    });

    return await ctx.reply(msg, {
      parse_mode: "Markdown",
    });
  } catch (e) {
    console.error("Medication reminders error:", e);

    return await ctx.reply(
      "❌ Could not fetch reminders."
    );
  }
};