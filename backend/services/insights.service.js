const axios = require("axios");
const CFG   = require("../config/openrouter");
const { DiagnosticInsight } = require("../models/phase5_6.models");
const HealthRecord  = require("../models/HealthRecord.model");
const { ChronicDisease, MedicationReminder } = require("../models/index");

async function callAI(prompt) {
  const res = await axios.post(`${CFG.baseURL}/chat/completions`, {
    model:CFG.model, messages:[{ role:"user", content:prompt }], max_tokens:600, temperature:0.5,
  }, { headers:{ Authorization:`Bearer ${CFG.apiKey}`, "Content-Type":"application/json", ...CFG.headers } });
  return res.data.choices[0].message.content.trim();
}

function safeJSON(raw, fallback={}) {
  try { return JSON.parse(raw.replace(/```json|```/g,"").trim()); } catch { return fallback; }
}

async function generatePatientInsights(patient) {
  const thirtyDays = new Date(Date.now()-30*86400000);
  const [records, chronic, reminders] = await Promise.all([
    HealthRecord.find({ patient:patient._id, createdAt:{$gte:thirtyDays} }).sort({createdAt:-1}).limit(20).select("symptoms riskLevel extractedSymptoms createdAt isEmergency"),
    ChronicDisease.find({ patient:patient._id, isActive:true }).select("diseaseName severity"),
    MedicationReminder.find({ patient:patient._id, isActive:true }).select("medicationName takenDates missedDates"),
  ]);
  if (records.length === 0) return [];

  const insights = [];
  const lang = patient.preferredLanguage || "hindi";

  // Risk trend
  const riskMap = { low:1, medium:2, high:3, emergency:4 };
  const scores  = records.map(r => riskMap[r.riskLevel]||1);
  const avg     = scores.reduce((a,b)=>a+b,0)/scores.length;
  const recent  = scores.slice(0,5).reduce((a,b)=>a+b,0)/Math.min(5,scores.length);
  if (recent > avg+0.5) {
    const r = safeJSON(await callAI(`Health is declining. Generate caring alert in ${lang}. Return JSON: {"title":"","body":"","severity":"warning"}`));
    if (r.title) insights.push({ insightType:"risk_trend", ...r });
  }

  // Recurring symptoms
  const symCount = {};
  records.flatMap(r=>r.extractedSymptoms||[]).forEach(s=>{ symCount[s]=(symCount[s]||0)+1; });
  const recurring = Object.entries(symCount).filter(([_,c])=>c>=3).map(([s])=>s);
  if (recurring.length > 0) {
    const r = safeJSON(await callAI(`Recurring symptoms: ${recurring.join(", ")}. Chronic: ${chronic.map(d=>d.diseaseName).join(", ")||"none"}. Insight in ${lang}. Return JSON: {"title":"","body":"","severity":"warning"}`));
    if (r.title) insights.push({ insightType:"condition_pattern", ...r });
  }

  // Seasonal
  const month  = new Date().getMonth()+1;
  const season = month>=6&&month<=9?"monsoon":month>=11||month<=2?"winter":"summer";
  const risks  = { monsoon:"dengue, malaria, diarrhea", winter:"cold, flu, pneumonia", summer:"heat stroke, dehydration" };
  const r4     = safeJSON(await callAI(`${season} season tip for rural India in ${lang}. Return JSON: {"title":"","body":"","severity":"info"}`));
  if (r4.title) insights.push({ insightType:"seasonal_risk", ...r4 });

  const saved = [];
  for (const ins of insights) {
    const doc = await DiagnosticInsight.create({ patient:patient._id, insightType:ins.insightType, title:ins.title, body:ins.body, severity:ins.severity||"info", language:lang, validUntil:new Date(Date.now()+7*86400000) });
    saved.push(doc);
  }
  return saved;
}

async function getPatientInsights(patientId) {
  return DiagnosticInsight.find({ patient:patientId, isRead:false, $or:[{validUntil:null},{validUntil:{$gte:new Date()}}] }).sort({createdAt:-1}).limit(10);
}

async function markInsightRead(id) {
  return DiagnosticInsight.findByIdAndUpdate(id, { isRead:true });
}

module.exports = { generatePatientInsights, getPatientInsights, markInsightRead };
