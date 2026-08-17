const express    = require("express");
const { protect, authorize } = require("../middleware/index");
const analyticsCtrl = require("../controllers/analytics.controller");
const waCtrl        = require("../controllers/whatsapp.controller");
const syncCtrl      = require("../controllers/sync.controller");

// ─── Analytics ────────────────────────────────────────────────────────────────
const analyticsRouter = express.Router();

analyticsRouter.post("/track",                   protect, analyticsCtrl.trackEvent);
analyticsRouter.get ("/insights",                protect, analyticsCtrl.getMyInsights);
analyticsRouter.put ("/insights/:id/read",       protect, analyticsCtrl.markInsightRead);
analyticsRouter.post("/insights/generate",       protect, authorize("doctor","admin"), analyticsCtrl.generateInsights);
analyticsRouter.post("/insights/generate/:patientId", protect, authorize("doctor","admin"), analyticsCtrl.generateInsights);
analyticsRouter.post("/feedback",                protect, analyticsCtrl.submitFeedback);
analyticsRouter.get ("/feedback/stats",          protect, authorize("admin"), analyticsCtrl.getFeedbackStats);
analyticsRouter.get ("/system",                  protect, authorize("admin"), analyticsCtrl.getSystemMetrics);
analyticsRouter.get ("/district",                protect, authorize("admin","healthWorker"), analyticsCtrl.getDistrictMetrics);
analyticsRouter.get ("/top-symptoms",            protect, authorize("admin","healthWorker","doctor"), analyticsCtrl.getTopSymptoms);

// ─── WhatsApp ────────────────────────────────────────────────────────────────
const whatsappRouter = express.Router();

// No auth — Meta sends webhook without JWT
whatsappRouter.get ("/webhook", waCtrl.verifyWebhook);
whatsappRouter.post("/webhook", waCtrl.handleWebhook);
whatsappRouter.get ("/status",  protect, authorize("admin"), waCtrl.getStatus);

// ─── Offline Sync ─────────────────────────────────────────────────────────────
const syncRouter = express.Router();
syncRouter.use(protect);
syncRouter.post("/queue",   syncCtrl.queueActions);
syncRouter.post("/process", syncCtrl.processQueue);
syncRouter.get ("/status",  syncCtrl.getSyncStatus);

module.exports = { analyticsRouter, whatsappRouter, syncRouter };
