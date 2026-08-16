const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/index");
const { Notification } = require("../models/index");

router.use(protect);

router.get("/", async (req,res) => {
  try {
    const { limit=20, unreadOnly } = req.query;
    const q = { recipient:req.user._id };
    if (unreadOnly === "true") q.isRead = false;
    const notifs = await Notification.find(q).sort({createdAt:-1}).limit(Number(limit));
    const unread = await Notification.countDocuments({ recipient:req.user._id, isRead:false });
    res.json({ success:true, data:{ notifications:notifs, unreadCount:unread } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.put("/:id/read", async (req,res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead:true });
    res.json({ success:true });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.put("/mark-all-read", async (req,res) => {
  try {
    await Notification.updateMany({ recipient:req.user._id, isRead:false }, { isRead:true });
    res.json({ success:true });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
