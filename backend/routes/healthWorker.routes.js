const express = require("express");
const router  = express.Router();
const { protect, authorize } = require("../middleware/index");
const User = require("../models/User.model");
const HealthRecord = require("../models/HealthRecord.model");

router.use(protect, authorize("healthWorker","admin"));

router.get("/dashboard", async (req,res) => {
  try {
    const hw = req.user;
    const patients = await User.find({ assignedHealthWorker:hw._id, role:"patient", isActive:true }).select("_id");
    const ids = patients.map(p=>p._id);
    const sevenDays = new Date(Date.now()-7*86400000);
    const [total, highRisk, recent] = await Promise.all([
      User.countDocuments({ assignedHealthWorker:hw._id, role:"patient", isActive:true }),
      HealthRecord.countDocuments({ patient:{$in:ids}, riskLevel:{$in:["high","emergency"]}, createdAt:{$gte:sevenDays} }),
      HealthRecord.find({ patient:{$in:ids} }).sort({createdAt:-1}).limit(5).populate("patient","fullName village"),
    ]);
    res.json({ success:true, data:{ totalPatients:total, highRiskCount:highRisk, recentActivity:recent, village:hw.village, district:hw.district } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.get("/patients", async (req,res) => {
  try {
    const patients = await User.find({ assignedHealthWorker:req.user._id, role:"patient", isActive:true }).select("fullName phone age gender village");
    res.json({ success:true, data:{ patients } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.get("/high-risk", async (req,res) => {
  try {
    const patients = await User.find({ assignedHealthWorker:req.user._id, role:"patient" }).select("_id");
    const ids = patients.map(p=>p._id);
    const sevenDays = new Date(Date.now()-7*86400000);
    const records = await HealthRecord.find({ patient:{$in:ids}, riskLevel:{$in:["high","emergency"]}, createdAt:{$gte:sevenDays} }).populate("patient","fullName phone village").sort({createdAt:-1});
    res.json({ success:true, data:{ records } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
