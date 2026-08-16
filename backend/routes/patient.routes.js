const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/index");
const HealthRecord  = require("../models/HealthRecord.model");
const User = require("../models/User.model");
const { MedicationReminder, ChronicDisease, Notification } = require("../models/index");
const aiService = require("../services/ai.service");

router.use(protect);

router.get("/health-history", async (req,res) => {
  try {
    const { limit=20 } = req.query;
    const records = await HealthRecord.find({ patient:req.user._id }).sort({createdAt:-1}).limit(Number(limit));
    res.json({ success:true, data:{ records } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.get("/health-score", async (req,res) => {
  try {
    const records = await HealthRecord.find({ patient:req.user._id }).sort({createdAt:-1}).limit(10).select("riskLevel isEmergency createdAt");
    const score   = await aiService.generateHealthScore(records);
    res.json({ success:true, data:{ ...score } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

/** Aggregated home overview for the patient dashboard shell */
router.get("/dashboard", async (req, res) => {
  try {
    const MedicalReport = require("../models/MedicalReport.model");
    const { Appointment } = require("../models/index");
    const now = new Date();
    const [
      scoreRecords,
      reminders,
      recentRecords,
      upcomingAppts,
      recentReports,
      unreadNotifs,
      chronicDiseases,
    ] = await Promise.all([
      HealthRecord.find({ patient: req.user._id }).sort({ createdAt: -1 }).limit(10).select("riskLevel isEmergency createdAt"),
      MedicationReminder.find({ patient: req.user._id, isActive: true }),
      HealthRecord.find({ patient: req.user._id }).sort({ createdAt: -1 }).limit(6),
      Appointment.find({
        patient: req.user._id,
        scheduledAt: { $gte: now },
        status: { $in: ["pending", "confirmed"] },
      })
        .sort({ scheduledAt: 1 })
        .limit(3)
        .populate("doctor", "fullName specialization"),
      MedicalReport.find({ patient: req.user._id }).sort({ createdAt: -1 }).limit(3),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
      ChronicDisease.find({ patient: req.user._id, isActive: true }),
    ]);

    const score = await aiService.generateHealthScore(scoreRecords);
    const nextAppointment = upcomingAppts[0] || null;

    res.json({
      success: true,
      data: {
        score,
        reminders,
        recentRecords,
        nextAppointment,
        upcomingAppointments: upcomingAppts,
        recentReports,
        unreadNotifications: unreadNotifs,
        chronicDiseases,
        stats: {
          activeReminders: reminders.length,
          upcomingAppointments: upcomingAppts.length,
          recentReports: recentReports.length,
          healthRecords: scoreRecords.length,
          chronicDiseases: chronicDiseases.length,
        },
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/medication-reminders", async (req,res) => {
  try {
    const reminders = await MedicationReminder.find({ patient:req.user._id, isActive:true });
    res.json({ success:true, data:{ reminders } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.post("/medication-reminders", async (req,res) => {
  try {
    const r = await MedicationReminder.create({ patient:req.user._id, ...req.body });
    res.status(201).json({ success:true, data:{ reminder:r } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("assignedHealthWorker", "fullName phone village district")
      .select("-password -otp");
    if (!user) return res.status(404).json({ success:false, message:"User not found" });

    const MedicalReport = require("../models/MedicalReport.model");
    const { Appointment } = require("../models/index");

    const [reportsCount, apptsCount, recordsCount, chronicDiseases, reminders] = await Promise.all([
      MedicalReport.countDocuments({ patient:req.user._id }),
      Appointment.countDocuments({ patient:req.user._id, scheduledAt:{ $gte:new Date() }, status:"confirmed" }),
      HealthRecord.countDocuments({ patient:req.user._id }),
      ChronicDisease.find({ patient:req.user._id, isActive:true }),
      MedicationReminder.find({ patient:req.user._id, isActive:true }),
    ]);

    res.json({
      success: true,
      data: {
        user,
        stats: {
          totalReports: reportsCount,
          upcomingAppointments: apptsCount,
          healthRecords: recordsCount,
          chronicDiseasesCount: chronicDiseases.length,
          activeRemindersCount: reminders.length,
        },
        chronicDiseases,
        reminders,
      }
    });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.put("/profile", async (req,res) => {
  try {
    const { fullName, age, gender, village, tehsil, district, preferredLanguage, bloodGroup, allergies, emergencyContact } = req.body;
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName.trim();
    if (age !== undefined) updateData.age = age ? Number(age) : null;
    if (gender !== undefined) updateData.gender = gender;
    if (village !== undefined) updateData.village = village.trim();
    if (tehsil !== undefined) updateData.tehsil = tehsil.trim();
    if (district !== undefined) updateData.district = district.trim();
    if (preferredLanguage !== undefined) updateData.preferredLanguage = preferredLanguage;
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;
    if (allergies !== undefined) updateData.allergies = allergies;
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new:true, runValidators:true })
      .populate("assignedHealthWorker", "fullName phone village district")
      .select("-password -otp");
    res.json({ success:true, data:{ user } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.get("/chronic-diseases", async (req,res) => {
  try {
    const d = await ChronicDisease.find({ patient:req.user._id, isActive:true });
    res.json({ success:true, data:{ diseases:d } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
