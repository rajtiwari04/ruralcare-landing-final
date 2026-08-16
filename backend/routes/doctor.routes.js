const express = require("express");
const router  = express.Router();
const { protect, authorize } = require("../middleware/index");
const User = require("../models/User.model");
const HealthRecord = require("../models/HealthRecord.model");
const { Appointment } = require("../models/index");

router.use(protect, authorize("doctor","admin"));

router.get("/dashboard", async (req,res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const sevenDays = new Date(Date.now()-7*86400000);
    const patientIds = await Appointment.distinct("patient", { doctor:req.user._id });
    const [todayAppts, pendingAppts, highRisk, todayList, recentHighRisk] = await Promise.all([
      Appointment.countDocuments({ doctor:req.user._id, scheduledAt:{$gte:today,$lt:tomorrow} }),
      Appointment.countDocuments({ doctor:req.user._id, status:"pending" }),
      HealthRecord.countDocuments({
        patient: { $in: patientIds },
        riskLevel:{$in:["high","emergency"]},
        createdAt:{$gte:sevenDays},
      }),
      Appointment.find({ doctor:req.user._id, scheduledAt:{$gte:today,$lt:tomorrow} })
        .sort({ scheduledAt: 1 })
        .populate("patient", "fullName phone age gender village district")
        .limit(12),
      HealthRecord.find({
        patient: { $in: patientIds },
        riskLevel:{$in:["high","emergency"]},
        createdAt:{$gte:sevenDays},
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("patient", "fullName village phone age"),
    ]);
    res.json({
      success:true,
      data:{
        todayAppointments:todayAppts,
        pendingAppointments:pendingAppts,
        totalPatients:patientIds.length,
        highRiskCount:highRisk,
        todaySchedule: todayList,
        attention: recentHighRisk,
      }
    });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.get("/patients", async (req,res) => {
  try {
    const { limit=50, page=1 } = req.query;
    const patientIds = await Appointment.distinct("patient", { doctor:req.user._id });
    const patients   = await User.find({ _id:{$in:patientIds} }).select("fullName phone age gender village district preferredLanguage").limit(Number(limit)).skip((Number(page)-1)*Number(limit));
    res.json({ success:true, data:{ patients, total:patientIds.length } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.get("/patients/:id", async (req,res) => {
  try {
    const patient = await User.findById(req.params.id).select("-password -otp");
    const records = await HealthRecord.find({ patient:req.params.id }).sort({createdAt:-1}).limit(10);
    res.json({ success:true, data:{ patient, recentRecords:records } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
