require("dotenv").config();
const { Telegraf, session } = require("telegraf");
const { message } = require("telegraf/filters");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN, { handlerTimeout:90_000 });
bot.use(session());

bot.command("start",       require("./commands/start.command"));
bot.command("help",        require("./commands/help.command"));
bot.command("symptom",     require("./commands/symptom.command"));
bot.command("history",     require("./commands/history.command"));
bot.command("reminder",    require("./commands/reminder.command"));
bot.command("appointment", require("./commands/appointment.command"));
bot.command("report",      require("./commands/report.command"));

bot.on(message("text"),     require("./handlers/text.handler"));
bot.on(message("voice"),    require("./handlers/voice.handler"));
bot.on(message("photo"),    require("./handlers/photo.handler"));
bot.on(message("document"), require("./handlers/photo.handler"));

bot.catch((err, ctx) => {
  console.error("Bot error:", err.message);
  try { ctx.reply("Something went wrong. Type /help for commands."); } catch {}
});

async function start(retry=0) {
  try {
    console.log(`Starting bot (attempt ${retry+1})...`);
    await bot.launch({ dropPendingUpdates:true });
    console.log("✅ RuralCare Telegram Bot running! @"+bot.botInfo?.username);
  } catch(e) {
    const isNet = e.code==="ETIMEDOUT"||e.code==="ECONNREFUSED"||e.message?.includes("timeout");
    if (isNet && retry<10) {
      const delay = Math.min(5000*(retry+1),60000);
      console.error(`Network error. Retry in ${delay/1000}s...`);
      return setTimeout(()=>start(retry+1), delay);
    }
    console.error("Bot failed:", e.message);
    process.exit(1);
  }
}

start();
process.once("SIGINT",  ()=>bot.stop("SIGINT"));
process.once("SIGTERM", ()=>bot.stop("SIGTERM"));
process.on("uncaughtException",  e=>console.error("Uncaught:", e.message));
process.on("unhandledRejection", r=>console.error("Unhandled:", r));
