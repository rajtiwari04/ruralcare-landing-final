const axios = require("axios");
const User  = require("../models/User.model");
const { Notification } = require("../models/index");

const TG = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function sendTelegramMessage(chatId, message) {
  if (!chatId) return false;
  try {
    await axios.post(`${TG}/sendMessage`, { chat_id:String(chatId), text:message, parse_mode:"HTML" });
    return true;
  } catch { return false; }
}

async function createNotification(recipientId, type, title, message) {
  const n    = await Notification.create({ recipient:recipientId, type, title, message });
  const user = await User.findById(recipientId).select("telegramChatId isTelegramLinked");
  if (user?.isTelegramLinked && user?.telegramChatId) {
    const sent = await sendTelegramMessage(user.telegramChatId, `🏥 <b>${title}</b>\n\n${message}`);
    if (sent) await Notification.findByIdAndUpdate(n._id, { sentViaTelegram:true });
  }
  return n;
}

async function sendMedicationReminder(patientId, med, time) {
  return createNotification(patientId, "medication_reminder", "💊 Medication Reminder",
    `Time to take: <b>${med}</b>\nScheduled: ${time}`);
}

async function sendAppointmentReminder(patientId, doctorName, dateTime) {
  const prefix = /^dr[\.\ ]/i.test(doctorName) ? "" : "Dr. ";
  return createNotification(patientId, "appointment_reminder", "📅 Appointment Reminder",
    `Your appointment with <b>${prefix}${doctorName}</b>\nDate: ${dateTime}\n\nPlease be on time.`);
}

async function sendHighRiskAlert(patientId, summary) {
  return createNotification(patientId, "high_risk_alert", "⚠️ Health Alert",
    `${summary}\n\n<b>Please consult a doctor as soon as possible.</b>`);
}

async function sendNewPatientAlert(hwId, name, village) {
  return createNotification(hwId, "new_patient", "👤 New Patient",
    `<b>${name}</b> from ${village} assigned to you.`);
}

async function sendOutbreakAlert(userIds, disease, area, tips) {
  const msg = `⚠️ <b>Alert — ${area}</b>\n\nHigh ${disease} cases detected.\n\n<b>Prevention:</b>\n${tips.map((t,i)=>`${i+1}. ${t}`).join("\n")}`;
  return Promise.allSettled(userIds.map(id => createNotification(id, "outbreak_alert", `🚨 ${disease}`, msg)));
}

async function sendFollowUpReminder(patientId, message) {
  return createNotification(patientId, "follow_up", "🔔 Follow-Up", message);
}

module.exports = { sendTelegramMessage, createNotification, sendMedicationReminder, sendAppointmentReminder, sendHighRiskAlert, sendNewPatientAlert, sendOutbreakAlert, sendFollowUpReminder };
