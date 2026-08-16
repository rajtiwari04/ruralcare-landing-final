import React, { useState, useEffect, useMemo } from "react";
import { labAPI } from "../../services/index";
import { useAuth } from "../../context/AuthContext";
import {
  TestTube2, Search, Filter, RefreshCw, Eye, FileText,
  Calendar, User, Clock, CheckCircle2, AlertTriangle,
  Download, Printer, X, Sparkles, Stethoscope, ChevronRight,
  ArrowUpRight, AlertCircle, Loader2
} from "lucide-react";

const MOCK_PATIENT_LABS = [
  {
    _id: "lab-p01",
    testName: "Complete Blood Count (CBC) with Platelets",
    testType: "blood",
    urgency: "urgent",
    status: "completed",
    riskLevel: "medium",
    doctor: { fullName: "Dr. Anshuman Sharma" },
    instructions: "Fasting sample preferred. Suspected viral fever / low platelets.",
    orderedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    resultSummary: "Hemoglobin is mildly low (10.2 g/dL). Platelet count reduced to 1.15 Lakhs/cumm. Mild viral-induced transient thrombocytopenia. Hydration and follow-up recommended.",
    parameters: [
      { name: "Hemoglobin (Hb)", value: "10.2", unit: "g/dL", range: "12.0 - 15.5", flag: "low" },
      { name: "Total Leukocyte Count (TLC)", value: "4,200", unit: "/cumm", range: "4,000 - 11,000", flag: "normal" },
      { name: "Platelet Count", value: "1,15,000", unit: "/cumm", range: "1,50,000 - 4,50,000", flag: "low" },
      { name: "Packed Cell Volume (PCV)", value: "32.0", unit: "%", range: "36.0 - 46.0", flag: "low" },
      { name: "Neutrophils", value: "58", unit: "%", range: "40 - 75", flag: "normal" },
      { name: "Lymphocytes", value: "34", unit: "%", range: "20 - 45", flag: "normal" },
    ],
  },
  {
    _id: "lab-p02",
    testName: "Fasting Lipid Profile & Blood Sugar",
    testType: "blood",
    urgency: "routine",
    status: "completed",
    doctor: { fullName: "Dr. Anshuman Sharma" },
    instructions: "12 hours strict overnight fasting.",
    orderedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    resultSummary: "Fasting glucose normal (88 mg/dL). Total cholesterol is borderline elevated (215 mg/dL). Triglycerides slightly high.",
    parameters: [
      { name: "Fasting Blood Sugar (FBS)", value: "88", unit: "mg/dL", range: "70 - 100", flag: "normal" },
      { name: "Total Cholesterol", value: "215", unit: "mg/dL", range: "125 - 200", flag: "high" },
      { name: "Triglycerides", value: "168", unit: "mg/dL", range: "< 150", flag: "high" },
      { name: "HDL (Good) Cholesterol", value: "46", unit: "mg/dL", range: "> 40", flag: "normal" },
      { name: "LDL (Bad) Cholesterol", value: "135", unit: "mg/dL", range: "< 100", flag: "high" },
    ],
  },
  {
    _id: "lab-p03",
    testName: "Dengue NS1 Antigen & Malaria Rapid Card",
    testType: "blood",
    urgency: "stat",
    status: "processing",
    riskLevel: "high",
    doctor: { fullName: "Dr. Anshuman Sharma" },
    instructions: "Sample collected at PHC lab. Processing for rapid diagnostic serology.",
    orderedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    completedAt: null,
    resultSummary: null,
    parameters: [],
  },
];

export default function LabTestsPage() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTest, setSelectedTest] = useState(null);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await labAPI.getPatientList();
      const apiTests = res.data?.data?.tests;
      setTests(Array.isArray(apiTests) ? apiTests : []);
    } catch {
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const stats = useMemo(() => {
    const total = tests.length;
    const completed = tests.filter(t => t.status === "completed").length;
    const inProgress = tests.filter(t => t.status !== "completed" && t.status !== "cancelled").length;
    const attention = tests.filter(t => t.riskLevel === "high" || t.urgency === "stat").length;
    return { total, completed, inProgress, attention };
  }, [tests]);

  const filteredTests = useMemo(() => {
    return tests.filter(t => {
      if (activeTab === "completed" && t.status !== "completed") return false;
      if (activeTab === "inProgress" && t.status === "completed") return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (t.testName || "").toLowerCase();
        const doc = (t.doctor?.fullName || "").toLowerCase();
        const summary = (t.resultSummary || "").toLowerCase();
        return name.includes(q) || doc.includes(q) || summary.includes(q);
      }
      return true;
    });
  }, [tests, activeTab, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <TestTube2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laboratory Investigations</h1>
            <p className="text-sm text-gray-500">Track doctor-prescribed medical tests, sample statuses, and verified results.</p>
          </div>
        </div>
        <button
          onClick={fetchTests}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white border border-gray-200 rounded-xl transition-colors self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-600" : ""}`} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="card p-4">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tests</span>
            <TestTube2 className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-0.5">Ordered for you</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">{stats.inProgress}</p>
          <p className="text-xs text-gray-500 mt-0.5">Processing in lab</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{stats.completed}</p>
          <p className="text-xs text-gray-500 mt-0.5">Results ready</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Attention</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-700 mt-2">{stats.attention}</p>
          <p className="text-xs text-gray-500 mt-0.5">High priority / Abnormal</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Tests", count: stats.total },
              { id: "inProgress", label: "In Progress", count: stats.inProgress },
              { id: "completed", label: "Completed Reports", count: stats.completed },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tests or doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-8 text-xs w-full sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* Tests List */}
      {loading ? (
        <div className="card text-center py-16">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 font-medium text-sm">Loading lab tests...</p>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="card text-center py-16 border-dashed border-2">
          <TestTube2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-800 font-bold text-base">No lab tests found</p>
          <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">
            {searchQuery ? "No tests match your search filter." : "You do not have any lab tests ordered currently."}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredTests.map((test) => {
            const isCompleted = test.status === "completed";
            return (
              <div key={test._id} className="card p-5 hover:border-purple-300 transition-all space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-base">{test.testName}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        test.urgency === "stat" ? "bg-red-100 text-red-700" : test.urgency === "urgent" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
                      }`}>
                        {test.urgency}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <span>Prescribed by: <strong className="text-gray-700">{test.doctor?.fullName || "Consulting Doctor"}</strong></span>
                      <span>•</span>
                      <span>Ordered: {new Date(test.orderedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </p>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full self-start ${
                    isCompleted ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}>
                    {isCompleted ? "✓ Result Ready" : "⏳ " + (test.status?.replace("_", " ") || "In Progress")}
                  </span>
                </div>

                {test.instructions && (
                  <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl">
                    <span className="font-semibold text-gray-700">Preparation / Advice: </span>
                    {test.instructions}
                  </p>
                )}

                {test.resultSummary && (
                  <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100 text-xs text-purple-950 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-purple-900">
                      <Sparkles className="w-3.5 h-3.5 text-purple-700" /> Lab Findings Summary:
                    </p>
                    <p className="leading-relaxed">{test.resultSummary}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-gray-400 capitalize">
                    Specimen: {test.testType}
                  </span>
                  {isCompleted ? (
                    <button
                      onClick={() => setSelectedTest(test)}
                      className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Full Report & Values
                    </button>
                  ) : (
                    <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg font-medium">
                      Sample under analysis at primary health lab
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Verified Lab Report
                </span>
                <h3 className="font-bold text-gray-900 text-lg mt-1">{selectedTest.testName}</h3>
              </div>
              <button
                onClick={() => setSelectedTest(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg border border-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl text-xs space-y-1">
              <p><span className="text-gray-500">Prescribed by:</span> <strong>{selectedTest.doctor?.fullName || "Consulting Doctor"}</strong></p>
              <p><span className="text-gray-500">Report Date:</span> {new Date(selectedTest.completedAt || selectedTest.orderedAt).toLocaleDateString("en-IN")}</p>
            </div>

            {selectedTest.parameters && selectedTest.parameters.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-700">Measured Values</p>
                <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                      <tr>
                        <th className="p-2.5">Parameter</th>
                        <th className="p-2.5">Observed</th>
                        <th className="p-2.5">Ref Range</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedTest.parameters.map((p, i) => (
                        <tr key={i} className={p.flag !== "normal" ? "bg-amber-50/40" : ""}>
                          <td className="p-2.5 font-medium text-gray-900">{p.name}</td>
                          <td className="p-2.5 font-bold text-gray-900">{p.value} {p.unit}</td>
                          <td className="p-2.5 text-gray-500">{p.range} {p.unit}</td>
                          <td className="p-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              p.flag === "normal" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {p.flag}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedTest.resultSummary && (
              <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 text-xs space-y-1">
                <p className="font-bold text-purple-900">Clinical Interpretation:</p>
                <p className="text-purple-950 leading-relaxed">{selectedTest.resultSummary}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => window.print()}
                className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button
                onClick={() => setSelectedTest(null)}
                className="btn-primary text-xs py-2 px-4"
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
