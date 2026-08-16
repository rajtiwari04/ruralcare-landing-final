module.exports = async (ctx) => {
  ctx.session = ctx.session || {};
  ctx.session.awaitingSymptoms = true;

  await ctx.reply(
    `🩺 *Symptom Checker*

Describe your symptoms in detail in any language.

_Example: Mujhe 2 din se bukhaar hai aur sar dard ho raha hai_`,
    {
      parse_mode: "Markdown",
    }
  );
};