require("dotenv").config();

const http = require("http");
const { Telegraf, session } = require("telegraf");
const { message } = require("telegraf/filters");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN, {
  handlerTimeout: 90_000,
});

bot.use(session());

/* =========================
   Telegram Commands
========================= */

bot.command("start", require("./commands/start.command"));
bot.command("help", require("./commands/help.command"));
bot.command("symptom", require("./commands/symptom.command"));
bot.command("history", require("./commands/history.command"));
bot.command("reminder", require("./commands/reminder.command"));
bot.command("appointment", require("./commands/appointment.command"));
bot.command("report", require("./commands/report.command"));

/* =========================
   Telegram Message Handlers
========================= */

bot.on(message("text"), require("./handlers/text.handler"));
bot.on(message("voice"), require("./handlers/voice.handler"));
bot.on(message("photo"), require("./handlers/photo.handler"));
bot.on(message("document"), require("./handlers/photo.handler"));

/* =========================
   Telegram Error Handler
========================= */

bot.catch((err, ctx) => {
  console.error("Bot error:", err.message);

  try {
    ctx.reply("Something went wrong. Type /help for commands.");
  } catch (replyError) {
    console.error("Failed to send error reply:", replyError.message);
  }
});

/* =========================
   Render Health Server
========================= */

const PORT = Number(process.env.PORT) || 10000;

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/" || req.url === "/health") {
    res.writeHead(200);

    res.end(
      JSON.stringify({
        success: true,
        service: "RuralCare Telegram Bot",
        status: "running",
        telegram: "polling",
      })
    );

    return;
  }

  res.writeHead(404);

  res.end(
    JSON.stringify({
      success: false,
      message: "Route not found",
    })
  );
});

server.on("error", (err) => {
  console.error("Health server error:", err.message);
});

/* =========================
   Start Health Server
========================= */

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Health server listening on 0.0.0.0:${PORT}`);
});

/* =========================
   Telegram Bot Startup
========================= */

let shuttingDown = false;
let retryTimer = null;

async function start(retry = 0) {
  if (shuttingDown) return;

  try {
    console.log(`Starting bot (attempt ${retry + 1})...`);

    await bot.launch({
      dropPendingUpdates: true,
    });

    console.log(
      "✅ RuralCare Telegram Bot running! @" +
        bot.botInfo?.username
    );
  } catch (e) {
    if (shuttingDown) return;

    const isNet =
      e.code === "ETIMEDOUT" ||
      e.code === "ECONNREFUSED" ||
      e.code === "ENETUNREACH" ||
      e.code === "EAI_AGAIN" ||
      e.message?.toLowerCase().includes("timeout");

    if (isNet && retry < 10) {
      const delay = Math.min(5000 * (retry + 1), 60000);

      console.error(
        `Network error. Retry in ${delay / 1000}s...`
      );

      retryTimer = setTimeout(() => {
        retryTimer = null;
        start(retry + 1);
      }, delay);

      return;
    }

    console.error("Bot failed:", e.message);
    process.exit(1);
  }
}

start();

/* =========================
   Graceful Shutdown
========================= */

function shutdown(signal) {
  if (shuttingDown) return;

  shuttingDown = true;

  console.log(`Received ${signal}. Shutting down...`);

  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }

  try {
    bot.stop(signal);
  } catch (err) {
    console.error("Bot shutdown error:", err.message);
  }

  server.close((err) => {
    if (err) {
      console.error("Health server shutdown error:", err.message);
    }

    console.log("✅ Shutdown complete");
    process.exit(0);
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

/* =========================
   Process Errors
========================= */

process.on("uncaughtException", (e) => {
  console.error("Uncaught:", e);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled:", reason);
});
