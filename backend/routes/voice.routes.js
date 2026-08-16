const express  = require("express");
const axios    = require("axios");
const FormData = require("form-data");
const router   = express.Router();
const { protect, uploadAudio, uploadToCloudinary } = require("../middleware/index");
const aiService   = require("../services/ai.service");
const ChatMessage = require("../models/ChatMessage.model");
const analyticsService = require("../services/analytics.service");

const STT_URL      = process.env.STT_SERVER_URL || "http://localhost:8765/transcribe";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function transcribeGroq(buffer, filename) {
  if (!GROQ_API_KEY) return null;
  try {
    const form = new FormData();
    form.append("file",  buffer, { filename: filename || "voice.ogg", contentType: "audio/ogg" });
    form.append("model", "whisper-large-v3");
    const res = await axios.post("https://api.groq.com/openai/v1/audio/transcriptions", form, {
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, ...form.getHeaders() }, timeout: 30000,
    });
    const text = (res.data.text || "").trim();
    const langMap = { hi:"hindi", en:"english", bn:"bengali", mr:"marathi", ta:"tamil", te:"telugu" };
    return text ? { text, language: langMap[res.data.language] || "hindi" } : null;
  } catch(e) { console.error("Groq STT:", e.response?.data?.error?.message || e.message); return null; }
}

async function transcribeSidecar(buffer, filename) {
  try {
    const form = new FormData();
    form.append("audio", buffer, { filename: filename || "voice.ogg", contentType: "audio/ogg" });
    const res = await axios.post(STT_URL, form, {
      headers: form.getHeaders(), timeout: 60000, maxContentLength: Infinity, maxBodyLength: Infinity,
    });
    const text = (res.data.text || "").trim();
    return text ? { text, language: res.data.language || "hindi" } : null;
  } catch(e) { console.error("Sidecar STT:", e.message); return null; }
}

router.post("/", protect, uploadAudio.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success:false, message:"No audio file" });
    const buffer   = req.file.buffer;
    const filename = req.file.originalname || "voice.ogg";
    let transcript = null, language = req.user.preferredLanguage || "hindi";

    // Try Groq first, then local sidecar
    const groqResult    = await transcribeGroq(buffer, filename);
    if (groqResult)    { transcript = groqResult.text; language = groqResult.language; }
    if (!transcript)   {
      const sideResult  = await transcribeSidecar(buffer, filename);
      if (sideResult)  { transcript = sideResult.text; language = sideResult.language; }
    }

    if (!transcript) {
      return res.status(503).json({ success:false, noSTT:true, message:"Voice transcription unavailable. Type your symptoms instead.", hint:"Add GROQ_API_KEY to .env (free at console.groq.com)" });
    }

    const detectedLang = await aiService.detectLanguage(transcript).catch(() => language);
    const sessionId    = req.body.sessionId || require("crypto").randomUUID();
    const history      = await ChatMessage.find({ patient:req.user._id, sessionId }).sort({createdAt:1}).limit(6).select("role content");
    const aiResponse   = await aiService.generateChatResponse(transcript, detectedLang, history.map(m=>({role:m.role,content:m.content})));

    await ChatMessage.insertMany([
      { patient:req.user._id, role:"user",      content:transcript, language:detectedLang, sessionId },
      { patient:req.user._id, role:"assistant", content:aiResponse, language:detectedLang, sessionId },
    ]);

    // Non-blocking audio storage + analytics
    uploadToCloudinary(buffer, { folder:"ruralcare/audio", resource_type:"video" }).catch(()=>{});
    analyticsService.track(req.user._id, "voice_used", { language:detectedLang }, "web").catch(()=>{});

    res.json({ success:true, data:{ transcript, aiResponse, language:detectedLang, sessionId } });
  } catch(e) { console.error("Voice route:", e.message); res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
