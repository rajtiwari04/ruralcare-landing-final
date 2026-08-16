const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  doctor:  { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  scheduledAt:   { type: Date, required:true },
  reason:        { type: String },
  consultationType: { type: String, enum:["in-person","telemedicine"], default:"in-person" },
  status:        { type: String, enum:["pending","confirmed","cancelled","completed"], default:"pending" },
  consultationNotes: { type: String, default:null },
  followUpRecommended: { type: Boolean, default:false },
  followUpDate:  { type: Date, default:null },
}, { timestamps: true });

const medicationReminderSchema = new mongoose.Schema({
  patient:        { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  medicationName: { type: String, required:true },
  dosage:         { type: String },
  frequency:      { type: String, default:"daily" },
  reminderTimes:  [{ type: String }],
  startDate:      { type: Date, required:true },
  endDate:        { type: Date },
  isActive:       { type: Boolean, default:true },
  takenDates:     [{ type: Date }],
  missedDates:    [{ type: Date }],
}, { timestamps: true });

const chronicDiseaseSchema = new mongoose.Schema({
  patient:     { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  diseaseName: { type: String, required:true },
  severity:    { type: String, enum:["mild","moderate","severe"], default:"mild" },
  medications: [{ type: String }],
  isActive:    { type: Boolean, default:true },
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  type:      { type: String, required:true },
  title:     { type: String, required:true },
  message:   { type: String, required:true },
  isRead:    { type: Boolean, default:false },
  sentViaTelegram: { type: Boolean, default:false },
}, { timestamps: true });

const diseaseAlertSchema = new mongoose.Schema({
  diseaseName:   { type: String, required:true },
  affectedArea:  { village:String, tehsil:String, district:String },
  caseCount:     { type: Number, default:0 },
  alertLevel:    { type: String, enum:["watch","warning","outbreak"], default:"watch" },
  preventiveTips:[{ type: String }],
  isActive:      { type: Boolean, default:true },
  resolvedAt:    { type: Date, default:null },
}, { timestamps: true });

module.exports = {
  Appointment:        mongoose.model("Appointment",        appointmentSchema),
  MedicationReminder: mongoose.model("MedicationReminder", medicationReminderSchema),
  ChronicDisease:     mongoose.model("ChronicDisease",     chronicDiseaseSchema),
  Notification:       mongoose.model("Notification",       notificationSchema),
  DiseaseAlert:       mongoose.model("DiseaseAlert",       diseaseAlertSchema),
};
