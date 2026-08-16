module.exports = async (ctx) => {
  return await ctx.reply(
    `🏥 *RuralCare AI — Help*

*Account:*
\`LINK <phone> <pass>\` — Link + get OTP
\`LOGIN <phone> <pass>\` — Login

*Commands:*
/symptom — Analyze symptoms
/history — Health records
/reminder — Medications
/appointment — Book doctor
/report — Upload report

*Quick:*
Just type symptoms in any language!
Send voice note or photo/PDF

*Emergency:* Call 108 (free ambulance)`,
    {
      parse_mode: "Markdown",
    }
  );
};