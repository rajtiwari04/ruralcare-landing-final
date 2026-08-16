const { Appointment } = require("../models/index");
const User = require("../models/User.model");
const notifService = require("../services/notification.service");

function fmtDoc(name="") { return /^dr[\.\ ]/i.test(name) ? name : "Dr. "+name; }

const bookAppointment = async (req, res) => {
  try {
    const { doctorId, scheduledAt, reason, consultationType } = req.body;
    const doctor = await User.findOne({ _id:doctorId, role:"doctor", isActive:true });
    if (!doctor) return res.status(404).json({ success:false, message:"Doctor not found" });
    const appt = await Appointment.create({ patient:req.user._id, doctor:doctorId, scheduledAt:new Date(scheduledAt), reason, consultationType:consultationType||"in-person" });
    const dt   = new Date(scheduledAt).toLocaleString("en-IN",{ day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit" });
    await notifService.sendAppointmentReminder(req.user._id, doctor.fullName, dt);
    await notifService.createNotification(doctorId, "new_patient", "📅 New Appointment", `<b>${req.user.fullName}</b> booked appointment.\nDate: ${dt}\nReason: ${reason||"Not specified"}`);
    res.status(201).json({ success:true, data:{ appointment:appt } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

const getMyAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const q = { patient:req.user._id };
    if (status) q.status = status;
    const appts = await Appointment.find(q).populate("doctor","fullName village district").sort({scheduledAt:-1});
    res.json({ success:true, data:{ appointments:appts } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

const getDoctorAppointments = async (req, res) => {
  try {
    const { status, date } = req.query;
    const q = { doctor:req.user._id };
    if (status) q.status = status;
    if (date) { const d=new Date(date); d.setHours(0,0,0,0); const e=new Date(date); e.setHours(23,59,59,999); q.scheduledAt={$gte:d,$lte:e}; }
    const appts = await Appointment.find(q).populate("patient","fullName phone age gender village district").sort({scheduledAt:1});
    res.json({ success:true, data:{ appointments:appts } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, consultationNotes, followUpDate } = req.body;
    const appt = await Appointment.findByIdAndUpdate(req.params.id, { status, consultationNotes, followUpDate:followUpDate?new Date(followUpDate):undefined, followUpRecommended:!!followUpDate }, { new:true }).populate("patient","fullName _id").populate("doctor","fullName");
    if (!appt) return res.status(404).json({ success:false, message:"Not found" });
    const msgs = { confirmed:`✅ Appointment confirmed with ${fmtDoc(appt.doctor?.fullName)}.`, cancelled:`❌ Appointment cancelled.`, completed:`✅ Consultation complete.${followUpDate?" Follow-up: "+new Date(followUpDate).toLocaleDateString("en-IN"):""}` };
    if (msgs[status]) await notifService.createNotification(appt.patient._id,"appointment_reminder","Appointment Update",msgs[status]);
    res.json({ success:true, data:{ appointment:appt } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

const listDoctors = async (req, res) => {
  try {
    const { district } = req.query;
    const q = { role:"doctor", isActive:true };
    if (district) q.district = district;
    const doctors = await User.find(q).select("fullName village tehsil district");
    res.json({ success:true, data:{ doctors } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

module.exports = { bookAppointment, getMyAppointments, getDoctorAppointments, updateAppointmentStatus, listDoctors };
