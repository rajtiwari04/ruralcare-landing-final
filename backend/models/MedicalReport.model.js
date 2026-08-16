const mongoose = require("mongoose");
const s = new mongoose.Schema({
  patient:     { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  reportType:  { type: String, enum:["blood_report","prescription","xray","other"], required:true },
  reportTitle: { type: String, default:"Medical Report" },
  fileUrl:     { type: String, required:true },
  filePublicId:{ type: String },
  fileType:    { type: String, enum:["image","pdf"] },
  extractedText:  { type: String, default:null },
  ocrConfidence:  { type: Number, default:null },
  aiSummary:      { type: String, default:null },
  keyFindings:    [{ type: String }],
  abnormalValues: [{ type: String }],
  recommendations:[{ type: String }],
  riskLevel:   { type: String, enum:["normal","borderline","abnormal","critical"], default:"normal" },
  status:      { type: String, enum:["pending","processing","completed","failed"], default:"pending" },
}, { timestamps: true });
s.index({ patient:1, createdAt:-1 });
module.exports = mongoose.model("MedicalReport", s);
