const { AnalyticsEvent, DistrictHealthReport } = require("../models/phase5_6.models");
const HealthRecord  = require("../models/HealthRecord.model");
const MedicalReport = require("../models/MedicalReport.model");
const ChatMessage   = require("../models/ChatMessage.model");
const User          = require("../models/User.model");

async function track(userId, eventType, properties={}, platform="web") {
  try {
    const user = userId ? await User.findById(userId).select("district preferredLanguage") : null;
    await AnalyticsEvent.create({ userId, eventType, properties, district:user?.district, language:user?.preferredLanguage||properties.language, platform, sessionId:properties.sessionId, durationMs:properties.durationMs||0 });
  } catch(err) { console.warn("Analytics track error:", err.message); }
}

async function getPlatformStats(days=30) {
  const since = new Date(Date.now()-days*86400000);
  return AnalyticsEvent.aggregate([{ $match:{createdAt:{$gte:since}} },{ $group:{_id:"$platform",count:{$sum:1}} },{ $sort:{count:-1} }]);
}

async function getTopSymptoms(days=14, district=null) {
  const since = new Date(Date.now()-days*86400000);
  const match = { createdAt:{$gte:since} };
  if (district) {
    const patients = await User.find({ district, role:"patient" }).select("_id");
    match.patient = { $in: patients.map(p=>p._id) };
  }
  return HealthRecord.aggregate([{ $match:match },{ $unwind:"$extractedSymptoms" },{ $group:{_id:"$extractedSymptoms",count:{$sum:1}} },{ $sort:{count:-1} },{ $limit:15 }]);
}

async function getDistrictMetrics(district, days=7) {
  const since = new Date(Date.now()-days*86400000);
  const patients = await User.find({ district, role:"patient" }).select("_id");
  const ids = patients.map(p=>p._id);
  const [totalConsultations, emergencyCases, reportUploads, chatMessages] = await Promise.all([
    HealthRecord.countDocuments({ patient:{$in:ids}, createdAt:{$gte:since} }),
    HealthRecord.countDocuments({ patient:{$in:ids}, isEmergency:true, createdAt:{$gte:since} }),
    MedicalReport.countDocuments({ patient:{$in:ids}, createdAt:{$gte:since} }),
    ChatMessage.countDocuments({ patient:{$in:ids}, role:"user", createdAt:{$gte:since} }),
  ]);
  const topSymptoms = await getTopSymptoms(days, district);
  return { district, period:`${days} days`, totalPatients:ids.length, totalConsultations, emergencyCases, reportUploads, chatMessages, topSymptoms:topSymptoms.slice(0,5) };
}

async function getSystemMetrics(days=30) {
  const since = new Date(Date.now()-days*86400000);
  const [totalUsers, newUsers, totalConsultations, totalReports, emergencies, platformStats, dailyTrend, languageDist, riskDist] = await Promise.all([
    User.countDocuments({ isActive:true }),
    User.countDocuments({ createdAt:{$gte:since} }),
    HealthRecord.countDocuments({ createdAt:{$gte:since} }),
    MedicalReport.countDocuments({ createdAt:{$gte:since} }),
    HealthRecord.countDocuments({ isEmergency:true, createdAt:{$gte:since} }),
    getPlatformStats(days),
    HealthRecord.aggregate([{ $match:{createdAt:{$gte:since}} },{ $group:{_id:{$dateToString:{format:"%Y-%m-%d",date:"$createdAt"}},count:{$sum:1}} },{ $sort:{_id:1} }]),
    HealthRecord.aggregate([{ $match:{createdAt:{$gte:since}} },{ $group:{_id:"$language",count:{$sum:1}} },{ $sort:{count:-1} }]),
    HealthRecord.aggregate([{ $match:{createdAt:{$gte:since}} },{ $group:{_id:"$riskLevel",count:{$sum:1}} }]),
  ]);
  return { period:`${days} days`, totalUsers, newUsers, totalConsultations, totalReports, emergencies, platformStats, dailyTrend, languageDist, riskDist, topSymptoms: await getTopSymptoms(days) };
}

async function generateWeeklyReport(district) {
  const now = new Date();
  const wn  = Math.ceil((now-new Date(now.getFullYear(),0,1))/604800000);
  const metrics = await getDistrictMetrics(district, 7);
  await DistrictHealthReport.findOneAndUpdate({ district, weekNumber:wn, year:now.getFullYear() }, { $set:{metrics, generatedAt:now} }, { upsert:true, new:true });
  return metrics;
}

module.exports = { track, getPlatformStats, getTopSymptoms, getDistrictMetrics, getSystemMetrics, generateWeeklyReport };
