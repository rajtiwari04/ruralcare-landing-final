module.exports = async (ctx) => {
  return await ctx.reply(
    `📅 *Book Appointment*

Visit the RuralCare website to book:
localhost:5173/patient/appointments

Teleconsultation (video call) also available!`,
    {
      parse_mode: "Markdown",
    }
  );
};