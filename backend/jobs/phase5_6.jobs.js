/**
 * Phase 5 & 6 Cron Jobs
 * ──────────────────────
 * - Nightly AI insights generation for all active patients
 * - Weekly district health report generation
 * - Stale insight cleanup
 * - WhatsApp daily health tip broadcast
 */

const cron = require("node-cron");

// ─── Nightly AI insights — 2 AM daily ─────────────────────────────────────────
cron.schedule("0 2 * * *", async () => {
  console.log("🧠 Running nightly AI insights generation...");
  try {
    const User            = require("../models/User.model");
    const insightsService = require("../services/insights.service");
    const analyticsService= require("../services/analytics.service");

    // Get patients who had activity in last 30 days
    const HealthRecord = require("../models/HealthRecord.model");
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const activeRecords = await HealthRecord.distinct("patient", { createdAt: { $gte: thirtyDaysAgo } });

    const patients = await User.find({
      _id:      { $in: activeRecords },
      role:     "patient",
      isActive: true,
    }).limit(200); // Process max 200 per night

    let generated = 0;
    for (const patient of patients) {
      try {
        const insights = await insightsService.generatePatientInsights(patient);
        if (insights.length > 0) {
          generated += insights.length;
          // Track the insight generation event
          await analyticsService.track(patient._id, "chat_message", {
            type: "insights_generated", count: insights.length
          });
        }
      } catch (err) {
        console.warn(`Insights failed for ${patient._id}: ${err.message}`);
      }
    }

    console.log(`✅ Nightly insights: ${generated} insights for ${patients.length} patients`);
  } catch (err) {
    console.error("Nightly insights cron error:", err.message);
  }
});

// ─── Weekly district health reports — Sunday 10 PM ────────────────────────────
cron.schedule("0 22 * * 0", async () => {
  console.log("📊 Generating weekly district health reports...");
  try {
    const User             = require("../models/User.model");
    const analyticsService = require("../services/analytics.service");

    const districts = await User.distinct("district", { role: "patient", isActive: true });

    for (const district of districts) {
      if (!district) continue;
      try {
        await analyticsService.generateWeeklyReport(district);
        console.log(`✅ Report generated: ${district}`);
      } catch (err) {
        console.warn(`Report failed for ${district}: ${err.message}`);
      }
    }

    console.log(`✅ Weekly reports done for ${districts.length} districts`);
  } catch (err) {
    console.error("Weekly report cron error:", err.message);
  }
});

// ─── Stale insight cleanup — 1 AM every Monday ────────────────────────────────
cron.schedule("0 1 * * 1", async () => {
  try {
    const { DiagnosticInsight } = require("../models/phase5_6.models");
    const result = await DiagnosticInsight.deleteMany({
      validUntil: { $lt: new Date() },
      isRead:     true,
    });
    console.log(`🧹 Cleaned ${result.deletedCount} expired insights`);
  } catch (err) {
    console.error("Insight cleanup error:", err.message);
  }
});

// ─── WhatsApp daily health tip — 9 AM daily ───────────────────────────────────
cron.schedule("0 9 * * *", async () => {
  try {
    const { WhatsAppSession } = require("../models/phase5_6.models");
    const waService  = require("../services/whatsapp.service");
    const aiService  = require("../services/ai.service");

    const WHATSAPP_CONFIGURED = !!(
      process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
    );
    if (!WHATSAPP_CONFIGURED) return;

    const sessions = await WhatsAppSession.find({ isLinked: true }).limit(100);
    if (sessions.length === 0) return;

    // Generate one tip per language used
    const languageTips = {};
    for (const session of sessions) {
      const lang = session.language || "hindi";
      if (!languageTips[lang]) {
        const tip = await aiService.generateChatResponse(
          "Give one short daily health tip relevant to rural India today.",
          lang, []
        ).catch(() => null);
        if (tip) languageTips[lang] = `🌿 *Daily Health Tip*

${tip}`;
      }
    }

    // Send to each linked session
    let sent = 0;
    for (const session of sessions) {
      const lang = session.language || "hindi";
      const tip  = languageTips[lang];
      if (!tip) continue;
      const ok = await waService.sendTextMessage(session.waId, tip);
      if (ok) sent++;
    }

    console.log(`💬 WhatsApp daily tips sent: ${sent}/${sessions.length}`);
  } catch (err) {
    console.error("WhatsApp daily tip error:", err.message);
  }
});

// ─── Offline sync processor — every 5 minutes ─────────────────────────────────
cron.schedule("*/5 * * * *", async () => {
  try {
    const { SyncQueue } = require("../models/phase5_6.models");
    const syncService   = require("../services/sync.service");

    // Find patients with pending sync items
    const pendingPatients = await SyncQueue.distinct("patient", { status: "pending" });
    if (pendingPatients.length === 0) return;

    console.log(`🔄 Processing sync queue for ${pendingPatients.length} patients...`);
    for (const patientId of pendingPatients.slice(0, 20)) {
      await syncService.processSyncQueue(patientId).catch(e =>
        console.warn(`Sync failed for ${patientId}: ${e.message}`)
      );
    }
  } catch (err) {
    console.error("Sync queue cron error:", err.message);
  }
});

console.log("⏰ Phase 5 & 6 cron jobs scheduled");
