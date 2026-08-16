const analyticsService = require("../services/analytics.service");
const insightsService  = require("../services/insights.service");
const feedbackService  = require("../services/feedback.service");

const getSystemMetrics = async (req, res) => {
  try {
    const data = await analyticsService.getSystemMetrics(parseInt(req.query.days)||30);
    res.json({ success:true, data });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

const getDistrictMetrics = async (req, res) => {
  try {
    const district = req.query.district || req.user.district;
    const data = await analyticsService.getDistrictMetrics(district, parseInt(req.query.days)||14);
    res.json({ success:true, data });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

const getTopSymptoms = async (req, res) => {
  try {
    const data = await analyticsService.getTopSymptoms(parseInt(req.query.days)||14, req.query.district||null);
    res.json({ success:true, data });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

const trackEvent = async (req, res) => {
  try {
    await analyticsService.track(req.user._id, req.body.eventType, req.body.properties, req.body.platform||"web");
    res.json({ success:true });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

const getMyInsights = async (req, res) => {
  try {
    const insights = await insightsService.getPatientInsights(req.user._id);
    res.json({ success:true, data:{ insights } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

const generateInsights = async (req, res) => {
  try {
    const User    = require("../models/User.model");
    const patient = await User.findById(req.params.patientId || req.user._id);
    if (!patient) return res.status(404).json({ success:false, message:"Patient not found" });
    const insights = await insightsService.generatePatientInsights(patient);
    res.json({ success:true, data:{ insights, count:insights.length } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

const markInsightRead = async (req, res) => {
  try {
    await insightsService.markInsightRead(req.params.id);
    res.json({ success:true });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

const submitFeedback = async (req, res) => {
  try {
    const { feedbackType, referenceId, rating, comment } = req.body;
    const fb = await feedbackService.submitFeedback(req.user._id, feedbackType, referenceId, rating, comment, req.user.preferredLanguage, "web");
    res.status(201).json({ success:true, data:{ feedback:fb } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

const getFeedbackStats = async (req, res) => {
  try {
    const stats = await feedbackService.getFeedbackStats(parseInt(req.query.days)||30);
    res.json({ success:true, data:stats });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

module.exports = { getSystemMetrics, getDistrictMetrics, getTopSymptoms, trackEvent, getMyInsights, generateInsights, markInsightRead, submitFeedback, getFeedbackStats };
