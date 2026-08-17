const MedicalReport = require("../models/MedicalReport.model");
const ocrService    = require("../services/ocr.service");
const aiService     = require("../services/ai.service");
const { uploadToCloudinary } = require("../middleware/index");

const uploadReport = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success:false, message:"No file uploaded" });
    const { reportType="other", reportTitle } = req.body;
    const buffer   = req.file.buffer;
    const mimeType = req.file.mimetype||"application/octet-stream";
    const origName = req.file.originalname||"";
    const isPDF    = mimeType.includes("pdf")||origName.toLowerCase().endsWith(".pdf");
    const fileType = isPDF ? "pdf" : "image";
    console.log("File:", origName, "| MIME:", mimeType, "| Type:", fileType, "| Size:", buffer.length);
    let cloudResult;
    try {
      cloudResult = await uploadToCloudinary(buffer, { folder:"ruralcare/reports", resource_type:"auto" });
    } catch(e) {
      return res.status(500).json({ success:false, message:"File upload failed: "+e.message });
    }
    const report = await MedicalReport.create({
      patient:req.user._id, reportType, fileType,
      reportTitle: reportTitle||(reportType.replace("_"," ")+" - "+new Date().toLocaleDateString()),
      fileUrl:cloudResult.secure_url, filePublicId:cloudResult.public_id, status:"processing",
    });
    processAsync(report._id, buffer, fileType, mimeType, reportType, req.user.preferredLanguage);
    res.status(201).json({ success:true, message:"Uploaded. AI analysis in progress...", data:{ reportId:report._id } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

async function processAsync(reportId, buffer, fileType, mimeType, reportType, language) {
  try {
    const { extractedText, confidence } = await ocrService.processReportBuffer(buffer, fileType, mimeType);
    const analysis = await aiService.summarizeMedicalReport(extractedText, reportType, language||"hindi");
    await MedicalReport.findByIdAndUpdate(reportId, {
      extractedText, ocrConfidence:confidence,
      aiSummary:analysis.aiSummary, keyFindings:analysis.keyFindings||[], abnormalValues:analysis.abnormalValues||[],
      recommendations:analysis.recommendations||[], riskLevel:analysis.riskLevel||"normal", status:"completed",
    });
    console.log("Report", reportId, "processed successfully");
  } catch(e) {
    await MedicalReport.findByIdAndUpdate(reportId, { status:"failed", aiSummary:e.message });
    console.error("Report", reportId, "failed:", e.message);
  }
}

const getMyReports = async (req, res) => {
  try {
    const { page=1, limit=10, reportType } = req.query;
    const q = { patient:req.user._id };
    if (reportType) q.reportType = reportType;
    const reports = await MedicalReport.find(q).sort({createdAt:-1}).limit(limit*1).skip((page-1)*limit).select("-extractedText");
    const total   = await MedicalReport.countDocuments(q);
    res.json({ success:true, data:{ reports, total } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

const getReport = async (req, res) => {
  try {
    const r = await MedicalReport.findOne({ _id:req.params.id, patient:req.user._id });
    if (!r) return res.status(404).json({ success:false, message:"Not found" });
    res.json({ success:true, data:{ report:r } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

const deleteReport = async (req, res) => {
  try {
    await MedicalReport.findOneAndDelete({ _id:req.params.id, patient:req.user._id });
    res.json({ success:true, message:"Deleted" });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

module.exports = { uploadReport, getMyReports, getReport, deleteReport };
