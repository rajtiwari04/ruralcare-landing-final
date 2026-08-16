const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/index");
const aiService   = require("../services/ai.service");
const HealthRecord= require("../models/HealthRecord.model");
const ChatMessage = require("../models/ChatMessage.model");
const crypto      = require("crypto");

// POST /api/chat/message
router.post("/message", protect, async (req, res) => {
  try {
    const { message, sessionId, fromTelegram=false } = req.body;
    const sid  = sessionId || crypto.randomUUID();
    const lang = await aiService.detectLanguage(message).catch(()=>req.user.preferredLanguage||"hindi");
    const hist = await ChatMessage.find({ patient:req.user._id, sessionId:sid }).sort({createdAt:1}).limit(8).select("role content");
    const response = await aiService.generateChatResponse(message, lang, hist.map(m=>({ role:m.role, content:m.content })));
    await ChatMessage.insertMany([
      { patient:req.user._id, role:"user",      content:message,   language:lang, sessionId:sid, fromTelegram },
      { patient:req.user._id, role:"assistant", content:response,  language:lang, sessionId:sid },
    ]);
    res.json({ success:true, data:{ response, language:lang, sessionId:sid } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// POST /api/chat/analyze-symptoms
router.post("/analyze-symptoms", protect, async (req, res) => {
  try {
    const { symptoms } = req.body;
    const { age, gender, preferredLanguage:language } = req.user;
    const analysis = await aiService.analyzeSymptoms(symptoms, language||"hindi", age, gender);
    const record   = await HealthRecord.create({
      patient:req.user._id, symptoms, language:language||"hindi",
      aiSummary:analysis.aiSummary, riskLevel:analysis.riskLevel,
      isEmergency:analysis.isEmergency, extractedSymptoms:analysis.extractedSymptoms||[],
      possibleConditions:analysis.possibleConditions||[], recommendedActions:analysis.recommendedActions||[],
      homeRemedies:analysis.homeRemedies||[],
    });
    res.json({ success:true, data:{ analysis, recordId:record._id } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// GET /api/chat/history
router.get("/history", protect, async (req, res) => {
  try {
    const { sessionId, limit=20 } = req.query;
    const q = { patient:req.user._id };
    if (sessionId) q.sessionId = sessionId;
    const messages = await ChatMessage.find(q).sort({createdAt:-1}).limit(Number(limit));
    res.json({ success:true, data:{ messages } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
