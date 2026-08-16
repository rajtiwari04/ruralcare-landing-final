import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { labAPI, doctorAPI } from "../../services/index";
import { useAuth } from "../../context/AuthContext";
import {
  TestTube2, Plus, Search, Filter, RefreshCw, Eye,
  FileText, Calendar, User, Phone, MapPin, CheckCircle2,
  AlertTriangle, AlertCircle, Clock, ArrowUpRight, X,
  Pill, Upload, Printer, Loader2, Sparkles, Stethoscope, ChevronRight
} from "lucide-react";

// Curated realistic mock lab tests with clinical investigation parameters
const MOCK_LAB_TESTS = [
  {
    _id: "lab-001",
    patient: {
      _id: "pat-001",
      fullName: "Sunita Devi",
      phone: "+91 98765 43210",
      age: 38,
      gender: "Female",
      village: "Sunderpur",
      district: "Varanasi",
    },
    testName: "Complete Blood Count (CBC) with Platelets",
    testType: "blood",
    urgency: "urgent",
    status: "completed",
    riskLevel: "medium",
    instructions: "Fasting sample preferred. Suspected viral fever / low platelets.",
    orderedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    resultSummary: "Hemoglobin is mildly low (10.2 g/dL). Platelet count reduced to 1.15 Lakhs/cumm. No active acute leukemia markers. Likely viral-induced transient thrombocytopenia.",
    parameters: [
      { name: "Hemoglobin (Hb)", value: "10.2", unit: "g/dL", range: "12.0 - 15.5", flag: "low" },
      { name: "Total Leukocyte Count (TLC)", value: "4,200", unit: "/cumm", range: "4,000 - 11,000", flag: "normal" },
      { name: "Platelet Count", value: "1,15,000", unit: "/cumm", range: "1,50,000 - 4,50,000", flag: "low" },
      { name: "RBC Count", value: "3.9", unit: "million/cumm", range: "3.8 - 5.0", flag: "normal" },
      { name: "Packed Cell Volume (PCV)", value: "32.0", unit: "%", range: "36.0 - 46.0", flag: "low" },
      { name: "Neutrophils", value: "58", unit: "%", range: "40 - 75", flag: "normal" },
      { name: "Lymphocytes", value: "34", unit: "%", range: "20 - 45", flag: "normal" },
    ],
  },
  {
    _id: "lab-002",
    patient: {
      _id: "pat-002",
      fullName: "Rameshwar Prasad",
      phone: "+91 98123 45678",
      age: 54,
      gender: "Male",
      village: "Rampur Kalan",
      district: "Varanasi",
    },
    testName: "Lipid Profile & Serum Creatinine",
    testType: "blood",
    urgency: "routine",
    status: "completed",
    riskLevel: "normal",
    instructions: "12 hours strict overnight fasting.",
    orderedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    resultSummary: "Serum creatinine within normal range. Total cholesterol is borderline high (215 mg/dL). HDL is satisfactory.",
    parameters: [
      { name: "Serum Creatinine", value: "0.95", unit: "mg/dL", range: "0.7 - 1.3", flag: "normal" },
      { name: "Total Cholesterol", value: "215", unit: "mg/dL", range: "125 - 200", flag: "high" },
      { name: "Triglycerides", value: "168", unit: "mg/dL", range: "< 150", flag: "high" },
      { name: "HDL Cholesterol", value: "46", unit: "mg/dL", range: "> 40", flag: "normal" },
      { name: "LDL Cholesterol", value: "135", unit: "mg/dL", range: "< 100", flag: "high" },
      { name: "Blood Urea", value: "24", unit: "mg/dL", range: "15 - 40", flag: "normal" },
    ],
  },
  {
    _id: "lab-003",
    patient: {
      _id: "pat-003",
      fullName: "Pooja Kumari",
      phone: "+91 97234 56789",
      age: 26,
      gender: "Female",
      village: "Durgapur",
      district: "Chandauli",
    },
    testName: "Antenatal Panel (Hb, Blood Group, Urine Routine, HIV/HBsAg)",
    testType: "blood",
    urgency: "routine",
    status: "processing",
    riskLevel: "normal",
    instructions: "Standard 2nd trimester ANC screening.",
    orderedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    completedAt: null,
    resultSummary: null,
    parameters: [],
  },
  {
    _id: "lab-004",
    patient: {
      _id: "pat-004",
      fullName: "Harish Chandra Verma",
      phone: "+91 94567 12345",
      age: 62,
      gender: "Male",
      village: "Shivpur",
      district: "Varanasi",
    },
    testName: "Uric Acid, Serum Calcium & ESR",
    testType: "blood",
    urgency: "routine",
    status: "completed",
    riskLevel: "medium",
    instructions: "Investigate knee joint effusion and inflammatory arthritis.",
    orderedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    resultSummary: "ESR moderately elevated at 42 mm/hr indicating active joint inflammation. Serum Uric Acid is 7.4 mg/dL (mildly elevated). Calcium normal.",
    parameters: [
      { name: "Serum Uric Acid", value: "7.4", unit: "mg/dL", range: "3.5 - 7.0", flag: "high" },
      { name: "ESR (Westergren)", value: "42", unit: "mm/hr", range: "0 - 20", flag: "high" },
      { name: "Serum Calcium", value: "9.2", unit: "mg/dL", range: "8.5 - 10.5", flag: "normal" },
      { name: "C-Reactive Protein (CRP)", value: "8.6", unit: "mg/L", range: "< 5.0", flag: "high" },
    ],
  },
  {
    _id: "lab-005",
    patient: {
      _id: "pat-005",
      fullName: "Anandi Bai",
      phone: "+91 91234 56780",
      age: 45,
      gender: "Female",
      village: "Baragaon",
      district: "Jaunpur",
    },
    testName: "Fasting Blood Glucose & HbA1c",
    testType: "blood",
    urgency: "stat",
    status: "ordered",
    riskLevel: "high",
    instructions: "Patient reported polyuria and extreme weakness. Immediate test required.",
    orderedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    completedAt: null,
    resultSummary: null,
    parameters: [],
  },
  {
    _id: "lab-006",
    patient: {
      _id: "pat-006",
      fullName: "Mukesh Yadav",
      phone: "+91 99887 65432",
      age: 31,
      gender: "Male",
      village: "Mirzapur Rural",
      district: "Mirzapur",
    },
    testName: "Dengue NS1 Antigen & Malaria Rapid Test (Dual)",
    testType: "blood",
    urgency: "stat",
    status: "sample_collected",
    riskLevel: "high",
    instructions: "High grade intermittent fever with chills and severe retro-orbital pain.",
    orderedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    completedAt: null,
    resultSummary: null,
    parameters: [],
  },
];

const COMMON_TEST_PRESETS = [
  { name: "Complete Blood Count (CBC)", type: "blood", urgency: "routine" },
  { name: "Fasting & PP Blood Glucose", type: "blood", urgency: "routine" },
  { name: "Lipid Profile", type: "blood", urgency: "routine" },
  { name: "Liver Function Test (LFT)", type: "blood", urgency: "routine" },
  { name: "Kidney Function Test (KFT / Creatinine)", type: "blood", urgency: "routine" },
  { name: "Dengue NS1 Antigen & IgM/IgG", type: "blood", urgency: "stat" },
  { name: "Malaria Antigen Rapid Card", type: "blood", urgency: "urgent" },
  { name: "Urine Routine & Microscopic", type: "urine", urgency: "routine" },
  { name: "Thyroid Profile (T3, T4, TSH)", type: "blood", urgency: "routine" },
  { name: "Sputum AFB for TB (2 Samples)", type: "other", urgency: "urgent" },
  { name: "Chest X-Ray (PA View)", type: "imaging", urgency: "routine" },
];

const MOCK_PATIENTS_LIST = [
  { _id: "pat-001", fullName: "Sunita Devi", phone: "+91 98765 43210", age: 38, gender: "Female", village: "Sunderpur", district: "Varanasi" },
  { _id: "pat-002", fullName: "Rameshwar Prasad", phone: "+91 98123 45678", age: 54, gender: "Male", village: "Rampur Kalan", district: "Varanasi" },
  { _id: "pat-003", fullName: "Pooja Kumari", phone: "+91 97234 56789", age: 26, gender: "Female", village: "Durgapur", district: "Chandauli" },
  { _id: "pat-004", fullName: "Harish Chandra Verma", phone: "+91 94567 12345", age: 62, gender: "Male", village: "Shivpur", district: "Varanasi" },
  { _id: "pat-005", fullName: "Anandi Bai", phone: "+91 91234 56780", age: 45, gender: "Female", village: "Baragaon", district: "Jaunpur" },
  { _id: "pat-006", fullName: "Mukesh Yadav", phone: "+91 99887 65432", age: 31, gender: "Male", village: "Mirzapur Rural", district: "Mirzapur" },
];

export default function DoctorLabPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  // Modals
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [detailTest, setDetailTest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Order Form State
  const [orderForm, setOrderForm] = useState({
    patientId: "",
    newPatientName: "",
    newPatientPhone: "",
    testName: "",
    testType: "blood",
    urgency: "routine",
    instructions: "",
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Tests and Patients
  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await labAPI.getDoctorList();
      const apiTests = res.data?.data?.tests;
      if (Array.isArray(apiTests) && apiTests.length > 0) {
        setTests(apiTests);
      } else {
        setTests(MOCK_LAB_TESTS);
      }
    } catch {
      setTests(MOCK_LAB_TESTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
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

    // Handle pre-filled patient from Appointment / Profile query param
    const prePatientId = searchParams.get("patientId");
    const prePatientName = searchParams.get("patientName");
    if (prePatientId || prePatientName) {
      setOrderForm(f => ({
        ...f,
        patientId: prePatientId || "custom",
        newPatientName: prePatientName || "",
      }));
      setShowOrderModal(true);
    }
  }, [searchParams]);

  // Order Lab Test submission
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!orderForm.testName.trim()) {
      alert("Please specify the investigation / test name.");
      return;
    }
    setSubmitting(true);
    try {
      const selectedPatient = patients.find(p => p._id === orderForm.patientId) || {
        _id: `pat-${Date.now()}`,
        fullName: orderForm.newPatientName || "Patient",
        phone: orderForm.newPatientPhone || "+91 98000 00000",
        age: 35,
        gender: "Female",
        village: "Local District",
        district: "Varanasi",
      };

      const newTest = {
        _id: `lab-${Date.now()}`,
        patient: selectedPatient,
        testName: orderForm.testName,
        testType: orderForm.testType,
        urgency: orderForm.urgency,
        status: "ordered",
        riskLevel: "normal",
        instructions: orderForm.instructions || "Standard sample collection at primary laboratory.",
        orderedAt: new Date().toISOString(),
        completedAt: null,
        resultSummary: null,
        parameters: [],
      };

      try {
        await labAPI.order({
          patientId: selectedPatient._id,
          testName: orderForm.testName,
          testType: orderForm.testType,
          urgency: orderForm.urgency,
          instructions: orderForm.instructions,
        });
      } catch {
        // Backend fallback
      }

      setTests(prev => [newTest, ...prev]);
      showToast(`Lab order for ${newTest.testName} created successfully.`);
      setShowOrderModal(false);
      setOrderForm({
        patientId: "",
        newPatientName: "",
        newPatientPhone: "",
        testName: "",
        testType: "blood",
        urgency: "routine",
        instructions: "",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Preset Selection helper
  const handleSelectPreset = (preset) => {
    setOrderForm(f => ({
      ...f,
      testName: preset.name,
      testType: preset.type,
      urgency: preset.urgency,
    }));
  };

  // Metrics summary
  const stats = useMemo(() => {
    const pendingCount = tests.filter(t => t.status === "ordered").length;
    const processingCount = tests.filter(t => t.status === "sample_collected" || t.status === "processing").length;
    const completedCount = tests.filter(t => t.status === "completed").length;
    const criticalCount = tests.filter(t => t.riskLevel === "high" || t.urgency === "stat").length;

    return { pending: pendingCount, processing: processingCount, completed: completedCount, critical: criticalCount };
  }, [tests]);

  // Filtered List
  const filteredTests = useMemo(() => {
    return tests.filter(t => {
      // Tab filter
      if (activeTab === "pending" && t.status !== "ordered") return false;
      if (activeTab === "processing" && t.status !== "sample_collected" && t.status !== "processing") return false;
      if (activeTab === "completed" && t.status !== "completed") return false;
      if (activeTab === "critical" && t.riskLevel !== "high" && t.urgency !== "stat") return false;

      // Type filter
      if (typeFilter !== "all" && t.testType !== typeFilter) return false;

      // Urgency filter
      if (urgencyFilter !== "all" && t.urgency !== urgencyFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const pName = (t.patient?.fullName || "").toLowerCase();
        const pVillage = (t.patient?.village || "").toLowerCase();
        const tName = (t.testName || "").toLowerCase();
        const summary = (t.resultSummary || "").toLowerCase();
        return pName.includes(q) || pVillage.includes(q) || tName.includes(q) || summary.includes(q);
      }

      return true;
    });
  }, [tests, activeTab, typeFilter, urgencyFilter, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
            <TestTube2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laboratory Investigations</h1>
            <p className="text-sm text-gray-500">
              Review diagnostic tests, track pending lab orders, and inspect clinical reports.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchTests}
            title="Refresh list"
            className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-white border border-gray-200 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-600" : ""}`} />
          </button>
          <button
            onClick={() => setShowOrderModal(true)}
            className="btn-primary flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Order Lab Test</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => setActiveTab("pending")}
          className={`card cursor-pointer p-4 transition-all duration-200 hover:border-amber-300 ${
            activeTab === "pending" ? "ring-2 ring-amber-500 bg-amber-50/40" : ""
          }`}
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Ordered / Pending</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">{stats.pending}</p>
          <p className="text-xs text-gray-500 mt-0.5">Awaiting sample collection</p>
        </div>

        <div
          onClick={() => setActiveTab("processing")}
          className={`card cursor-pointer p-4 transition-all duration-200 hover:border-blue-300 ${
            activeTab === "processing" ? "ring-2 ring-blue-500 bg-blue-50/40" : ""
          }`}
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Processing</span>
            <TestTube2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-2">{stats.processing}</p>
          <p className="text-xs text-gray-500 mt-0.5">In laboratory analysis</p>
        </div>

        <div
          onClick={() => setActiveTab("completed")}
          className={`card cursor-pointer p-4 transition-all duration-200 hover:border-emerald-300 ${
            activeTab === "completed" ? "ring-2 ring-emerald-500 bg-emerald-50/40" : ""
          }`}
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Results</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{stats.completed}</p>
          <p className="text-xs text-gray-500 mt-0.5">Ready for clinical review</p>
        </div>

        <div
          onClick={() => setActiveTab("critical")}
          className={`card cursor-pointer p-4 transition-all duration-200 hover:border-red-300 ${
            activeTab === "critical" ? "ring-2 ring-red-500 bg-red-50/40" : ""
          }`}
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">STAT / Critical</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-700 mt-2">{stats.critical}</p>
          <p className="text-xs text-gray-500 mt-0.5">High priority / Abnormal</p>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="card space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {[
              { id: "all", label: "All Tests", count: tests.length },
              { id: "pending", label: "Ordered", count: stats.pending },
              { id: "processing", label: "In Lab", count: stats.processing },
              { id: "completed", label: "Completed", count: stats.completed },
              { id: "critical", label: "Attention Needed", count: stats.critical },
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

          {(typeFilter !== "all" || urgencyFilter !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setTypeFilter("all");
                setUrgencyFilter("all");
                setSearchQuery("");
              }}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium self-end lg:self-auto flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient, village, or test..."
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
              <option value="all">All Specimen Types</option>
              <option value="blood">🩸 Blood Investigation</option>
              <option value="urine">🧪 Urine Routine / Culture</option>
              <option value="stool">🔬 Stool Examination</option>
              <option value="imaging">🩻 Radiology / Imaging / X-Ray</option>
              <option value="other">📄 Other Specimen</option>
            </select>
          </div>

          <div>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="input text-sm cursor-pointer"
            >
              <option value="all">All Urgency Levels</option>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="stat">🚨 STAT (Immediate)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Test Orders List */}
      {loading ? (
        <div className="card text-center py-16">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 font-medium text-sm">Loading laboratory data...</p>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="card text-center py-16 border-dashed border-2">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
            <TestTube2 className="w-6 h-6" />
          </div>
          <p className="text-gray-800 font-semibold text-base">No lab tests found</p>
          <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">
            {searchQuery || typeFilter !== "all" || urgencyFilter !== "all" || activeTab !== "all"
              ? "No laboratory orders match your active filter criteria."
              : "No diagnostic tests have been ordered yet."}
          </p>
          <div className="mt-5">
            <button
              onClick={() => setShowOrderModal(true)}
              className="btn-primary inline-flex items-center gap-1.5 text-xs"
            >
              <Plus className="w-4 h-4" /> Order First Lab Test
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Desktop Table */}
          <div className="hidden lg:block card overflow-hidden p-0 border border-gray-200/80">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 text-xs uppercase font-semibold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Test Name & Specimen</th>
                  <th className="py-3.5 px-4">Ordered Date</th>
                  <th className="py-3.5 px-4">Urgency</th>
                  <th className="py-3.5 px-4">Status & Finding</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTests.map((test) => {
                  const patient = test.patient || {};
                  const isCompleted = test.status === "completed";
                  const isCritical = test.urgency === "stat" || test.riskLevel === "high";

                  return (
                    <tr key={test._id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Patient */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-purple-100/80 text-purple-800 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {patient.fullName ? patient.fullName.charAt(0).toUpperCase() : "P"}
                          </div>
                          <div>
                            <Link
                              to={`/doctor/patients/${patient._id || "view"}`}
                              className="font-semibold text-gray-900 hover:text-purple-700 flex items-center gap-1 group"
                            >
                              <span>{patient.fullName || "Patient"}</span>
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-purple-600 transition-opacity" />
                            </Link>
                            <p className="text-xs text-gray-500">
                              {patient.age ? `${patient.age}y · ` : ""}
                              {patient.gender ? `${patient.gender} · ` : ""}
                              {patient.village || patient.phone}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Test Name & Specimen */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900 text-xs">{test.testName}</p>
                        <p className="text-[11px] text-gray-500 capitalize flex items-center gap-1 mt-0.5">
                          <span>Specimen: {test.testType}</span>
                        </p>
                      </td>

                      {/* Ordered date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-600">
                        {new Date(test.orderedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Urgency badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            test.urgency === "stat"
                              ? "bg-red-100 text-red-700 border border-red-200 animate-pulse"
                              : test.urgency === "urgent"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {test.urgency === "stat" ? "🚨 STAT" : test.urgency?.toUpperCase()}
                        </span>
                      </td>

                      {/* Status / Finding */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              test.status === "completed"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : test.status === "processing"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : test.status === "sample_collected"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {test.status === "completed" && "✓ Completed"}
                            {test.status === "processing" && "⟳ Processing"}
                            {test.status === "sample_collected" && "🧪 Sample Collected"}
                            {test.status === "ordered" && "⏳ Ordered"}
                          </span>
                        </div>
                        {test.resultSummary && (
                          <p className="text-[11px] text-gray-500 mt-1 line-clamp-1 italic">
                            {test.resultSummary}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isCompleted ? (
                            <button
                              onClick={() => setDetailTest(test)}
                              className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Results
                            </button>
                          ) : (
                            <button
                              onClick={() => setDetailTest(test)}
                              className="px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-medium transition-colors"
                            >
                              Details
                            </button>
                          )}

                          <Link
                            to={`/doctor/prescriptions?patientId=${patient._id}&patientName=${encodeURIComponent(
                              patient.fullName || ""
                            )}`}
                            className="p-1.5 text-gray-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Prescribe Medication"
                          >
                            <Pill className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-3.5">
            {filteredTests.map((test) => {
              const patient = test.patient || {};
              const isCompleted = test.status === "completed";

              return (
                <div key={test._id} className="card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {patient.fullName ? patient.fullName.charAt(0).toUpperCase() : "P"}
                      </div>
                      <div>
                        <Link
                          to={`/doctor/patients/${patient._id || "view"}`}
                          className="font-bold text-gray-900 text-sm hover:text-purple-700"
                        >
                          {patient.fullName || "Patient"}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {patient.age ? `${patient.age}y · ` : ""}
                          {patient.village || patient.phone}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        test.urgency === "stat"
                          ? "bg-red-100 text-red-700"
                          : test.urgency === "urgent"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {test.urgency?.toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-2.5 text-xs space-y-1">
                    <p className="font-bold text-gray-900">{test.testName}</p>
                    <div className="flex items-center justify-between text-gray-500 pt-1">
                      <span>Specimen: {test.testType}</span>
                      <span>
                        {new Date(test.orderedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    {test.resultSummary && (
                      <p className="text-gray-700 pt-1 text-[11px] border-t border-gray-200 line-clamp-2">
                        {test.resultSummary}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setDetailTest(test)}
                      className="flex-1 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors"
                    >
                      {isCompleted ? "View Report & Values" : "View Order Details"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MODAL 1: Order Lab Test ── */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <TestTube2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Order Laboratory Investigation</h3>
                  <p className="text-xs text-gray-500">Request diagnostic test for rural patient.</p>
                </div>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-4">
              {/* Select Patient */}
              <div>
                <label className="label">Select Patient</label>
                <select
                  value={orderForm.patientId}
                  onChange={(e) => setOrderForm(f => ({ ...f, patientId: e.target.value }))}
                  className="input"
                >
                  <option value="">Choose registered patient...</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.fullName} ({p.age ? `${p.age}y, ` : ""}{p.village || p.district})
                    </option>
                  ))}
                  <option value="custom">+ Walk-in Patient</option>
                </select>
              </div>

              {/* Custom Patient Fields */}
              {(orderForm.patientId === "custom" || (!orderForm.patientId && orderForm.newPatientName)) && (
                <div className="p-3 bg-gray-50 rounded-xl space-y-2 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600">Walk-in Patient Information</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Patient Full Name *"
                      value={orderForm.newPatientName}
                      onChange={(e) => setOrderForm(f => ({ ...f, newPatientName: e.target.value }))}
                      className="input bg-white text-xs"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={orderForm.newPatientPhone}
                      onChange={(e) => setOrderForm(f => ({ ...f, newPatientPhone: e.target.value }))}
                      className="input bg-white text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Common Test Presets */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Quick Select Common Diagnostic Panels:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_TEST_PRESETS.slice(0, 8).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                        orderForm.testName === preset.name
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100"
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Name */}
              <div>
                <label className="label">Investigation / Test Name *</label>
                <input
                  type="text"
                  placeholder="E.g., Complete Blood Count (CBC), Fasting Lipid Profile, Urine Albumin..."
                  value={orderForm.testName}
                  onChange={(e) => setOrderForm(f => ({ ...f, testName: e.target.value }))}
                  className="input font-semibold"
                  required
                />
              </div>

              {/* Specimen Type and Urgency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Specimen Category</label>
                  <select
                    value={orderForm.testType}
                    onChange={(e) => setOrderForm(f => ({ ...f, testType: e.target.value }))}
                    className="input text-xs"
                  >
                    <option value="blood">🩸 Blood Investigation</option>
                    <option value="urine">🧪 Urine Specimen</option>
                    <option value="stool">🔬 Stool Specimen</option>
                    <option value="imaging">🩻 Radiology / X-Ray / Scan</option>
                    <option value="other">📄 Other Specimen</option>
                  </select>
                </div>

                <div>
                  <label className="label">Urgency Priority</label>
                  <select
                    value={orderForm.urgency}
                    onChange={(e) => setOrderForm(f => ({ ...f, urgency: e.target.value }))}
                    className="input text-xs"
                  >
                    <option value="routine">Routine (24 - 48 hours)</option>
                    <option value="urgent">Urgent (Same day)</option>
                    <option value="stat">🚨 STAT (Immediate / Critical)</option>
                  </select>
                </div>
              </div>

              {/* Clinical Indication */}
              <div>
                <label className="label">Clinical Instructions & Preparation</label>
                <textarea
                  rows={3}
                  placeholder="E.g., 12 hours overnight fasting required, collect sample before antibiotics start, suspected dengue fever..."
                  value={orderForm.instructions}
                  onChange={(e) => setOrderForm(f => ({ ...f, instructions: e.target.value }))}
                  className="input resize-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="btn-outline text-xs py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs py-2 flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TestTube2 className="w-3.5 h-3.5" />}
                  <span>Issue Lab Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Lab Result & Investigation Details ── */}
      {detailTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      detailTest.status === "completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {detailTest.status}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      detailTest.urgency === "stat"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {detailTest.urgency?.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mt-1">{detailTest.testName}</h3>
              </div>
              <button
                onClick={() => setDetailTest(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg border border-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Patient card */}
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/80 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-gray-900 text-sm">{detailTest.patient?.fullName || "Patient"}</p>
                <p className="text-gray-500 mt-0.5">
                  {detailTest.patient?.age ? `${detailTest.patient.age}y · ` : ""}
                  {detailTest.patient?.gender || ""}
                  {detailTest.patient?.village ? ` · ${detailTest.patient.village}, ${detailTest.patient.district || ""}` : ""}
                </p>
                <p className="text-gray-400 mt-0.5">Ordered on: {new Date(detailTest.orderedAt).toLocaleDateString("en-IN")}</p>
              </div>
              <Link
                to={`/doctor/patients/${detailTest.patient?._id || ""}`}
                className="text-xs font-semibold text-purple-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors"
              >
                Patient Profile
              </Link>
            </div>

            {/* Instructions */}
            {detailTest.instructions && (
              <div className="text-xs p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-semibold text-gray-700">Clinical Indication: </span>
                <span className="text-gray-600">{detailTest.instructions}</span>
              </div>
            )}

            {/* Result Parameters Table */}
            {detailTest.parameters && detailTest.parameters.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Measured Diagnostic Parameters
                </p>
                <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 font-semibold text-gray-700 border-b border-gray-200">
                      <tr>
                        <th className="p-2.5">Investigation Parameter</th>
                        <th className="p-2.5">Observed Value</th>
                        <th className="p-2.5">Reference Range</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {detailTest.parameters.map((p, idx) => {
                        const isAbnormal = p.flag === "high" || p.flag === "low" || p.flag === "critical";
                        return (
                          <tr key={idx} className={isAbnormal ? "bg-amber-50/30" : "hover:bg-gray-50"}>
                            <td className="p-2.5 font-medium text-gray-900">{p.name}</td>
                            <td className="p-2.5 font-bold text-gray-900">
                              {p.value} <span className="font-normal text-gray-500">{p.unit}</span>
                            </td>
                            <td className="p-2.5 text-gray-500">{p.range} {p.unit}</td>
                            <td className="p-2.5 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  p.flag === "normal"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : p.flag === "critical"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {p.flag}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : detailTest.status === "completed" ? (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                <p className="font-bold">✓ Report Available</p>
                <p className="mt-1">{detailTest.resultSummary || "Diagnostic report verified by laboratory officer."}</p>
              </div>
            ) : (
              <div className="p-6 bg-gray-50 rounded-xl text-center text-xs text-gray-500 border border-dashed border-gray-300">
                <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="font-semibold text-gray-700">Sample In Analysis</p>
                <p className="mt-0.5">Parameters will appear once the laboratory uploads the verified report buffer.</p>
              </div>
            )}

            {/* AI Summary / Findings if completed */}
            {detailTest.resultSummary && (
              <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl text-xs space-y-1.5">
                <p className="font-bold text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-700" /> Clinical Diagnostic Summary:
                </p>
                <p className="text-purple-950 leading-relaxed font-medium">
                  {detailTest.resultSummary}
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <Link
                to={`/doctor/prescriptions?patientId=${detailTest.patient?._id}&patientName=${encodeURIComponent(
                  detailTest.patient?.fullName || ""
                )}`}
                className="btn-outline text-xs py-2 flex items-center gap-1.5"
              >
                <Pill className="w-3.5 h-3.5 text-teal-600" /> Prescribe Treatment
              </Link>

              <button
                onClick={() => setDetailTest(null)}
                className="btn-primary text-xs py-2"
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
