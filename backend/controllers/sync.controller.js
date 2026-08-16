const syncService = require("../services/sync.service");

const queueActions = async (req, res) => {
  try {
    const { actions } = req.body;
    if (!Array.isArray(actions)||actions.length===0) return res.status(400).json({ success:false, message:"No actions" });
    const queued = [];
    for (const a of actions) {
      const item = await syncService.queueOfflineAction(req.user._id, a.type, a.payload, a.timestamp);
      queued.push(item._id);
    }
    res.json({ success:true, data:{ queued:queued.length } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

const processQueue = async (req, res) => {
  try {
    const result = await syncService.processSyncQueue(req.user._id);
    res.json({ success:true, data:result });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

const getSyncStatus = async (req, res) => {
  try {
    const { SyncQueue } = require("../models/phase5_6.models");
    const pending = await SyncQueue.countDocuments({ patient:req.user._id, status:"pending" });
    const failed  = await SyncQueue.countDocuments({ patient:req.user._id, status:"failed" });
    res.json({ success:true, data:{ pending, failed } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

module.exports = { queueActions, processQueue, getSyncStatus };
