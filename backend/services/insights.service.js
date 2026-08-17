const axios = require("axios");
const CFG   = require("../config/openrouter");
const { DiagnosticInsight } = require("../models/phase5_6.models");
const HealthRecord  = require("../models/HealthRecord.model");
const { ChronicDisease, MedicationReminder } = require("../models/index");

async function callAI(prompt) {
  try {
    const res = await axios.post(`${CFG.baseURL}/chat/completions`, {
      model:CFG.model, messages:[{ role:"user", content:prompt }], max_tokens:600, temperature:0.5,
    }, { headers:{ Authorization:`Bearer ${CFG.apiKey}`, "Content-Type":"application/json", ...CFG.headers }, timeout:15000 });
    return res.data.choices[0].message.content.trim();
  } catch(e) {
    console.error("AI call failed in insights service:", e.message);
    return "";
  }
}

function safeJSON(raw, fallback={}) {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw.replace(/```json|```/g,"").trim());
  } catch { return fallback; }
}

async function generatePatientInsights(patient) {
  const thirtyDays = new Date(Date.now()-30*86400000);
  const [records, chronic, reminders] = await Promise.all([
    HealthRecord.find({ patient:patient._id, createdAt:{$gte:thirtyDays} }).sort({createdAt:-1}).limit(20).select("symptoms riskLevel extractedSymptoms createdAt isEmergency"),
    ChronicDisease.find({ patient:patient._id, isActive:true }).select("diseaseName severity"),
    MedicationReminder.find({ patient:patient._id, isActive:true }).select("medicationName takenDates missedDates"),
  ]);

  const insights = [];
  const lang = patient.preferredLanguage || "hindi";
  const month  = new Date().getMonth()+1;
  const season = month>=6&&month<=9?"monsoon":month>=11||month<=2?"winter":"summer";

  if (records.length > 0) {
    // Risk trend
    const riskMap = { low:1, medium:2, high:3, emergency:4 };
    const scores  = records.map(r => riskMap[r.riskLevel]||1);
    const avg     = scores.reduce((a,b)=>a+b,0)/scores.length;
    const recent  = scores.slice(0,5).reduce((a,b)=>a+b,0)/Math.min(5,scores.length);
    if (recent > avg+0.5) {
      const raw = await callAI(`Health risk is slightly elevated recently. Generate caring alert in ${lang}. Return JSON: {"title":"","body":"","severity":"warning"}`);
      const r = safeJSON(raw, {
        title: "Health Observation",
        body: "Your recent symptom reports indicate a slight increase in discomfort. Stay hydrated and monitor your health closely.",
        severity: "warning"
      });
      if (r.title) insights.push({ insightType:"risk_trend", ...r });
    }

    // Recurring symptoms
    const symCount = {};
    records.flatMap(r=>r.extractedSymptoms||[]).forEach(s=>{ symCount[s]=(symCount[s]||0)+1; });
    const recurring = Object.entries(symCount).filter(([_,c])=>c>=2).map(([s])=>s);
    if (recurring.length > 0) {
      const raw = await callAI(`Recurring symptoms: ${recurring.join(", ")}. Chronic: ${chronic.map(d=>d.diseaseName).join(", ")||"none"}. Insight in ${lang}. Return JSON: {"title":"","body":"","severity":"warning"}`);
      const r = safeJSON(raw, {
        title: "Recurring Symptom Pattern",
        body: `You have logged recurring symptoms (${recurring.join(", ")}). Consider scheduling a teleconsultation with a doctor.`,
        severity: "warning"
      });
      if (r.title) insights.push({ insightType:"condition_pattern", ...r });
    }
  }

  // Seasonal & general wellness alert
  const rawSeason = await callAI(`${season} season health and hygiene advice for rural India in ${lang}. Return JSON: {"title":"","body":"","severity":"info"}`);
  const fallbackSeasonal = {
    monsoon: { title: "Monsoon Health Advisory", body: "Boil drinking water and use mosquito prevention to protect against dengue and waterborne illnesses.", severity: "info" },
    winter: { title: "Winter Health Advisory", body: "Keep warm, stay hydrated, and protect yourself from seasonal respiratory infections.", severity: "info" },
    summer: { title: "Summer Heat Wave Advisory", body: "Drink plenty of water, avoid direct midday sun, and watch for signs of dehydration.", severity: "info" },
  };
  const r4 = safeJSON(rawSeason, fallbackSeasonal[season] || fallbackSeasonal.monsoon);
  if (r4.title) insights.push({ insightType:"seasonal_risk", ...r4 });

  // Medication adherence check if reminders exist
  if (reminders.length > 0) {
    insights.push({
      insightType: "medication_adherence",
      title: "Medication Schedule Active",
      body: `You have ${reminders.length} active medication reminder(s). Consistent adherence helps maintain your health.`,
      severity: "info",
    });
  }

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
