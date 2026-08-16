const axios = require("axios");
const CFG   = require("../config/openrouter");

async function callAI(messages, systemPrompt="", maxTokens=1000) {
  const res = await axios.post(`${CFG.baseURL}/chat/completions`, {
    model: CFG.model,
    messages: systemPrompt ? [{ role:"system", content:systemPrompt }, ...messages] : messages,
    max_tokens: maxTokens, temperature: 0.7,
  }, { headers: { Authorization:`Bearer ${CFG.apiKey}`, "Content-Type":"application/json", ...CFG.headers } });
  return res.data.choices[0].message.content.trim();
}

function safeJSON(raw, fallback={}) {
  try { return JSON.parse(raw.replace(/```json|```/g,"").trim()); }
  catch { return fallback; }
}

async function detectLanguage(text) {
  const r = await callAI([{ role:"user", content:`Detect language. Reply ONLY with one of: hindi english bhojpuri awadhi bengali marathi tamil telugu\n\nText: "${text}"` }]);
  const lang = r.toLowerCase().trim().split("\n")[0];
  const valid = ["hindi","english","bhojpuri","awadhi","bengali","marathi","tamil","telugu"];
  return valid.includes(lang) ? lang : "hindi";
}

async function generateChatResponse(userMessage, language, history=[]) {
  const sys = `You are RuralCare AI, a compassionate multilingual healthcare assistant for rural India.
Always respond in ${language}. Use simple words. Be empathetic.
For serious symptoms always recommend seeing a doctor.
Suggest basic home remedies for minor ailments.
Never diagnose — always say "this could be" not "you have".
End with: "Yeh advice doctor ki jagah nahi hai. Agar takleef zyada ho toh doctor se milein." (in ${language})`;
  return callAI([...history, { role:"user", content:userMessage }], sys);
}

async function analyzeSymptoms(symptoms, language, age, gender) {
  const sys = `Analyze symptoms. Patient: Age ${age}, Gender ${gender}.
Return ONLY valid JSON:
{"extractedSymptoms":[],"possibleConditions":[],"riskLevel":"low|medium|high|emergency","isEmergency":false,"recommendedActions":[],"homeRemedies":[],"aiSummary":"in ${language}","followUpRequired":false}`;
  const r = await callAI([{ role:"user", content:`Symptoms: ${symptoms}` }], sys);
  return safeJSON(r, { extractedSymptoms:[symptoms], riskLevel:"medium", isEmergency:false, aiSummary:r, homeRemedies:[], recommendedActions:["Consult a doctor"] });
}

async function summarizeMedicalReport(ocrText, reportType, language) {
  const sys = `Analyze ${reportType} report text (may have OCR noise). Respond in ${language}.
Return ONLY valid JSON:
{"aiSummary":"","keyFindings":[],"abnormalValues":[],"recommendations":[],"riskLevel":"normal|borderline|abnormal|critical"}`;
  const r = await callAI([{ role:"user", content:`Report:\n${ocrText}` }], sys);
  return safeJSON(r, { aiSummary:r, keyFindings:[], abnormalValues:[], recommendations:["Consult your doctor"], riskLevel:"normal" });
}

async function generateDoctorSummary(data) {
  return callAI([{ role:"user", content:`Clinical summary for doctor:\nPatient: ${data.name}, ${data.age}y ${data.gender}\nSymptoms: ${data.recentSymptoms}\nChronic: ${data.chronicDiseases||"None"}` }]);
}

async function generateHealthWorkerSummary(villageData, language="hindi") {
  return callAI([{ role:"user", content:`Daily health summary in ${language} for health worker.\nVillage: ${villageData.village}\nPatients: ${villageData.totalPatients}\nHigh risk: ${villageData.highRiskPatients}\nSymptoms: ${villageData.recentSymptoms}` }]);
}

async function generateHealthScore(history) {
  const r = await callAI([{ role:"user", content:`Health score 0-100 from: ${JSON.stringify(history)}\nReturn JSON: {"score":75,"grade":"Good|Fair|Poor|Critical","summary":"","improvementTips":[]}` }]);
  return safeJSON(r, { score:50, grade:"Fair", summary:r, improvementTips:[] });
}

async function generateFollowUpMessage(patient, lastRecord, language) {
  return callAI([{ role:"user", content:`Caring follow-up in ${language} for ${patient.fullName}. Last symptoms: ${lastRecord.symptoms}. Risk: ${lastRecord.riskLevel}.` }]);
}

async function detectOutbreakRisk(symptoms, area) {
  const r = await callAI([{ role:"user", content:`Outbreak risk for ${area}. Symptoms: ${JSON.stringify(symptoms)}\nReturn JSON: {"outbreakRisk":"low|medium|high","suspectedDiseases":[],"affectedCount":0,"alertMessage":"","preventiveMeasures":[],"shouldAlert":false}` }]);
  return safeJSON(r, { outbreakRisk:"low", shouldAlert:false });
}

module.exports = { detectLanguage, generateChatResponse, analyzeSymptoms, summarizeMedicalReport, generateDoctorSummary, generateHealthWorkerSummary, generateHealthScore, generateFollowUpMessage, detectOutbreakRisk };
