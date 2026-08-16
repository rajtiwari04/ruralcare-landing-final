const jwt    = require("jsonwebtoken");
const crypto = require("crypto");
const axios  = require("axios");
const bcrypt = require("bcryptjs");
const User   = require("../models/User.model");
const notificationService = require("../services/notification.service");

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN||"7d" });
}

const register = async (req, res) => {
  try {
    const { fullName, phone, password, age, gender, village, tehsil, district, preferredLanguage } = req.body;
    if (await User.findOne({ phone })) return res.status(400).json({ success:false, message:"Phone already registered" });
    const user = await User.create({ fullName, phone, password, age, gender, village, tehsil, district, preferredLanguage });
    // Auto-assign health worker
    const hw = await User.findOne({ role:"healthWorker", district, isActive:true });
    if (hw) {
      await User.findByIdAndUpdate(user._id, { assignedHealthWorker: hw._id });
      await notificationService.sendNewPatientAlert(hw._id, user.fullName, village||district);
    }
    res.status(201).json({ success:true, data:{ user, token:generateToken(user._id) } });
  } catch(e) { res.status(400).json({ success:false, message:e.message }); }
};

const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone, isActive:true });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ success:false, message:"Invalid credentials" });
    res.json({ success:true, data:{ user, token:generateToken(user._id) } });
  } catch(e) { res.status(401).json({ success:false, message:e.message }); }
};

const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate("assignedHealthWorker", "fullName phone village district").select("-password -otp");
  res.json({ success:true, data:{ user } });
};

const linkTelegramOTP = async (req, res) => {
  try {
    const { phone, password, telegramChatId } = req.body;
    if (!phone||!password||!telegramChatId) return res.status(400).json({ success:false, message:"phone, password and telegramChatId required" });
    const user = await User.findOne({ phone, isActive:true });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ success:false, message:"Invalid credentials" });
    const otp = crypto.randomInt(100000,999999).toString();
    const exp = new Date(Date.now()+10*60000);
    await User.findByIdAndUpdate(user._id, { telegramChatId:String(telegramChatId), isTelegramLinked:true, otp, otpExpiresAt:exp });
    // Send OTP via Telegram
    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id:String(telegramChatId), parse_mode:"Markdown",
      text:`🔐 *RuralCare AI — Verification OTP*\n\nHello *${user.fullName}*!\n\nYour OTP is:\n\n\`${otp}\`\n\nEnter on website → Profile → Telegram Verification\n\n⏰ Valid 10 minutes.`,
    }).catch(e => console.warn("OTP send failed:", e.message));
    res.json({ success:true, message:"Telegram linked and OTP sent", data:{ user, token:generateToken(user._id) } });
  } catch(e) { res.status(400).json({ success:false, message:e.message }); }
};

const requestOTP = async (req, res) => {
  try {
    const user = req.user;
    if (!user.isTelegramLinked||!user.telegramChatId) {
      return res.json({ success:true, linked:false, botUsername:process.env.TELEGRAM_BOT_USERNAME||"GramSwasthya_ai_bot" });
    }
    const otp = crypto.randomInt(100000,999999).toString();
    await User.findByIdAndUpdate(user._id, { otp, otpExpiresAt:new Date(Date.now()+10*60000) });
    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id:user.telegramChatId, text:`🔐 RuralCare OTP: ${otp}\nValid 10 minutes.`
    }).catch(()=>{});
    res.json({ success:true, linked:true, message:"OTP sent to Telegram" });
  } catch(e) { res.status(400).json({ success:false, message:e.message }); }
};

const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const user    = req.user;
    if (!user.otp||!user.otpExpiresAt) return res.status(400).json({ success:false, message:"No OTP. Link via Telegram bot first." });
    if (new Date() > user.otpExpiresAt) return res.status(400).json({ success:false, message:"OTP expired" });
    if (user.otp !== String(otp).trim()) return res.status(400).json({ success:false, message:"Incorrect OTP" });
    await User.findByIdAndUpdate(user._id, { isVerified:true, otp:null, otpExpiresAt:null });
    res.json({ success:true, message:"✅ Account verified!" });
  } catch(e) { res.status(400).json({ success:false, message:e.message }); }
};

module.exports = { register, login, getMe, linkTelegramOTP, requestOTP, verifyOTP };
