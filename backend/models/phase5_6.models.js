const mongoose = require("mongoose");

const analyticsEventSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref:"User" },
  eventType:  { type: String, required:true },
  properties: { type: mongoose.Schema.Types.Mixed, default:{} },
  district:   { type: String },
  language:   { type: String },
  platform:   { type: String, default:"web" },
  sessionId:  { type: String },
  durationMs: { type: Number, default:0 },
}, { timestamps: true });
analyticsEventSchema.index({ eventType:1, createdAt:-1 });
analyticsEventSchema.index({ district:1, createdAt:-1 });

const diagnosticInsightSchema = new mongoose.Schema({
  patient:     { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  insightType: { type: String, required:true },
  title:       { type: String, required:true },
  body:        { type: String, required:true },
  severity:    { type: String, enum:["info","warning","critical"], default:"info" },
  language:    { type: String, default:"hindi" },
  isRead:      { type: Boolean, default:false },
  validUntil:  { type: Date, default:null },
}, { timestamps: true });
diagnosticInsightSchema.index({ patient:1, isRead:1 });

const whatsappSessionSchema = new mongoose.Schema({
  waId:      { type: String, required:true, unique:true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref:"User", default:null },
  isLinked:  { type: Boolean, default:false },
  linkOTP:   { type: String, default:null },
  otpExpiry: { type: Date,   default:null },
  sessionId: { type: String, default:null },
  state:     { type: String, default:"idle" },
  language:  { type: String, default:"hindi" },
}, { timestamps: true });

const districtHealthReportSchema = new mongoose.Schema({
  district:   { type: String, required:true },
  weekNumber: { type: Number, required:true },
  year:       { type: Number, required:true },
  metrics:    { type: mongoose.Schema.Types.Mixed, default:{} },
  generatedAt:{ type: Date, default:Date.now },
}, { timestamps: true });
districtHealthReportSchema.index({ district:1, weekNumber:1, year:1 }, { unique:true });

const feedbackSchema = new mongoose.Schema({
  patient:      { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  feedbackType: { type: String, required:true },
  referenceId:  { type: mongoose.Schema.Types.ObjectId, default:null },
  rating:       { type: Number, min:1, max:5, required:true },
  comment:      { type: String, default:"" },
  language:     { type: String, default:"hindi" },
  platform:     { type: String, default:"web" },
}, { timestamps: true });

const syncQueueSchema = new mongoose.Schema({
  patient:    { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  actionType: { type: String, required:true },
  payload:    { type: mongoose.Schema.Types.Mixed, required:true },
  status:     { type: String, enum:["pending","synced","failed"], default:"pending" },
  syncedAt:   { type: Date, default:null },
  createdOfflineAt: { type: Date, required:true },
}, { timestamps: true });
syncQueueSchema.index({ patient:1, status:1 });

module.exports = {
  AnalyticsEvent:       mongoose.model("AnalyticsEvent",       analyticsEventSchema),
  DiagnosticInsight:    mongoose.model("DiagnosticInsight",     diagnosticInsightSchema),
  WhatsAppSession:      mongoose.model("WhatsAppSession",       whatsappSessionSchema),
  DistrictHealthReport: mongoose.model("DistrictHealthReport",  districtHealthReportSchema),
  Feedback:             mongoose.model("Feedback",              feedbackSchema),
  SyncQueue:            mongoose.model("SyncQueue",             syncQueueSchema),
};
