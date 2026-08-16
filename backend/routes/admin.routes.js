const express = require("express");
const router  = express.Router();
const { protect, authorize } = require("../middleware/index");
const User = require("../models/User.model");
const { DiseaseAlert } = require("../models/index");

router.use(protect, authorize("admin"));

router.get("/dashboard", async (req,res) => {
  try {
    const [total, doctors, patients, healthWorkers, alerts] = await Promise.all([
      User.countDocuments({ isActive:true }),
      User.countDocuments({ role:"doctor", isActive:true }),
      User.countDocuments({ role:"patient", isActive:true }),
      User.countDocuments({ role:"healthWorker", isActive:true }),
      DiseaseAlert.countDocuments({ isActive:true }),
    ]);
    res.json({ success:true, data:{ totalUsers:total, doctors, patients, healthWorkers, activeAlerts:alerts } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.get("/users", async (req,res) => {
  try {
    const { role, page=1, limit=50, search } = req.query;
    const q = {};
    if (role)   q.role = role;
    if (search) q.$or  = [{ fullName:{$regex:search,$options:"i"} },{ phone:{$regex:search} }];
    const users = await User.find(q).select("-password -otp").sort({createdAt:-1}).limit(Number(limit)).skip((Number(page)-1)*Number(limit));
    const total = await User.countDocuments(q);
    res.json({ success:true, data:{ users, total } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.put("/users/:id/role", async (req,res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role:req.body.role }, { new:true }).select("-password");
    res.json({ success:true, data:{ user } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.get("/alerts", async (req,res) => {
  try {
    const alerts = await DiseaseAlert.find({ isActive:true }).sort({createdAt:-1});
    res.json({ success:true, data:{ alerts } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
