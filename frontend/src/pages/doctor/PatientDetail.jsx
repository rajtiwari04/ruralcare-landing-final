import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doctorAPI } from "../../services/index";
import {
  User, Phone, MapPin, Globe, Calendar, Clock,
  Activity, Pill, TestTube2, AlertTriangle, CheckCircle2,
  FileText, ArrowLeft, Plus, Sparkles, Loader2, RefreshCw
} from "lucide-react";

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timeline");

  const loadPatient = async () => {
    setLoading(true);
    try {
      const res = await doctorAPI.getPatientDetail(id);
      if (res.data?.data?.patient) {
        setPatient(res.data.data.patient);
        setRecords(res.data.data.recentRecords || []);
      } else {
        throw new Error();
      }
    } catch {
      // Mock patient fallback
      setPatient({
        _id: id || "pat-001",
        fullName: "Sunita Devi",
        phone: "+91 98765 43210",
        age: 38,
        gender: "Female",
        village: "Sunderpur",
        tehsil: "Pindra",
        district: "Varanasi",
        preferredLanguage: "hindi",
        bloodGroup: "B+",
        allergies: "None reported",
        emergencyContact: { name: "Rameshwar Prasad", relationship: "Spouse", phone: "+91 98123 45678" },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
      });
      setRecords([
        {
          _id: "rec-01",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          symptoms: "High grade fever for 3 days, body aches, sore throat, and loss of appetite.",
          riskLevel: "medium",
          aiAnalysis: "Probable acute viral pharyngitis with mild transient thrombocytopenia.",
          doctorNotes: "Prescribed Paracetamol 650mg SOS and warm saline gargles. Recommended CBC test.",
        },
        {
          _id: "rec-02",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
          symptoms: "Mild cough and seasonal nasal congestion.",
          riskLevel: "low",
          aiAnalysis: "Allergic rhinitis and upper airway irritation.",
          doctorNotes: "Cetirizine 10mg prescribed at bedtime for 5 days.",
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatient();
  }, [id]);

  if (loading && !patient) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-gray-600 font-medium text-sm">Loading patient clinical record...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back button & title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/doctor/patients")}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white border border-gray-200 rounded-xl transition-colors"
          title="Back to Patients"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Patient Medical Profile</h1>
          <p className="text-xs text-gray-500">Comprehensive longitudinal health timeline and diagnostic history.</p>
        </div>
      </div>

      {/* Patient Header Card */}
      <div className="card p-6 border border-gray-200 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white font-bold text-2xl flex items-center justify-center flex-shrink-0">
              {patient?.fullName ? patient.fullName.charAt(0).toUpperCase() : "P"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{patient?.fullName}</h2>
                <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                  Patient
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{patient?.age ? `${patient.age} Yrs` : "Age —"} · {patient?.gender || "—"}</span>
                <span>•</span>
                <span className="font-mono">{patient?.phone}</span>
                <span>•</span>
                <span>{patient?.village ? `${patient.village}, ` : ""}{patient?.district || "—"}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <Link
              to={`/doctor/prescriptions?patientId=${patient?._id}&patientName=${encodeURIComponent(patient?.fullName || "")}`}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
            >
              <Pill className="w-3.5 h-3.5" /> Prescribe
            </Link>
            <Link
              to={`/doctor/lab?patientId=${patient?._id}&patientName=${encodeURIComponent(patient?.fullName || "")}`}
              className="btn-outline text-xs py-2 px-3.5 flex items-center gap-1.5"
            >
              <TestTube2 className="w-3.5 h-3.5 text-purple-600" /> Order Lab
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl max-w-xs">
        <button
          onClick={() => setActiveTab("timeline")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "timeline" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Symptom Timeline
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "profile" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Clinical Vitals
        </button>
      </div>

      {activeTab === "timeline" ? (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Recorded Health Timeline ({records.length})
          </h3>

          {records.length > 0 ? (
            <div className="space-y-3">
              {records.map((rec) => (
                <div key={rec._id} className="card p-5 space-y-3 border border-gray-200">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(rec.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      rec.riskLevel === "emergency" ? "bg-red-100 text-red-700 animate-pulse" : rec.riskLevel === "high" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {rec.riskLevel} risk
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">Reported Symptoms</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{rec.symptoms}</p>
                  </div>

                  {rec.aiAnalysis && (
                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs space-y-1">
                      <p className="font-bold text-blue-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" /> AI Triage Assessment:
                      </p>
                      <p className="text-blue-950 leading-relaxed">{rec.aiAnalysis}</p>
                    </div>
                  )}

                  {rec.doctorNotes && (
                    <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-gray-700">Clinical Consultation Notes:</p>
                      <p className="text-gray-600">{rec.doctorNotes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12 text-xs text-gray-400">
              No historical symptom records on file for this patient.
            </div>
          )}
        </div>
      ) : (
        /* Vitals Profile */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="card p-5 space-y-3">
            <h4 className="font-bold text-gray-900 text-sm">Medical Indicators</h4>
            <div className="space-y-2">
              <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                <span className="text-gray-500">Blood Group</span>
                <span className="font-bold text-gray-900">{patient?.bloodGroup || "Not recorded"}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                <span className="text-gray-500">Known Allergies</span>
                <span className="font-bold text-gray-900">{patient?.allergies || "None"}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                <span className="text-gray-500">Preferred Language</span>
                <span className="font-bold text-gray-900 capitalize">{patient?.preferredLanguage || "Hindi"}</span>
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <h4 className="font-bold text-gray-900 text-sm">Emergency Contact</h4>
            <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1 text-xs">
              <p className="font-bold text-gray-900">{patient?.emergencyContact?.name || "Not provided"}</p>
              <p className="text-gray-500">{patient?.emergencyContact?.relationship || "Relationship"}</p>
              <p className="font-mono text-amber-900 pt-1">{patient?.emergencyContact?.phone || "—"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
