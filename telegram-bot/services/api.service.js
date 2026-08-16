const axios    = require("axios");
const API_URL  = process.env.BACKEND_API_URL || "http://localhost:5000/api";
const sessions = new Map();

function getHeaders(chatId) {
  const s = sessions.get(String(chatId));
  return s ? { Authorization:`Bearer ${s.token}` } : null;
}
async function loginByPhone(phone, password) {
  const res = await axios.post(`${API_URL}/auth/login`, { phone, password });
  return res.data.data;
}
async function linkAndSendOTP(phone, password, telegramChatId) {
  const res = await axios.post(`${API_URL}/auth/link-telegram-otp`, { phone, password, telegramChatId:String(telegramChatId) });
  return res.data.data;
}
function saveUserSession(chatId, token, user) { sessions.set(String(chatId), { token, user }); }
function getUserSession(chatId) { return sessions.get(String(chatId))||null; }
function isLoggedIn(chatId)     { return sessions.has(String(chatId)); }
async function sendChatMessage(chatId, message, sessionId) {
  const h = getHeaders(chatId); if (!h) throw new Error("NOT_LOGGED_IN");
  const res = await axios.post(`${API_URL}/chat/message`, { message, sessionId, fromTelegram:true }, { headers:h });
  return res.data.data;
}
async function analyzeSymptoms(chatId, symptoms) {
  const h = getHeaders(chatId); if (!h) throw new Error("NOT_LOGGED_IN");
  const res = await axios.post(`${API_URL}/chat/analyze-symptoms`, { symptoms }, { headers:h });
  return res.data.data;
}
async function getHealthHistory(chatId) {
  const h = getHeaders(chatId); if (!h) throw new Error("NOT_LOGGED_IN");
  const res = await axios.get(`${API_URL}/patient/health-history?limit=5`, { headers:h });
  return res.data.data.records;
}
async function getReminders(chatId) {
  const h = getHeaders(chatId); if (!h) throw new Error("NOT_LOGGED_IN");
  const res = await axios.get(`${API_URL}/patient/medication-reminders`, { headers:h });
  return res.data.data.reminders;
}
module.exports = { loginByPhone, linkAndSendOTP, saveUserSession, getUserSession, isLoggedIn, sendChatMessage, analyzeSymptoms, getHealthHistory, getReminders };
