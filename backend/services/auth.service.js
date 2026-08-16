const jwt    = require("jsonwebtoken");
const crypto = require("crypto");
const axios  = require("axios");
const bcrypt = require("bcryptjs");
const User   = require("../models/User.model");
const notifService = require("./notification.service");

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

async function registerUser(data) {
  const { fullName, phone, password, age, gender, village, tehsil, district, preferredLanguage } = data;
  if (await User.findOne({ phone })) throw new Error("Phone number already registered");
  const user = await User.create({ fullName, phone, password, age, gender, village, tehsil, district, preferredLanguage });
  // Auto-assign nearest health worker
  const hw = await User.findOne({ role:"healthWorker", district, isActive:true });
  if (hw) {
    await User.findByIdAndUpdate(user._id, { assignedHealthWorker: hw._id });
    await notifService.sendNewPatientAlert(hw._id, user.fullName, village || district);
  }
  return { user, token: generateToken(user._id) };
}

async function loginUser(phone, password) {
  const user = await User.findOne({ phone, isActive: true });
  if (!user || !(await user.comparePassword(password))) throw new Error("Invalid phone or password");
  return { user, token: generateToken(user._id) };
}

async function linkTelegramAndSendOTP(phone, password, telegramChatId) {
  const user = await User.findOne({ phone, isActive: true });
  if (!user) throw new Error("Phone not found. Register at the RuralCare website first.");
  if (!(await user.comparePassword(password))) throw new Error("Incorrect password.");

  const otp = generateOTP();
  await User.findByIdAndUpdate(user._id, {
    telegramChatId: String(telegramChatId), isTelegramLinked: true,
    otp, otpExpiresAt: new Date(Date.now() + 10 * 60000),
  });

  await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    chat_id: String(telegramChatId), parse_mode: "Markdown",
    text: `🔐 *RuralCare AI — Verification OTP*

Hello *${user.fullName}*!

Your OTP is:

\`${otp}\`

Enter on website → Profile → Telegram Verification

⏰ Valid 10 minutes.`,
  }).catch(e => console.warn("OTP Telegram send failed:", e.message));

  return { user, token: generateToken(user._id), otpSent: true };
}

async function verifyOTP(userId, inputOTP) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  if (!user.otp || !user.otpExpiresAt) throw new Error("No OTP found. Link via Telegram bot: LINK <phone> <password>");
  if (new Date() > user.otpExpiresAt) throw new Error("OTP expired. Please re-link via Telegram bot.");
  if (user.otp !== String(inputOTP).trim()) throw new Error("Incorrect OTP.");
  await User.findByIdAndUpdate(userId, { isVerified: true, otp: null, otpExpiresAt: null });
  return true;
}

async function resendOTP(userId) {
  const user = await User.findById(userId);
  if (!user?.telegramChatId) throw new Error("Telegram not linked. Open bot and send: LINK <phone> <password>");
  const otp = generateOTP();
  await User.findByIdAndUpdate(userId, { otp, otpExpiresAt: new Date(Date.now() + 10 * 60000) });
  await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    chat_id: user.telegramChatId, text: `🔐 RuralCare OTP: ${otp}
Valid for 10 minutes.`
  }).catch(() => {});
  return true;
}

module.exports = { generateToken, registerUser, loginUser, linkTelegramAndSendOTP, verifyOTP, resendOTP };
