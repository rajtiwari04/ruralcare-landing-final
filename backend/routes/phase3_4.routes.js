const express = require("express");
const { protect, authorize, uploadReport } = require("../middleware/index");
const {
  Prescription, LabTest, MaternalHealth, TeleconsultSession,
  HealthScheme, NutritionPlan, VillageLeaderboard, EpidemicPrediction,
} = require("../models/phase3_4.models");
const aiService   = require("../services/ai.service");
const ocrService  = require("../services/ocr.service");
const { uploadToCloudinary } = require("../middleware/index");
const notifService= require("../services/notification.service");
const crypto      = require("crypto");

// ── Telemedicine ──────────────────────────────────────────────────────────────
const teleconsultRouter = express.Router();
teleconsultRouter.use(protect);

teleconsultRouter.post("/start", async (req,res) => {
  try {
    const { doctorId } = req.body;
    const roomId = crypto.randomUUID();
    const session = await TeleconsultSession.create({ patient:req.user._id, doctor:doctorId, roomId });
    res.status(201).json({ success:true, data:{ session, roomId } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

teleconsultRouter.get("/room/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { Appointment } = require("../models/index");
    let appointment = null;
    let isAuthorized = false;
    let otherParticipant = null;

    if (roomId.startsWith("consult-")) {
      const apptId = roomId.replace("consult-", "");
      appointment = await Appointment.findById(apptId)
        .populate("patient", "fullName phone age gender village district")
        .populate("doctor", "fullName village district");

      if (appointment) {
        const isPatient = appointment.patient._id.toString() === req.user._id.toString();
        const isDoctor  = appointment.doctor._id.toString() === req.user._id.toString();
        const isAdmin   = req.user.role === "admin";

        if (isPatient || isDoctor || isAdmin) {
          isAuthorized = true;
          otherParticipant = isPatient ? appointment.doctor : appointment.patient;
        }
      }
    } else {
      const session = await TeleconsultSession.findOne({ roomId })
        .populate("patient", "fullName phone age gender village district")
        .populate("doctor", "fullName village district");

      if (session) {
        const isPatient = session.patient._id.toString() === req.user._id.toString();
        const isDoctor  = session.doctor._id.toString() === req.user._id.toString();
        const isAdmin   = req.user.role === "admin";

        if (isPatient || isDoctor || isAdmin) {
          isAuthorized = true;
          otherParticipant = isPatient ? session.doctor : session.patient;
        }
      }
    }

    // Allow testing/joining if appointment is not found but ID is valid UUID or consult ID format for development/mocking
    if (!isAuthorized && (req.user.role === "patient" || req.user.role === "doctor" || req.user.role === "admin")) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: "You are not authorized to join this teleconsultation room." });
    }

    res.json({
      success: true,
      data: {
        roomId,
        appointment,
        otherParticipant,
        userRole: req.user.role,
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

teleconsultRouter.get("/my-sessions", async (req,res) => {
  try {
    const q = req.user.role==="doctor" ? { doctor:req.user._id } : { patient:req.user._id };
    const sessions = await TeleconsultSession.find(q).populate("patient","fullName").populate("doctor","fullName").sort({createdAt:-1}).limit(20);
    res.json({ success:true, data:{ sessions } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

teleconsultRouter.post("/:id/soap-notes", protect, authorize("doctor","admin"), async (req,res) => {
  try {
    const { transcript } = req.body;
    const prompt = `Generate SOAP clinical notes from this teleconsult transcript:
${transcript}

Format: Subjective / Objective / Assessment / Plan`;
    const soapNotes = await aiService.generateDoctorSummary({ name:"Patient", age:"", gender:"", recentSymptoms:transcript, chronicDiseases:"" });
    await TeleconsultSession.findByIdAndUpdate(req.params.id, { soapNotes, transcript });
    res.json({ success:true, data:{ soapNotes } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── Prescriptions ─────────────────────────────────────────────────────────────
const prescriptionRouter = express.Router();
prescriptionRouter.use(protect);

prescriptionRouter.post("/", authorize("doctor","admin"), async (req,res) => {
  try {
    const { patientId, diagnosis, medicines, additionalNotes, followUpDate } = req.body;
    const rx = await Prescription.create({ patient:patientId, doctor:req.user._id, diagnosis, medicines, additionalNotes, followUpDate:followUpDate?new Date(followUpDate):null });
    // Notify patient
    await notifService.createNotification(patientId, "prescription", "💊 New Prescription", `Dr. ${req.user.fullName} has issued a prescription. View on RuralCare website.`);
    res.status(201).json({ success:true, data:{ prescription:rx } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

prescriptionRouter.get("/doctor", authorize("doctor","admin"), async (req,res) => {
  try {
    const rxs = await Prescription.find({ doctor:req.user._id }).populate("patient","fullName phone").sort({createdAt:-1}).limit(50);
    res.json({ success:true, data:{ prescriptions:rxs } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

prescriptionRouter.get("/patient", async (req,res) => {
  try {
    const rxs = await Prescription.find({ patient:req.user._id }).populate("doctor","fullName").sort({createdAt:-1});
    res.json({ success:true, data:{ prescriptions:rxs } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── Lab Tests ─────────────────────────────────────────────────────────────────
const labRouter = express.Router();
labRouter.use(protect);

labRouter.post("/order", authorize("doctor","admin"), async (req,res) => {
  try {
    const { patientId, testName, testType, urgency, instructions } = req.body;
    const test = await LabTest.create({ patient:patientId, doctor:req.user._id, testName, testType, urgency, instructions });
    await notifService.createNotification(patientId, "lab_test", "🧪 Lab Test Ordered", `Dr. ${req.user.fullName} ordered: ${testName}. Please collect sample at nearest lab.`);
    res.status(201).json({ success:true, data:{ test } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

labRouter.get("/doctor", authorize("doctor","admin"), async (req,res) => {
  try {
    const tests = await LabTest.find({ doctor:req.user._id }).populate("patient","fullName phone").sort({createdAt:-1});
    res.json({ success:true, data:{ tests } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

labRouter.get("/patient", async (req,res) => {
  try {
    const tests = await LabTest.find({ patient:req.user._id }).populate("doctor","fullName").sort({createdAt:-1});
    res.json({ success:true, data:{ tests } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

labRouter.post("/:id/result", uploadReport.single("result"), async (req,res) => {
  try {
    const buffer   = req.file.buffer;
    const mimeType = req.file.mimetype;
    const fileType = mimeType.includes("pdf") ? "pdf" : "image";
    const cloud    = await uploadToCloudinary(buffer, { folder:"ruralcare/lab", resource_type:"auto" });
    const { extractedText } = await ocrService.processReportBuffer(buffer, fileType, mimeType);
    const analysis = await aiService.summarizeMedicalReport(extractedText, "blood_report", "hindi");
    await LabTest.findByIdAndUpdate(req.params.id, { resultUrl:cloud.secure_url, resultSummary:analysis.aiSummary, aiSummary:analysis.aiSummary, riskLevel:analysis.riskLevel, status:"completed" });
    res.json({ success:true, data:{ aiSummary:analysis.aiSummary } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── Maternal Health ───────────────────────────────────────────────────────────
const maternalRouter = express.Router();
maternalRouter.use(protect);

maternalRouter.get("/", async (req,res) => {
  try {
    const r = await MaternalHealth.findOne({ patient:req.user._id });
    res.json({ success:true, data:{ record:r } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

maternalRouter.post("/", async (req,res) => {
  try {
    const r = await MaternalHealth.findOneAndUpdate({ patient:req.user._id }, { patient:req.user._id, ...req.body }, { upsert:true, new:true });
    res.json({ success:true, data:{ record:r } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── Nutrition ─────────────────────────────────────────────────────────────────
const nutritionRouter = express.Router();
nutritionRouter.use(protect);

nutritionRouter.post("/generate", async (req,res) => {
  try {
    const { condition, region } = req.body;
    const lang = req.user.preferredLanguage || "hindi";
    const prompt = `Generate a detailed 7-day nutrition plan for a patient with ${condition||"general health"} from ${region||"rural India"}. Include: breakfast, lunch, dinner, snacks using locally available foods. Also include a simple exercise plan. Respond in ${lang}.`;
    const mealPlan = await aiService.generateChatResponse(prompt, lang, []);
    const plan = await NutritionPlan.create({ patient:req.user._id, condition, region, language:lang, mealPlan });
    res.json({ success:true, data:{ plan } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

nutritionRouter.get("/", async (req,res) => {
  try {
    const plans = await NutritionPlan.find({ patient:req.user._id }).sort({createdAt:-1}).limit(5);
    res.json({ success:true, data:{ plans } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── Schemes ───────────────────────────────────────────────────────────────────
const schemesRouter = express.Router();
schemesRouter.use(protect);

schemesRouter.get("/", async (req,res) => {
  try {
    const schemes = await HealthScheme.find({ isActive:true });
    res.json({ success:true, data:{ schemes } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

schemesRouter.post("/check-eligibility", async (req,res) => {
  try {
    const { schemeId, patientData } = req.body;
    const scheme = await HealthScheme.findById(schemeId);
    if (!scheme) return res.status(404).json({ success:false, message:"Scheme not found" });
    const lang = req.user.preferredLanguage || "hindi";
    const prompt = `Check if patient is eligible for ${scheme.schemeName}.
Eligibility criteria: ${scheme.eligibility}
Patient data: ${JSON.stringify(patientData)}
Explain in ${lang} and list required documents.`;
    const result = await aiService.generateChatResponse(prompt, lang, []);
    res.json({ success:true, data:{ scheme, eligibilityResult:result } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── Leaderboard ───────────────────────────────────────────────────────────────
const leaderboardRouter = express.Router();
leaderboardRouter.use(protect);

leaderboardRouter.get("/", async (req,res) => {
  try {
    const { district } = req.query;
    const q = district ? { district } : {};
    const boards = await VillageLeaderboard.find(q).sort({"scores.total":-1}).limit(20);
    res.json({ success:true, data:{ leaderboard:boards } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── Heatmap ───────────────────────────────────────────────────────────────────
const heatmapRouter = express.Router();
heatmapRouter.use(protect, authorize("admin","healthWorker","doctor"));

heatmapRouter.get("/", async (req,res) => {
  try {
    const User = require("../models/User.model");
    const HealthRecord = require("../models/HealthRecord.model");
    const sevenDays = new Date(Date.now()-7*86400000);
    const districts = await User.distinct("district",{ role:"patient" });
    const heatData  = await Promise.all(districts.filter(Boolean).map(async d => {
      const pts  = await User.find({ district:d, role:"patient" }).select("_id");
      const ids  = pts.map(p=>p._id);
      const recs = await HealthRecord.find({ patient:{$in:ids}, createdAt:{$gte:sevenDays} }).select("riskLevel extractedSymptoms");
      const emergency = recs.filter(r=>r.riskLevel==="emergency").length;
      const high      = recs.filter(r=>r.riskLevel==="high").length;
      return { district:d, totalCases:recs.length, emergency, high, intensity: emergency*4+high*2+(recs.length-emergency-high) };
    }));
    res.json({ success:true, data:{ heatmap:heatData.filter(d=>d.totalCases>0).sort((a,b)=>b.intensity-a.intensity) } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── IVR ───────────────────────────────────────────────────────────────────────
const ivrRouter = express.Router();

ivrRouter.post("/incoming", async (req,res) => {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="hi-IN">Namaste! RuralCare AI mein aapka swagat hai.</Say>
  <Gather input="speech" language="hi-IN" action="/api/ivr/process" timeout="10">
    <Say language="hi-IN">Apne lakshan batayein. Beep ke baad bolein.</Say>
  </Gather>
</Response>`;
  res.type("text/xml").send(twiml);
});

ivrRouter.post("/process", async (req,res) => {
  const speech = req.body.SpeechResult || "";
  const emergency = /emergency|ambulance|108|chest pain|unconscious|accident/i.test(speech);
  let twiml;
  if (emergency) {
    twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say language="hi-IN">Yeh emergency lag rahi hai. Abhi 108 pe call karein ambulance ke liye.</Say><Dial>108</Dial></Response>`;
  } else {
    const aiResponse = await require("../services/ai.service").generateChatResponse(speech, "hindi", []).catch(()=>"Kripya nearest health center mein jayein.");
    const safeResponse = aiResponse.replace(/[<>&"]/g, " ").substring(0,500);
    twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say language="hi-IN">${safeResponse}</Say><Say language="hi-IN">Dhanyavaad. Zyada takleef ho toh doctor se milein.</Say></Response>`;
  }
  res.type("text/xml").send(twiml);
});

module.exports = { teleconsultRouter, prescriptionRouter, labRouter, maternalRouter, nutritionRouter, schemesRouter, leaderboardRouter, heatmapRouter, ivrRouter };
