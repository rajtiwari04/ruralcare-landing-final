const cron = require("node-cron");

// Midnight — disease surveillance scan
cron.schedule("0 0 * * *", async () => {
  try {
    const HealthRecord   = require("../models/HealthRecord.model");
    const User           = require("../models/User.model");
    const aiService      = require("../services/ai.service");
    const notifService   = require("../services/notification.service");
    const { DiseaseAlert } = require("../models/index");

    const yesterday = new Date(Date.now() - 86400000);
    const districts = await User.distinct("district", { role:"patient", isActive:true });

    for (const district of districts) {
      if (!district) continue;
      const patients = await User.find({ district, role:"patient" }).select("_id");
      const ids      = patients.map(p=>p._id);
      const records  = await HealthRecord.find({ patient:{$in:ids}, createdAt:{$gte:yesterday} }).select("symptoms extractedSymptoms riskLevel");
      if (records.length < 3) continue;

      const symGroups = {};
      records.flatMap(r=>r.extractedSymptoms||[]).forEach(s=>{ symGroups[s]=(symGroups[s]||0)+1; });
      const spike = Object.entries(symGroups).filter(([_,c])=>c>=3);
      if (spike.length === 0) continue;

      const risk = await aiService.detectOutbreakRisk(spike.map(([s,c])=>({symptom:s,count:c})), district);
      if (risk.shouldAlert) {
        const alert = await DiseaseAlert.create({
          diseaseName:  risk.suspectedDiseases[0] || "Unknown",
          affectedArea: { district },
          caseCount:    records.length,
          alertLevel:   risk.outbreakRisk === "high" ? "outbreak" : "warning",
          preventiveTips: risk.preventiveMeasures || [],
        });

        // Notify all health workers in district
        const hws = await User.find({ role:"healthWorker", district, isActive:true }).select("_id");
        await notifService.sendOutbreakAlert(hws.map(h=>h._id), alert.diseaseName, district, alert.preventiveTips);
        console.log(`🚨 Outbreak alert: ${alert.diseaseName} in ${district}`);
      }
    }
    console.log("✅ Surveillance scan complete");
  } catch(e) { console.error("Surveillance cron:", e.message); }
});

console.log("🔬 Surveillance jobs scheduled");
