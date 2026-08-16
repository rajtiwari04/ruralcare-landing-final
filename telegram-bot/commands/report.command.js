module.exports = async (ctx) => {
  ctx.session = ctx.session || {};
  ctx.session.awaitingReport = true;

  await ctx.reply(
    `📄 *Upload Medical Report*

Send a photo or PDF:
• Blood report
• Prescription
• X-ray / scan

AI will analyze and explain it in simple language.`,
    {
      parse_mode: "Markdown",
    }
  );
};