const mongoose = require("mongoose");
const s = new mongoose.Schema({
  patient:            { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  symptoms:           { type: String, required:true },
  language:           { type: String, default:"hindi" },
  inputType:          { type: String, enum:["text","voice","report","telegram"], default:"text" },
  audioUrl:           { type: String, default:null },
  transcript:         { type: String, default:null },
  aiAnalysis:         { type: String, default:null },
  aiSummary:          { type: String, default:null },
  riskLevel:          { type: String, enum:["low","medium","high","emergency"], default:"low" },
  isEmergency:        { type: Boolean, default:false },
  extractedSymptoms:  [{ type: String }],
  possibleConditions: [{ type: String }],
  recommendedActions: [{ type: String }],
  homeRemedies:       [{ type: String }],
  followUpDate:       { type: Date, default:null },
  followUpMessage:    { type: String, default:null },
  isFollowedUp:       { type: Boolean, default:false },
  doctorNotes:        { type: String, default:null },
  healthWorkerNotes:  { type: String, default:null },
}, { timestamps: true });
s.index({ patient:1, createdAt:-1 });
s.index({ riskLevel:1 });
module.exports = mongoose.model("HealthRecord", s);
