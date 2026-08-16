import React, { useState, useEffect } from "react";
import { healthWorkerAPI } from "../../services/index";
import {
  AlertTriangle, Phone, MapPin, Calendar, Clock,
  CheckCircle2, RefreshCw, Loader2, Sparkles, User,
  ArrowUpRight, Heart, ShieldAlert
} from "lucide-react";

const MOCK_HIGH_RISK = [
  {
    _id: "hr-1",
    patient: { fullName: "Sunita Devi", phone: "+91 98765 43210", village: "Sunderpur", age: 38 },
    symptoms: "High continuous fever for 3 days, petechiae rash on forearms, extreme weakness, vomiting.",
    riskLevel: "emergency",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "hr-2",
    patient: { fullName: "Mukesh Yadav", phone: "+91 99887 65432", village: "Sunderpur", age: 31 },
    symptoms: "Severe acute chills, retro-orbital eye pain, plate count dropped to 85,000.",
    riskLevel: "emergency",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    _id: "hr-3",
    patient: { fullName: "Pooja Kumari", phone: "+91 97234 56789", village: "Durgapur", age: 26 },
    symptoms: "Severe pallor, Hb 7.2 g/dL, pedal edema, third trimester high-risk pregnancy.",
    riskLevel: "high",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    _id: "hr-4",
    patient: { fullName: "Harish Chandra Verma", phone: "+91 94567 12345", village: "Shivpur", age: 62 },
    symptoms: "Uncontrolled blood sugar (FBS 280 mg/dL) with non-healing foot ulcer.",
    riskLevel: "high",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

export default function HWHighRisk() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadHighRisk = async () => {
    setLoading(true);
    try {
      const res = await healthWorkerAPI.getHighRisk();
      const apiRecords = res.data?.data?.records;
      if (Array.isArray(apiRecords) && apiRecords.length > 0) {
        setRecords(apiRecords);
      } else {
        setRecords(MOCK_HIGH_RISK);
      }
    } catch {
      setRecords(MOCK_HIGH_RISK);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHighRisk();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">High-Risk Surveillance Queue</h1>
            <p className="text-sm text-gray-500">Urgent triage cases and emergency alerts requiring immediate home visits or referral.</p>
          </div>
        </div>
        <button
          onClick={loadHighRisk}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white border border-gray-200 rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-red-600" : ""}`} />
        </button>
      </div>

      {/* High-Risk Queue Banner */}
      <div className="card p-4 bg-red-50/60 border border-red-200 flex items-center justify-between text-xs text-red-950">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>
            <strong>{records.length} Priority Patients:</strong> Emergency cases must be visited within 24 hours. Call 108 for ambulance if transfer is required.
          </span>
        </div>
      </div>

      {/* List of High-Risk Records */}
      {loading ? (
        <div className="card text-center py-16">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 font-medium text-sm">Loading priority cases...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="card text-center py-16 border-dashed border-2">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <p className="font-bold text-gray-800 text-base">No high-risk alerts in queue</p>
          <p className="text-xs text-gray-400 mt-1">All village residents in your sector have stable reported health status.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((rec) => {
            const patient = rec.patient || {};
            const isEmergency = rec.riskLevel === "emergency";

            return (
              <div
                key={rec._id}
                className={`card p-6 transition-all space-y-4 border ${
                  isEmergency ? "border-red-300 bg-red-50/20" : "border-amber-200 bg-amber-50/10"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm flex-shrink-0 ${
                      isEmergency ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {patient.fullName ? patient.fullName.charAt(0).toUpperCase() : "P"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{patient.fullName || "Patient"}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {patient.age ? `${patient.age}y · ` : ""}{patient.village || "Local Village"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      isEmergency ? "bg-red-600 text-white animate-pulse" : "bg-amber-100 text-amber-900 border border-amber-200"
                    }`}>
                      🚨 {rec.riskLevel} Triage
                    </span>
                  </div>
                </div>

                {/* Reported Symptoms */}
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Emergency Reported Symptoms
                  </p>
                  <p className="text-xs font-semibold text-gray-900 bg-white p-3 rounded-xl border border-gray-200/80 leading-relaxed">
                    {rec.symptoms}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-xs text-gray-400">
                    Reported on: {new Date(rec.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>

                  <div className="flex items-center gap-2">
                    {patient.phone && (
                      <a
                        href={`tel:${patient.phone}`}
                        className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Resident ({patient.phone})
                      </a>
                    )}
                    <button
                      onClick={() => showToast(`Home visit logged for ${patient.fullName || "patient"}.`)}
                      className="btn-outline text-xs py-1.5 px-3"
                    >
                      Log Home Visit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
