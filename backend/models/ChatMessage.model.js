const mongoose = require("mongoose");
const s = new mongoose.Schema({
  patient:      { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  role:         { type: String, enum:["user","assistant"], required:true },
  content:      { type: String, required:true },
  language:     { type: String, default:"hindi" },
  sessionId:    { type: String, required:true },
  fromTelegram: { type: Boolean, default:false },
}, { timestamps: true });
s.index({ patient:1, sessionId:1, createdAt:1 });
module.exports = mongoose.model("ChatMessage", s);
