const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  patient:    { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  doctor:     { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  diagnosis:  { type: String },
  medicines:  [{
    name:         String, dosage:String, frequency:String,
    duration:String, instructions:String,
  }],
  additionalNotes: String,
  followUpDate:    { type: Date, default:null },
  pdfUrl:          { type: String, default:null },
  pdfPublicId:     { type: String, default:null },
  aiSafetyCheck:   { passed:Boolean, score:Number, notes:String },
}, { timestamps:true });

const labTestSchema = new mongoose.Schema({
  patient:     { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  doctor:      { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  testName:    { type: String, required:true },
  testType:    { type: String, enum:["blood","urine","stool","imaging","other"], default:"blood" },
  urgency:     { type: String, enum:["routine","urgent","stat"], default:"routine" },
  instructions:{ type: String },
  status:      { type: String, enum:["ordered","sample_collected","processing","completed","cancelled"], default:"ordered" },
  resultUrl:   { type: String, default:null },
  resultSummary:{ type: String, default:null },
  aiSummary:   { type: String, default:null },
  riskLevel:   { type: String, default:"normal" },
  orderedAt:   { type: Date, default:Date.now },
}, { timestamps:true });

const maternalHealthSchema = new mongoose.Schema({
  patient:          { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  pregnancyWeek:    { type: Number, default:0 },
  expectedDelivery: { type: Date },
  ancVisits:        [{ date:Date, weight:Number, bp:String, fetalHR:Number, notes:String }],
  riskLevel:        { type: String, enum:["low","medium","high"], default:"low" },
  children:         [{
    name:String, dob:Date, gender:String,
    vaccines:[{ name:String, dueDate:Date, givenDate:Date, status:{ type:String, enum:["due","given","overdue"], default:"due" } }],
    growthRecords:[{ date:Date, weight:Number, height:Number, notes:String }],
  }],
}, { timestamps:true });

const teleconsultSessionSchema = new mongoose.Schema({
  patient:   { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  doctor:    { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  roomId:    { type: String, required:true, unique:true },
  status:    { type: String, enum:["waiting","active","completed","missed"], default:"waiting" },
  startedAt: { type: Date, default:null },
  endedAt:   { type: Date, default:null },
  durationMs:{ type: Number, default:0 },
  transcript:{ type: String, default:null },
  soapNotes: { type: String, default:null },
  chatMessages:[{ sender:String, content:String, timestamp:{ type:Date, default:Date.now } }],
}, { timestamps:true });

const healthSchemeSchema = new mongoose.Schema({
  schemeName:    { type: String, required:true },
  schemeCode:    { type: String, required:true, unique:true },
  description:   { type: String },
  eligibility:   { type: String },
  benefits:      { type: String },
  coverageAmount:{ type: Number, default:0 },
  website:       { type: String },
  helplineNumber:{ type: String },
  categories:    [String],
  isActive:      { type: Boolean, default:true },
}, { timestamps:true });

const nutritionPlanSchema = new mongoose.Schema({
  patient:   { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  condition: { type: String },
  region:    { type: String },
  language:  { type: String, default:"hindi" },
  mealPlan:  { type: String },
  exercisePlan:{ type: String },
  generatedAt:{ type: Date, default:Date.now },
}, { timestamps:true });

const villageLeaderboardSchema = new mongoose.Schema({
  village:  { type: String, required:true },
  district: { type: String, required:true },
  scores: {
    medicationAdherence:{ type:Number, default:0 },
    followUpRate:       { type:Number, default:0 },
    ancCompliance:      { type:Number, default:0 },
    vaccinationRate:    { type:Number, default:0 },
    screeningRate:      { type:Number, default:0 },
    total:              { type:Number, default:0 },
  },
  grade:     { type: String, enum:["S","A","B","C","D"], default:"C" },
  rank:      { type: Number, default:0 },
  weekNumber:{ type: Number },
  year:      { type: Number },
}, { timestamps:true });

const epidemicPredictionSchema = new mongoose.Schema({
  district:         { type: String, required:true },
  predictedDisease: { type: String },
  riskProbability:  { type: Number, default:0 },
  forecastDays:     { type: Number, default:7 },
  trendData:        [{ date:Date, caseCount:Number, riskLevel:String }],
  seasonalFactor:   { type: String },
  alertLevel:       { type: String, enum:["low","medium","high"], default:"low" },
  generatedAt:      { type: Date, default:Date.now },
}, { timestamps:true });

module.exports = {
  Prescription:       mongoose.model("Prescription",       prescriptionSchema),
  LabTest:            mongoose.model("LabTest",            labTestSchema),
  MaternalHealth:     mongoose.model("MaternalHealth",     maternalHealthSchema),
  TeleconsultSession: mongoose.model("TeleconsultSession", teleconsultSessionSchema),
  HealthScheme:       mongoose.model("HealthScheme",       healthSchemeSchema),
  NutritionPlan:      mongoose.model("NutritionPlan",      nutritionPlanSchema),
  VillageLeaderboard: mongoose.model("VillageLeaderboard", villageLeaderboardSchema),
  EpidemicPrediction: mongoose.model("EpidemicPrediction", epidemicPredictionSchema),
};
