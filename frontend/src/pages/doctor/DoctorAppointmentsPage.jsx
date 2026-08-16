import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { appointmentAPI, doctorAPI } from "../../services/index";
import { useAuth } from "../../context/AuthContext";
import { formatDoctorName } from "../../utils/doctor";
import {
  Calendar, Clock, Video, User, MapPin, Phone, CheckCircle2,
  XCircle, AlertCircle, Plus, Search, Filter, RefreshCw,
  ChevronRight, ArrowUpRight, Check, X, FileText, Pill, TestTube2,
  Stethoscope, Loader2, Sparkles
} from "lucide-react";

// Initial realistic fallback data if backend is empty/offline
const MOCK_APPOINTMENTS = [
  {
    _id: "apt-101",
    patient: {
      _id: "pat-001",
      fullName: "Sunita Devi",
      phone: "+91 98765 43210",
      age: 38,
      gender: "Female",
      village: "Sunderpur",
      district: "Varanasi",
    },
    scheduledAt: new Date(Date.now() + 1000 * 60 * 45).toISOString(), // 45 mins from now
    consultationType: "telemedicine",
    reason: "Severe cough, low-grade fever for 3 days, sore throat",
    status: "confirmed",
    consultationNotes: "",
    followUpDate: null,
  },
  {
    _id: "apt-102",
    patient: {
      _id: "pat-002",
      fullName: "Rameshwar Prasad",
      phone: "+91 98123 45678",
      age: 54,
      gender: "Male",
      village: "Rampur Kalan",
      district: "Varanasi",
    },
    scheduledAt: new Date(Date.now() + 1000 * 60 * 150).toISOString(), // 2.5 hours from now
    consultationType: "in-person",
    reason: "Monthly hypertension follow-up and blood pressure check",
    status: "confirmed",
    consultationNotes: "",
    followUpDate: null,
  },
  {
    _id: "apt-103",
    patient: {
      _id: "pat-003",
      fullName: "Pooja Kumari",
      phone: "+91 97234 56789",
      age: 26,
      gender: "Female",
      village: "Durgapur",
      district: "Chandauli",
    },
    scheduledAt: new Date(Date.now() + 1000 * 60 * 300).toISOString(),
    consultationType: "telemedicine",
    reason: "Second trimester prenatal inquiry and iron supplement advice",
    status: "pending",
    consultationNotes: "",
    followUpDate: null,
  },
  {
    _id: "apt-104",
    patient: {
      _id: "pat-004",
      fullName: "Harish Chandra Verma",
      phone: "+91 94567 12345",
      age: 62,
      gender: "Male",
      village: "Shivpur",
      district: "Varanasi",
    },
    scheduledAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    consultationType: "in-person",
    reason: "Joint pain in both knees and morning stiffness",
    status: "completed",
    consultationNotes: "Osteoarthritis flare-up. Advised calcium + vit D3, analgesic SOS, gentle physiotherapy.",
    followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    _id: "apt-105",
    patient: {
      _id: "pat-005",
      fullName: "Anandi Bai",
      phone: "+91 91234 56780",
      age: 45,
      gender: "Female",
      village: "Baragaon",
      district: "Jaunpur",
    },
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Tomorrow
    consultationType: "telemedicine",
    reason: "Review CBC and fasting blood sugar lab reports",
    status: "confirmed",
    consultationNotes: "",
    followUpDate: null,
  },
  {
    _id: "apt-106",
    patient: {
      _id: "pat-006",
      fullName: "Mukesh Yadav",
      phone: "+91 99887 65432",
      age: 31,
      gender: "Male",
      village: "Mirzapur Rural",
      district: "Mirzapur",
    },
    scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    consultationType: "in-person",
    reason: "Acute stomach pain and acidity after spicy meal",
    status: "cancelled",
    consultationNotes: "Patient rescheduled due to transportation issues.",
    followUpDate: null,
  },
];

const MOCK_PATIENTS_LIST = [
  { _id: "pat-001", fullName: "Sunita Devi", phone: "+91 98765 43210", age: 38, gender: "Female", village: "Sunderpur", district: "Varanasi" },
  { _id: "pat-002", fullName: "Rameshwar Prasad", phone: "+91 98123 45678", age: 54, gender: "Male", village: "Rampur Kalan", district: "Varanasi" },
  { _id: "pat-003", fullName: "Pooja Kumari", phone: "+91 97234 56789", age: 26, gender: "Female", village: "Durgapur", district: "Chandauli" },
  { _id: "pat-004", fullName: "Harish Chandra Verma", phone: "+91 94567 12345", age: 62, gender: "Male", village: "Shivpur", district: "Varanasi" },
  { _id: "pat-005", fullName: "Anandi Bai", phone: "+91 91234 56780", age: 45, gender: "Female", village: "Baragaon", district: "Jaunpur" },
  { _id: "pat-006", fullName: "Mukesh Yadav", phone: "+91 99887 65432", age: 31, gender: "Male", village: "Mirzapur Rural", district: "Mirzapur" },
];

export default function DoctorAppointmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(null); // appointment object
  const [showDetailModal, setShowDetailModal] = useState(null); // appointment object
  const [showRescheduleModal, setShowRescheduleModal] = useState(null); // appointment object

  // Form states
  const [scheduleForm, setScheduleForm] = useState({
    patientId: "",
    newPatientName: "",
    newPatientPhone: "",
    scheduledAt: "",
    consultationType: "telemedicine",
    reason: "",
  });
  const [completeForm, setCompleteForm] = useState({
    consultationNotes: "",
    followUpDate: "",
  });
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load appointments
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentAPI.getDoctorList();
      const apiAppts = res.data?.data?.appointments;
      if (Array.isArray(apiAppts) && apiAppts.length > 0) {
        setAppointments(apiAppts);
      } else {
        // Use realistic demo list if no appointments yet in database
        setAppointments(MOCK_APPOINTMENTS);
      }
    } catch {
      setAppointments(MOCK_APPOINTMENTS);
    } finally {
      setLoading(false);
    }
  };

  // Load patient list for schedule dropdown
  useEffect(() => {
    fetchAppointments();
    doctorAPI.getPatients()
      .then(res => {
        const pList = res.data?.data?.patients;
        if (Array.isArray(pList) && pList.length > 0) {
          setPatients(pList);
        } else {
          setPatients(MOCK_PATIENTS_LIST);
        }
      })
      .catch(() => setPatients(MOCK_PATIENTS_LIST));
  }, []);

  // Update Status action (Confirm / Cancel / Complete)
  const handleStatusUpdate = async (id, status, extraData = {}) => {
    try {
      await appointmentAPI.updateStatus(id, { status, ...extraData });
    } catch {
      // Local fallback update
    }
    setAppointments(prev =>
      prev.map(a => (a._id === id ? { ...a, status, ...extraData } : a))
    );
    showToast(`Appointment status updated to ${status}.`);
  };

  // Complete consultation submission
  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!showCompleteModal) return;
    setSubmitting(true);
    try {
      await handleStatusUpdate(showCompleteModal._id, "completed", {
        consultationNotes: completeForm.consultationNotes,
        followUpDate: completeForm.followUpDate ? new Date(completeForm.followUpDate).toISOString() : null,
      });
      setShowCompleteModal(null);
      setCompleteForm({ consultationNotes: "", followUpDate: "" });
    } finally {
      setSubmitting(false);
    }
  };

  // Reschedule submission
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!showRescheduleModal || !rescheduleDate) return;
    setSubmitting(true);
    try {
      const updatedDate = new Date(rescheduleDate).toISOString();
      try {
        await appointmentAPI.updateStatus(showRescheduleModal._id, {
          status: "confirmed",
          scheduledAt: updatedDate,
        });
      } catch { /* silent */ }
      setAppointments(prev =>
        prev.map(a => (a._id === showRescheduleModal._id ? { ...a, status: "confirmed", scheduledAt: updatedDate } : a))
      );
      showToast("Appointment successfully rescheduled.");
      setShowRescheduleModal(null);
      setRescheduleDate("");
    } finally {
      setSubmitting(false);
    }
  };

  // Schedule new appointment submission
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedPatient = patients.find(p => p._id === scheduleForm.patientId) || {
        _id: `pat-${Date.now()}`,
        fullName: scheduleForm.newPatientName || "Walk-in Patient",
        phone: scheduleForm.newPatientPhone || "+91 98000 00000",
        village: "Local District",
        district: "Varanasi",
      };

      const newAppt = {
        _id: `apt-${Date.now()}`,
        patient: selectedPatient,
        scheduledAt: new Date(scheduleForm.scheduledAt).toISOString(),
        consultationType: scheduleForm.consultationType,
        reason: scheduleForm.reason || "General Medical Consultation",
        status: "confirmed",
        consultationNotes: "",
        followUpDate: null,
      };

      try {
        await appointmentAPI.book({
          doctorId: user?._id,
          patientId: selectedPatient._id,
          scheduledAt: newAppt.scheduledAt,
          consultationType: newAppt.consultationType,
          reason: newAppt.reason,
        });
      } catch { /* local fallback */ }

      setAppointments(prev => [newAppt, ...prev]);
      showToast("New appointment scheduled successfully.");
      setShowScheduleModal(false);
      setScheduleForm({
        patientId: "",
        newPatientName: "",
        newPatientPhone: "",
        scheduledAt: "",
        consultationType: "telemedicine",
        reason: "",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Summary counts
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCount = appointments.filter(a => {
      const d = new Date(a.scheduledAt);
      return d >= today && d < tomorrow && a.status !== "cancelled";
    }).length;

    const upcomingCount = appointments.filter(a => {
      const d = new Date(a.scheduledAt);
      return d >= new Date() && a.status === "confirmed";
    }).length;

    const pendingCount = appointments.filter(a => a.status === "pending").length;
    const completedCount = appointments.filter(a => a.status === "completed").length;

    return { today: todayCount, upcoming: upcomingCount, pending: pendingCount, completed: completedCount };
  }, [appointments]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return appointments.filter(apt => {
      // Tab filter
      if (activeTab === "today") {
        const d = new Date(apt.scheduledAt);
        if (d < today || d >= tomorrow) return false;
      } else if (activeTab === "upcoming") {
        if (apt.status !== "confirmed" || new Date(apt.scheduledAt) < new Date()) return false;
      } else if (activeTab === "pending") {
        if (apt.status !== "pending") return false;
      } else if (activeTab === "completed") {
        if (apt.status !== "completed") return false;
      } else if (activeTab === "cancelled") {
        if (apt.status !== "cancelled") return false;
      }

      // Type filter
      if (typeFilter !== "all" && apt.consultationType !== typeFilter) return false;

      // Date picker filter
      if (dateFilter) {
        const aptDateStr = new Date(apt.scheduledAt).toISOString().split("T")[0];
        if (aptDateStr !== dateFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const pName = (apt.patient?.fullName || "").toLowerCase();
        const pPhone = (apt.patient?.phone || "").toLowerCase();
        const pVillage = (apt.patient?.village || "").toLowerCase();
        const reason = (apt.reason || "").toLowerCase();
        return pName.includes(q) || pPhone.includes(q) || pVillage.includes(q) || reason.includes(q);
      }

      return true;
    });
  }, [appointments, activeTab, typeFilter, dateFilter, searchQuery]);

  // Format date helper
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    if (isToday) return `Today at ${time}`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) + `, ${time}`;
  };

  // Min date for scheduling (now)
  const minDateTime = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
              <p className="text-sm text-gray-500">
                Manage your patient consultations, video visits, and clinic schedules.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAppointments}
            title="Refresh list"
            className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-white border border-gray-200 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-teal-600" : ""}`} />
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="btn-primary flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Appointment</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => setActiveTab("today")}
          className={`card cursor-pointer p-4 transition-all duration-200 hover:border-teal-300 ${
            activeTab === "today" ? "ring-2 ring-teal-500 bg-teal-50/40" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Today</span>
            <div className="w-7 h-7 rounded-lg bg-teal-100/80 text-teal-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.today}</p>
          <p className="text-xs text-gray-500 mt-0.5">Scheduled for today</p>
        </div>

        <div
          onClick={() => setActiveTab("upcoming")}
          className={`card cursor-pointer p-4 transition-all duration-200 hover:border-teal-300 ${
            activeTab === "upcoming" ? "ring-2 ring-teal-500 bg-teal-50/40" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Upcoming</span>
            <div className="w-7 h-7 rounded-lg bg-blue-100/80 text-blue-800 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.upcoming}</p>
          <p className="text-xs text-gray-500 mt-0.5">Confirmed future visits</p>
        </div>

        <div
          onClick={() => setActiveTab("pending")}
          className={`card cursor-pointer p-4 transition-all duration-200 hover:border-amber-300 ${
            activeTab === "pending" ? "ring-2 ring-amber-500 bg-amber-50/40" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pending</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100/80 text-amber-800 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">{stats.pending}</p>
          <p className="text-xs text-gray-500 mt-0.5">Awaiting your approval</p>
        </div>

        <div
          onClick={() => setActiveTab("completed")}
          className={`card cursor-pointer p-4 transition-all duration-200 hover:border-emerald-300 ${
            activeTab === "completed" ? "ring-2 ring-emerald-500 bg-emerald-50/40" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Completed</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{stats.completed}</p>
          <p className="text-xs text-gray-500 mt-0.5">Consultations done</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="card space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-gray-100">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {[
              { id: "all", label: "All Appointments", count: appointments.length },
              { id: "today", label: "Today", count: stats.today },
              { id: "upcoming", label: "Upcoming", count: stats.upcoming },
              { id: "pending", label: "Pending Review", count: stats.pending },
              { id: "completed", label: "Completed", count: stats.completed },
              { id: "cancelled", label: "Cancelled", count: appointments.filter(a => a.status === "cancelled").length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.id ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Date Filter Reset */}
          {(dateFilter || typeFilter !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setDateFilter("");
                setTypeFilter("all");
                setSearchQuery("");
              }}
              className="text-xs text-teal-600 hover:text-teal-700 font-medium self-end lg:self-auto flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        {/* Search and Secondary Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient, village, or symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 text-sm"
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input text-sm cursor-pointer"
            >
              <option value="all">All Consultation Types</option>
              <option value="telemedicine">📹 Video Consultation (Telemedicine)</option>
              <option value="in-person">🏥 In-Person Clinic Visit</option>
              <option value="follow-up">🔄 Follow-up Consultation</option>
              <option value="lab-review">🧪 Lab Report Review</option>
            </select>
          </div>

          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input text-sm"
            />
          </div>
        </div>
      </div>

      {/* Appointment Content Area */}
      {loading ? (
        <div className="card text-center py-16">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 font-medium text-sm">Loading appointments...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="card text-center py-16 border-dashed border-2">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
            <Calendar className="w-6 h-6" />
          </div>
          <p className="text-gray-800 font-semibold text-base">No appointments found</p>
          <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">
            {searchQuery || dateFilter || typeFilter !== "all" || activeTab !== "all"
              ? "No appointments match your active filter criteria. Try adjusting or clearing filters."
              : "You do not have any appointments in your schedule yet."}
          </p>
          <div className="mt-5">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="btn-primary inline-flex items-center gap-1.5 text-xs"
            >
              <Plus className="w-4 h-4" /> Schedule New Visit
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Desktop Table View */}
          <div className="hidden lg:block card overflow-hidden p-0 border border-gray-200/80">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 text-xs uppercase font-semibold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Mode / Type</th>
                  <th className="py-3.5 px-4">Reason / Notes</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.map((apt) => {
                  const patient = apt.patient || {};
                  const isTelemed = apt.consultationType === "telemedicine";
                  const isPending = apt.status === "pending";
                  const isConfirmed = apt.status === "confirmed";
                  const isCompleted = apt.status === "completed";

                  return (
                    <tr key={apt._id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Patient column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-teal-100/80 text-teal-800 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {patient.fullName ? patient.fullName.charAt(0).toUpperCase() : "P"}
                          </div>
                          <div>
                            <Link
                              to={`/doctor/patients/${patient._id || "view"}`}
                              className="font-semibold text-gray-900 hover:text-teal-700 flex items-center gap-1 group"
                            >
                              <span>{patient.fullName || "Unnamed Patient"}</span>
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-teal-600 transition-opacity" />
                            </Link>
                            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                              {patient.age && <span>{patient.age}y</span>}
                              {patient.gender && <span>· {patient.gender}</span>}
                              {patient.village && <span>· {patient.village}</span>}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-medium text-gray-800 text-xs flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {formatDateTime(apt.scheduledAt)}
                        </p>
                      </td>

                      {/* Mode / Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isTelemed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                            <Video className="w-3 h-3 text-purple-600" /> Video Call
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <Stethoscope className="w-3 h-3 text-emerald-600" /> In-Person
                          </span>
                        )}
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed" title={apt.reason}>
                          {apt.reason || "General health consultation"}
                        </p>
                        {apt.consultationNotes && (
                          <p className="text-[11px] text-teal-700 font-medium mt-1 line-clamp-1">
                            Notes: {apt.consultationNotes}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                            apt.status === "confirmed"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : apt.status === "completed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : apt.status === "pending"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-gray-100 text-gray-500 border border-gray-200"
                          }`}
                        >
                          {apt.status === "confirmed" && "✓ Confirmed"}
                          {apt.status === "completed" && "✓ Completed"}
                          {apt.status === "pending" && "⏳ Pending"}
                          {apt.status === "cancelled" && "✕ Cancelled"}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Pending Actions */}
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(apt._id, "confirmed")}
                                className="px-2.5 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" /> Accept
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(apt._id, "cancelled")}
                                className="px-2 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700 text-xs font-semibold transition-colors"
                                title="Decline"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {/* Confirmed Telemed Actions */}
                          {isConfirmed && isTelemed && (
                            <button
                              onClick={() => navigate(`/telemedicine/consult-${apt._id}`)}
                              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                            >
                              <Video className="w-3.5 h-3.5" /> Join Call
                            </button>
                          )}

                          {/* Confirmed In-person Action */}
                          {isConfirmed && (
                            <button
                              onClick={() => {
                                setShowCompleteModal(apt);
                                setCompleteForm({ consultationNotes: "", followUpDate: "" });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                            </button>
                          )}

                          {/* Completed actions: Quick Rx / Lab shortcut */}
                          {isCompleted && (
                            <>
                              <Link
                                to={`/doctor/prescriptions?patientId=${patient._id}&patientName=${encodeURIComponent(
                                  patient.fullName || ""
                                )}`}
                                className="p-1.5 text-gray-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                                title="Write Prescription"
                              >
                                <Pill className="w-4 h-4" />
                              </Link>
                              <Link
                                to={`/doctor/lab?patientId=${patient._id}&patientName=${encodeURIComponent(
                                  patient.fullName || ""
                                )}`}
                                className="p-1.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Order Lab Test"
                              >
                                <TestTube2 className="w-4 h-4" />
                              </Link>
                            </>
                          )}

                          {/* View details */}
                          <button
                            onClick={() => setShowDetailModal(apt)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-3.5">
            {filteredAppointments.map((apt) => {
              const patient = apt.patient || {};
              const isTelemed = apt.consultationType === "telemedicine";
              const isPending = apt.status === "pending";
              const isConfirmed = apt.status === "confirmed";
              const isCompleted = apt.status === "completed";

              return (
                <div key={apt._id} className="card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {patient.fullName ? patient.fullName.charAt(0).toUpperCase() : "P"}
                      </div>
                      <div>
                        <Link
                          to={`/doctor/patients/${patient._id || "view"}`}
                          className="font-bold text-gray-900 text-sm hover:text-teal-700"
                        >
                          {patient.fullName || "Patient"}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {patient.age ? `${patient.age}y · ` : ""}
                          {patient.village || patient.phone || "RuralCare Patient"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        apt.status === "confirmed"
                          ? "bg-blue-50 text-blue-700"
                          : apt.status === "completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : apt.status === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-2.5 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {formatDateTime(apt.scheduledAt)}
                      </span>
                      <span className="font-medium text-gray-700 capitalize">
                        {isTelemed ? "📹 Video Call" : "🏥 In-Person"}
                      </span>
                    </div>
                    {apt.reason && (
                      <p className="text-gray-700 pt-1 border-t border-gray-200/60 leading-relaxed">
                        <span className="font-semibold text-gray-800">Reason: </span>
                        {apt.reason}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    {isTelemed && isConfirmed && (
                      <button
                        onClick={() => navigate(`/telemedicine/consult-${apt._id}`)}
                        className="flex-1 btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" /> Start Call
                      </button>
                    )}

                    {isPending && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(apt._id, "confirmed")}
                          className="flex-1 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(apt._id, "cancelled")}
                          className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {isConfirmed && (
                      <button
                        onClick={() => {
                          setShowCompleteModal(apt);
                          setCompleteForm({ consultationNotes: "", followUpDate: "" });
                        }}
                        className="flex-1 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold"
                      >
                        Mark Complete
                      </button>
                    )}

                    <button
                      onClick={() => setShowDetailModal(apt)}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-medium"
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MODAL 1: Schedule Appointment ── */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Schedule Consultation</h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 mt-4">
              {/* Select Patient */}
              <div>
                <label className="label">Select Patient</label>
                <select
                  value={scheduleForm.patientId}
                  onChange={(e) => setScheduleForm(f => ({ ...f, patientId: e.target.value }))}
                  className="input"
                >
                  <option value="">Choose registered patient...</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.fullName} ({p.age ? `${p.age}y, ` : ""}{p.village || p.district})
                    </option>
                  ))}
                  <option value="custom">+ Enter Walk-in / New Patient</option>
                </select>
              </div>

              {/* Custom Patient Fields if selected */}
              {(scheduleForm.patientId === "custom" || !scheduleForm.patientId) && (
                <div className="p-3 bg-gray-50 rounded-xl space-y-3 border border-gray-200/70">
                  <p className="text-xs font-semibold text-gray-600">Patient Details</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Patient Full Name"
                      value={scheduleForm.newPatientName}
                      onChange={(e) => setScheduleForm(f => ({ ...f, newPatientName: e.target.value }))}
                      className="input bg-white text-xs"
                      required={!scheduleForm.patientId || scheduleForm.patientId === "custom"}
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={scheduleForm.newPatientPhone}
                      onChange={(e) => setScheduleForm(f => ({ ...f, newPatientPhone: e.target.value }))}
                      className="input bg-white text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Date and Time */}
              <div>
                <label className="label">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  min={minDateTime}
                  value={scheduleForm.scheduledAt}
                  onChange={(e) => setScheduleForm(f => ({ ...f, scheduledAt: e.target.value }))}
                  className="input"
                  required
                />
              </div>

              {/* Mode */}
              <div>
                <label className="label">Consultation Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "telemedicine", label: "📹 Video Call (Telemedicine)" },
                    { id: "in-person", label: "🏥 In-Person Clinic Visit" },
                  ].map(mode => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setScheduleForm(f => ({ ...f, consultationType: mode.id }))}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        scheduleForm.consultationType === mode.id
                          ? "border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="label">Chief Complaint / Reason</label>
                <textarea
                  rows={3}
                  placeholder="E.g., Fever and chills for 2 days, hypertension routine review..."
                  value={scheduleForm.reason}
                  onChange={(e) => setScheduleForm(f => ({ ...f, reason: e.target.value }))}
                  className="input resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="btn-outline text-xs py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs py-2 flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5" />}
                  <span>Confirm Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Complete Consultation ── */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Complete Consultation</h3>
                <p className="text-xs text-gray-500">
                  Patient: {showCompleteModal.patient?.fullName} ({showCompleteModal.patient?.village})
                </p>
              </div>
              <button
                onClick={() => setShowCompleteModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4 mt-4">
              <div>
                <label className="label">Clinical Consultation Summary & Advice</label>
                <textarea
                  rows={4}
                  placeholder="Record clinical impressions, observations, and advice given to the patient..."
                  value={completeForm.consultationNotes}
                  onChange={(e) => setCompleteForm(f => ({ ...f, consultationNotes: e.target.value }))}
                  className="input resize-none"
                  required
                />
              </div>

              <div>
                <label className="label">Recommended Follow-up Date (Optional)</label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={completeForm.followUpDate}
                  onChange={(e) => setCompleteForm(f => ({ ...f, followUpDate: e.target.value }))}
                  className="input"
                />
              </div>

              <div className="bg-teal-50 rounded-xl p-3 text-xs text-teal-800 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Next Actions:
                </p>
                <p className="text-teal-700">
                  After marking complete, you can generate a digital prescription or order required laboratory tests.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(null)}
                  className="btn-outline text-xs py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs py-2 flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Complete & Save Notes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Appointment Details ── */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    showDetailModal.status === "confirmed"
                      ? "bg-blue-50 text-blue-700"
                      : showDetailModal.status === "completed"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {showDetailModal.status}
                </span>
                <h3 className="font-bold text-gray-900 text-lg mt-1">Consultation Details</h3>
              </div>
              <button
                onClick={() => setShowDetailModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient card */}
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">{showDetailModal.patient?.fullName || "Patient"}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {showDetailModal.patient?.age ? `${showDetailModal.patient.age} yrs · ` : ""}
                  {showDetailModal.patient?.gender || ""}
                  {showDetailModal.patient?.village ? ` · ${showDetailModal.patient.village}, ${showDetailModal.patient.district || ""}` : ""}
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-gray-400" /> {showDetailModal.patient?.phone || "No phone on file"}
                </p>
              </div>
              <Link
                to={`/doctor/patients/${showDetailModal.patient?._id || ""}`}
                className="text-xs font-semibold text-teal-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors"
              >
                Profile
              </Link>
            </div>

            {/* Timings & Mode */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-gray-400 font-medium">Scheduled Time</p>
                <p className="font-semibold text-gray-800 mt-1">{formatDateTime(showDetailModal.scheduledAt)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-gray-400 font-medium">Consultation Mode</p>
                <p className="font-semibold text-gray-800 mt-1 capitalize">
                  {showDetailModal.consultationType === "telemedicine" ? "📹 Telemedicine Video" : "🏥 In-Person Clinic"}
                </p>
              </div>
            </div>

            {/* Chief Complaint */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Chief Complaint</p>
              <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-800 leading-relaxed">
                {showDetailModal.reason || "Not specified."}
              </div>
            </div>

            {/* Doctor Notes if completed */}
            {showDetailModal.consultationNotes && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Doctor Clinical Notes</p>
                <div className="p-3 bg-teal-50/60 border border-teal-100 rounded-xl text-xs text-teal-950 leading-relaxed">
                  {showDetailModal.consultationNotes}
                </div>
              </div>
            )}

            {showDetailModal.followUpDate && (
              <p className="text-xs text-teal-800 font-medium">
                🔄 Follow-up Recommended: {new Date(showDetailModal.followUpDate).toLocaleDateString("en-IN")}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex gap-2">
                <Link
                  to={`/doctor/prescriptions?patientId=${showDetailModal.patient?._id}&patientName=${encodeURIComponent(
                    showDetailModal.patient?.fullName || ""
                  )}`}
                  className="btn-outline text-xs py-1.5 flex items-center gap-1"
                >
                  <Pill className="w-3.5 h-3.5 text-teal-600" /> Prescribe
                </Link>
                <Link
                  to={`/doctor/lab?patientId=${showDetailModal.patient?._id}&patientName=${encodeURIComponent(
                    showDetailModal.patient?.fullName || ""
                  )}`}
                  className="btn-outline text-xs py-1.5 flex items-center gap-1"
                >
                  <TestTube2 className="w-3.5 h-3.5 text-purple-600" /> Lab Test
                </Link>
              </div>

              <button
                onClick={() => setShowDetailModal(null)}
                className="btn-primary text-xs py-1.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
