const axios = require("axios");
const { WhatsAppSession } = require("../models/phase5_6.models");
const User = require("../models/User.model");

const WA_TOKEN    = process.env.WHATSAPP_TOKEN;
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WA_API_URL  = `https://graph.facebook.com/v18.0/${WA_PHONE_ID}/messages`;

async function sendTextMessage(waId, text) {
  if (!WA_TOKEN || !WA_PHONE_ID) return false;
  try {
    await axios.post(WA_API_URL, { messaging_product:"whatsapp", to:waId, type:"text", text:{body:text} }, { headers:{ Authorization:`Bearer ${WA_TOKEN}`, "Content-Type":"application/json" } });
    return true;
  } catch(err) { console.error("WA send error:", err.response?.data||err.message); return false; }
}

async function getSession(waId) {
  let s = await WhatsAppSession.findOne({ waId });
  if (!s) s = await WhatsAppSession.create({ waId });
  return s;
}

async function linkAccount(waId, phone, password) {
  const user = await User.findOne({ phone, isActive:true });
  if (!user) throw new Error("Phone not found. Register at the RuralCare website first.");
  const ok = await user.comparePassword(password);
  if (!ok) throw new Error("Incorrect password.");
  const crypto = require("crypto");
  const otp    = crypto.randomInt(100000, 999999).toString();
  await WhatsAppSession.findOneAndUpdate({ waId }, { userId:user._id, isLinked:true, linkOTP:otp, otpExpiry:new Date(Date.now()+10*60000), language:user.preferredLanguage }, { upsert:true, new:true });
  await sendTextMessage(waId, `🔐 *RuralCare AI — OTP*\n\nYour OTP: *${otp}*\n\nEnter on website → Profile → WhatsApp Verification\n\n⏰ Valid 10 minutes.`);
  const jwt   = require("jsonwebtoken");
  const token = jwt.sign({ id:user._id }, process.env.JWT_SECRET, { expiresIn:"7d" });
  return { user, token };
}

async function downloadMedia(mediaId) {
  if (!WA_TOKEN) throw new Error("WhatsApp not configured");
  const urlRes = await axios.get(`https://graph.facebook.com/v18.0/${mediaId}`, { headers:{ Authorization:`Bearer ${WA_TOKEN}` } });
  const fileRes= await axios.get(urlRes.data.url, { responseType:"arraybuffer", headers:{ Authorization:`Bearer ${WA_TOKEN}` }, timeout:30000 });
  return { buffer:Buffer.from(fileRes.data), mimeType:urlRes.data.mime_type||"application/octet-stream" };
}

module.exports = { sendTextMessage, getSession, linkAccount, downloadMedia };
