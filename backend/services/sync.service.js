const { SyncQueue } = require("../models/phase5_6.models");
const HealthRecord  = require("../models/HealthRecord.model");
const ChatMessage   = require("../models/ChatMessage.model");
const { MedicationReminder } = require("../models/index");
const aiService     = require("./ai.service");

async function processSyncQueue(patientId) {
  const pending = await SyncQueue.find({ patient:patientId, status:"pending" }).sort({ createdOfflineAt:1 }).limit(50);
  const results = [];
  for (const item of pending) {
    try {
      let result;
      if (item.actionType === "symptom_log") {
        const analysis = await aiService.analyzeSymptoms(item.payload.symptoms, item.payload.language||"hindi", item.payload.age, item.payload.gender);
        result = await HealthRecord.create({ patient:patientId, symptoms:item.payload.symptoms, language:item.payload.language||"hindi", aiSummary:analysis.aiSummary, riskLevel:analysis.riskLevel, isEmergency:analysis.isEmergency, extractedSymptoms:analysis.extractedSymptoms||[], recommendedActions:analysis.recommendedActions||[], homeRemedies:analysis.homeRemedies||[], createdAt:new Date(item.payload.timestamp||Date.now()) });
      } else if (item.actionType === "medication_taken") {
        result = await MedicationReminder.findOneAndUpdate({ _id:item.payload.reminderId, patient:patientId }, { $push:{ takenDates:new Date(item.payload.timestamp) } });
      }
      await SyncQueue.findByIdAndUpdate(item._id, { status:"synced", syncedAt:new Date() });
      results.push({ id:item._id, status:"synced" });
    } catch(err) {
      await SyncQueue.findByIdAndUpdate(item._id, { status:"failed" });
      results.push({ id:item._id, status:"failed", error:err.message });
    }
  }
  return { processed:results.length, results };
}

async function queueOfflineAction(patientId, actionType, payload, offlineTimestamp) {
  return SyncQueue.create({ patient:patientId, actionType, payload, createdOfflineAt:new Date(offlineTimestamp||Date.now()) });
}

module.exports = { processSyncQueue, queueOfflineAction };
