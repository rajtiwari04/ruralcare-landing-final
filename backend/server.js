require("dotenv").config();
const express  = require("express");
const http     = require("http");
const cors     = require("cors");
const connectDB= require("./config/db");

// ── Phase 1 & 2 routes ────────────────────────────────────────────────────────
const authRoutes         = require("./routes/auth.routes");
const patientRoutes      = require("./routes/patient.routes");
const chatRoutes         = require("./routes/chat.routes");
const reportRoutes       = require("./routes/report.routes");
const appointmentRoutes  = require("./routes/appointment.routes");
const doctorRoutes       = require("./routes/doctor.routes");
const healthWorkerRoutes = require("./routes/healthWorker.routes");
const adminRoutes        = require("./routes/admin.routes");
const notificationRoutes = require("./routes/notification.routes");
const voiceRoute         = require("./routes/voice.routes");

// ── Phase 3 & 4 routes ────────────────────────────────────────────────────────
const {
  teleconsultRouter, prescriptionRouter, maternalRouter,
  labRouter, nutritionRouter, schemesRouter,
  leaderboardRouter, heatmapRouter, ivrRouter,
} = require("./routes/phase3_4.routes");

// ── Phase 5 & 6 routes ────────────────────────────────────────────────────────
const { analyticsRouter, whatsappRouter, syncRouter } = require("./routes/phase5_6.routes");

// ── Services ──────────────────────────────────────────────────────────────────
const { initTeleconsult } = require("./services/teleconsult.service");

// ── Jobs ──────────────────────────────────────────────────────────────────────
require("./jobs/reminder.job");
require("./jobs/surveillance.job");
require("./jobs/phase3_4.jobs");
require("./jobs/phase5_6.jobs");

const app    = express();
const server = http.createServer(app);

connectDB();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logger (helps debug 404s)
app.use((req, res, next) => {
  if (req.path !== "/api/health") {
    console.log(`→ ${req.method} ${req.path}`);
  }
  next();
});

// ── Phase 1 & 2 ──────────────────────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/patient",       patientRoutes);
app.use("/api/chat/voice",    voiceRoute);      // BEFORE /api/chat
app.use("/api/chat",          chatRoutes);
app.use("/api/reports",       reportRoutes);
app.use("/api/appointments",  appointmentRoutes);
app.use("/api/doctor",        doctorRoutes);
app.use("/api/health-worker", healthWorkerRoutes);
app.use("/api/admin",         adminRoutes);
app.use("/api/notifications", notificationRoutes);

// ── Phase 3 & 4 ──────────────────────────────────────────────────────────────
app.use("/api/teleconsult",   teleconsultRouter);
app.use("/api/prescriptions", prescriptionRouter);
app.use("/api/maternal",      maternalRouter);
app.use("/api/lab",           labRouter);
app.use("/api/nutrition",     nutritionRouter);
app.use("/api/schemes",       schemesRouter);
app.use("/api/leaderboard",   leaderboardRouter);
app.use("/api/heatmap",       heatmapRouter);
app.use("/api/ivr",           ivrRouter);          // No auth — Twilio webhook

// ── Phase 5 & 6 ──────────────────────────────────────────────────────────────
app.use("/api/analytics",     analyticsRouter);
app.use("/api/whatsapp",      whatsappRouter);     // No auth — Meta webhook
app.use("/api/sync",          syncRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status:    "RuralCare AI running",
    phase:     "5+6",
    timestamp: new Date(),
    routes:    ["auth","patient","chat","reports","appointments","doctor",
                "health-worker","admin","notifications","teleconsult",
                "prescriptions","maternal","lab","nutrition","schemes",
                "leaderboard","heatmap","ivr","analytics","whatsapp","sync"],
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.path}`);
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error" });
});

// ── Socket.IO (telemedicine) ──────────────────────────────────────────────────
initTeleconsult(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🏥 RuralCare AI (Phase 5+6) running on port ${PORT}`);
  console.log(`📊 Analytics: http://localhost:${PORT}/api/analytics/system`);
  console.log(`📱 WhatsApp webhook: http://localhost:${PORT}/api/whatsapp/webhook`);
  console.log(`🔄 Sync queue: http://localhost:${PORT}/api/sync/status\n`);
});
