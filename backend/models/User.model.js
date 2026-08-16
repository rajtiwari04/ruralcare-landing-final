const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName:    { type: String, required: true, trim: true },
  phone:       { type: String, required: true, unique: true, trim: true },
  password:    { type: String, required: true },
  role:        { type: String, enum:["patient","doctor","healthWorker","admin"], default:"patient" },
  age:         { type: Number },
  gender:      { type: String, enum:["male","female","other"] },
  village:     { type: String, trim: true },
  tehsil:      { type: String, trim: true },
  district:    { type: String, trim: true },
  preferredLanguage: { type: String, enum:["hindi","english","bhojpuri","awadhi","bengali","marathi","tamil","telugu"], default:"hindi" },
  bloodGroup:    { type: String, enum:["A+","A-","B+","B-","AB+","AB-","O+","O-",""], default:"" },
  allergies:     { type: String, default:"" },
  emergencyContact: {
    name:         { type: String, default:"" },
    relationship: { type: String, default:"" },
    phone:        { type: String, default:"" },
  },
  telegramChatId:  { type: String, default: null },
  isTelegramLinked:{ type: Boolean, default: false },
  otp:           { type: String,  default: null },
  otpExpiresAt:  { type: Date,    default: null },
  isVerified:    { type: Boolean, default: false },
  assignedHealthWorker: { type: mongoose.Schema.Types.ObjectId, ref:"User", default: null },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(pw) {
  return bcrypt.compare(pw, this.password);
};

userSchema.methods.toJSON = function() {
  const o = this.toObject();
  delete o.password; delete o.otp;
  return o;
};

module.exports = mongoose.model("User", userSchema);
