const cron = require("node-cron");

// Every minute — check medication reminders
cron.schedule("* * * * *", async () => {
  try {
    const { MedicationReminder } = require("../models/index");
    const notifService = require("../services/notification.service");
    const now  = new Date();
    const hhmm = now.getHours().toString().padStart(2,"0") + ":" + now.getMinutes().toString().padStart(2,"0");
    const due  = await MedicationReminder.find({ isActive:true, reminderTimes:hhmm }).populate("patient","_id fullName preferredLanguage");
    for (const r of due) {
      await notifService.sendMedicationReminder(r.patient._id, r.medicationName, hhmm);
    }
    if (due.length > 0) console.log(`💊 Sent ${due.length} medication reminders at ${hhmm}`);
  } catch(e) { console.error("Reminder cron:", e.message); }
});

// 7 AM daily — health worker morning summary
cron.schedule("0 7 * * *", async () => {
  try {
    const User = require("../models/User.model");
    const HealthRecord = require("../models/HealthRecord.model");
    const aiService    = require("../services/ai.service");
    const notifService = require("../services/notification.service");
    const yesterday    = new Date(Date.now() - 86400000);
    const workers      = await User.find({ role:"healthWorker", isActive:true });
    for (const hw of workers) {
      const patients = await User.find({ assignedHealthWorker:hw._id }).select("_id");
      const records  = await HealthRecord.find({ patient:{$in:patients.map(p=>p._id)}, createdAt:{$gte:yesterday} }).select("symptoms riskLevel");
      if (records.length === 0) continue;
      const summary = await aiService.generateHealthWorkerSummary({
        village: hw.village, totalPatients: patients.length,
        highRiskPatients: records.filter(r=>["high","emergency"].includes(r.riskLevel)).length,
        recentSymptoms: records.map(r=>r.symptoms).slice(0,5).join("; "),
      }, hw.preferredLanguage || "hindi");
      await notifService.createNotification(hw._id, "daily_summary", "📊 Good Morning — Daily Summary", summary);
    }
    console.log(`✅ Morning summaries sent to ${workers.length} health workers`);
  } catch(e) { console.error("Morning summary cron:", e.message); }
});

// Follow-up reminders — 10 AM daily
cron.schedule("0 10 * * *", async () => {
  try {
    const HealthRecord = require("../models/HealthRecord.model");
    const aiService    = require("../services/ai.service");
    const notifService = require("../services/notification.service");
    const User         = require("../models/User.model");
    const threeDaysAgo = new Date(Date.now() - 3*86400000);
    const records      = await HealthRecord.find({
      riskLevel: { $in:["high","medium"] }, isFollowedUp:false,
      createdAt: { $gte: threeDaysAgo },
      followUpDate: { $lte: new Date() },
    }).populate("patient","_id fullName preferredLanguage");
    for (const r of records) {
      if (!r.patient) continue;
      const msg = await aiService.generateFollowUpMessage(r.patient, r, r.patient.preferredLanguage||"hindi");
      await notifService.sendFollowUpReminder(r.patient._id, msg);
      await HealthRecord.findByIdAndUpdate(r._id, { isFollowedUp:true });
    }
    if (records.length > 0) console.log(`🔔 ${records.length} follow-up reminders sent`);
  } catch(e) { console.error("Follow-up cron:", e.message); }
});

console.log("⏰ Reminder jobs scheduled");
