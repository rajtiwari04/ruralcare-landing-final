import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { prescriptionAPI } from "../../services/index";
import { useAuth } from "../../context/AuthContext";
import { formatDoctorName } from "../../utils/doctor";
import {
  Pill, Search, Calendar, User, Printer, Download, Eye,
  FileText, Clock, AlertCircle, RefreshCw, X, ChevronRight, CheckCircle2, Stethoscope, ChevronDown, ChevronUp
} from "lucide-react";
import {
  PatientPage, PageHeader, Surface, SectionLabel, SoftChip, StatusBadge,
  EmptyState, Skeleton, ErrorState, PatientBtn, Disclaimer, RefreshButton, T,
} from "../../components/patient/ui";
import { formatShortDate } from "../../design/tokens";

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const printAreaRef = useRef(null);

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // "all", "active", "followup"
  const [selectedRx, setSelectedRx] = useState(null); // Rx for detail view modal
  const [expandedRxId, setExpandedRxId] = useState(null);

  const loadPrescriptions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await prescriptionAPI.getPatientList();
      const list = res.data?.data?.prescriptions || [];
      setPrescriptions(list);
    } catch (err) {
      console.error("Error loading prescriptions:", err);
      setError("Unable to load your prescriptions. Please check your network connection.");
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrescriptions();
  }, [loadPrescriptions]);

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  // Filtered prescriptions list
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((rx) => {
      const q = searchQuery.toLowerCase().trim();
      const doctorName = (rx.doctor?.fullName || "").toLowerCase();
      const diagnosis = (rx.diagnosis || "").toLowerCase();
      const meds = (rx.medicines || []).map((m) => (m.name || "").toLowerCase()).join(" ");

      const matchesSearch = !q || doctorName.includes(q) || diagnosis.includes(q) || meds.includes(q);

      if (!matchesSearch) return false;

      if (filterTab === "followup") {
        if (!rx.followUpDate) return false;
        const followUpTime = new Date(rx.followUpDate).getTime();
        return followUpTime >= Date.now() - 86400000;
      }

      if (filterTab === "active") {
        // Created within last 30 days or has upcoming follow up
        const createdTime = new Date(rx.createdAt).getTime();
        const thirtyDaysAgo = Date.now() - 30 * 86400000;
        return createdTime >= thirtyDaysAgo;
      }

      return true;
    });
  }, [prescriptions, searchQuery, filterTab]);

  return (
    <PatientPage>
      <PageHeader
        title="Prescriptions"
        subtitle="View medicines, dosage instructions, diagnosis, and follow-up information prescribed by your doctors."
        action={<RefreshButton onClick={loadPrescriptions} loading={loading} />}
      />

      {/* Search & Filter Bar */}
      <Surface className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.inkLight }} />
            <input
              type="text"
              placeholder="Search doctor, diagnosis, or medicine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border outline-none transition-colors"
              style={{ borderColor: T.border, background: T.bg, color: T.ink }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-black/5"
                style={{ color: T.inkLight }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <SoftChip active={filterTab === "all"} onClick={() => setFilterTab("all")}>
              All ({prescriptions.length})
            </SoftChip>
            <SoftChip active={filterTab === "active"} onClick={() => setFilterTab("active")}>
              Recent (30d)
            </SoftChip>
            <SoftChip active={filterTab === "followup"} onClick={() => setFilterTab("followup")}>
              Follow-up Due
            </SoftChip>
          </div>
        </div>
      </Surface>

      {/* Error state */}
      {error && <ErrorState message={error} onRetry={loadPrescriptions} />}

      {/* Loading state */}
      {loading && prescriptions.length === 0 && (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredPrescriptions.length === 0 && !error && (
        <Surface>
          <EmptyState
            title={searchQuery ? "No matching prescriptions" : "No prescriptions yet"}
            description={
              searchQuery
                ? "Try adjusting your search or filter criteria."
                : "Prescriptions issued by your doctors will appear here."
            }
            action={
              searchQuery ? (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); setFilterTab("all"); }}
                  className="text-xs font-semibold px-4 py-2 rounded-full border"
                  style={{ borderColor: T.border, color: T.teal, background: T.surfaceRaised }}
                >
                  Clear Filters
                </button>
              ) : null
            }
          />
        </Surface>
      )}

      {/* Prescription Cards List */}
      {!loading && filteredPrescriptions.length > 0 && (
        <div className="space-y-4">
          {filteredPrescriptions.map((rx) => {
            const rxIdStr = rx._id ? rx._id.slice(-8).toUpperCase() : "RX";
            const doctorDisplayName = formatDoctorName(rx.doctor?.fullName || "Dr. Medical Officer");
            const isExpanded = expandedRxId === rx._id;

            return (
              <Surface key={rx._id} className="p-5 space-y-4 transition-all duration-200 hover:border-teal-800/30">
                {/* Card Header: Doctor info & Rx metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: T.borderSoft }}>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: T.tealSoft, color: T.teal }}
                    >
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold" style={{ color: T.ink, fontFamily: "Syne, sans-serif" }}>
                          {doctorDisplayName}
                        </h3>
                        <StatusBadge status="info">Rx #{rxIdStr}</StatusBadge>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: T.inkLight }}>
                        Issued on {formatShortDate(rx.createdAt)}
                        {rx.doctor?.district ? ` · ${rx.doctor.district}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setSelectedRx(rx)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                      style={{ borderColor: T.teal, color: T.teal, background: T.tealSoft }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Full Prescription
                    </button>
                  </div>
                </div>

                {/* Diagnosis Section */}
                {rx.diagnosis && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: T.inkLight }}>
                      Diagnosis & Clinical Impression
                    </p>
                    <div
                      className="p-3 rounded-xl text-xs font-medium border-l-4 leading-relaxed"
                      style={{ background: T.tealSoft, borderColor: T.teal, color: T.ink }}
                    >
                      {rx.diagnosis}
                    </div>
                  </div>
                )}

                {/* Prescribed Medicines Summary */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: T.inkLight }}>
                      Prescribed Medicines ({(rx.medicines || []).length})
                    </p>
                    <button
                      type="button"
                      onClick={() => setExpandedRxId(isExpanded ? null : rx._id)}
                      className="text-xs font-semibold flex items-center gap-1"
                      style={{ color: T.teal }}
                    >
                      {isExpanded ? (
                        <>Hide Details <ChevronUp className="w-3.5 h-3.5" /></>
                      ) : (
                        <>Show All Medicines <ChevronDown className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  </div>

                  <div className="divide-y rounded-xl border overflow-hidden" style={{ borderColor: T.borderSoft, background: T.surface }}>
                    {(isExpanded ? rx.medicines : (rx.medicines || []).slice(0, 2)).map((med, idx) => (
                      <div key={idx} className="p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold" style={{ color: T.ink }}>
                            {idx + 1}. {med.name}
                          </span>
                          {med.dosage && (
                            <span className="font-semibold px-2 py-0.5 rounded text-[11px]" style={{ background: T.bgAlt, color: T.inkMid }}>
                              {med.dosage}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: T.inkMid }}>
                          {med.frequency && <span><strong>Freq:</strong> {med.frequency}</span>}
                          {med.duration && <span><strong>Duration:</strong> {med.duration}</span>}
                          {med.route && <span><strong>Route:</strong> {med.route}</span>}
                        </div>
                        {med.instructions && (
                          <p className="text-[11px] italic pt-0.5" style={{ color: T.inkLight }}>
                            • {med.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                    {!isExpanded && (rx.medicines || []).length > 2 && (
                      <button
                        type="button"
                        onClick={() => setExpandedRxId(rx._id)}
                        className="w-full py-2 text-center text-xs font-semibold transition-colors"
                        style={{ color: T.teal, background: T.tealSoft }}
                      >
                        + {(rx.medicines || []).length - 2} more medicine(s)
                      </button>
                    )}
                  </div>
                </div>

                {/* Additional advice & Follow-up */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs" style={{ color: T.inkMid }}>
                  {rx.additionalNotes ? (
                    <p className="truncate max-w-md">
                      <strong style={{ color: T.ink }}>Advice:</strong> {rx.additionalNotes}
                    </p>
                  ) : <span />}

                  {rx.followUpDate && (
                    <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto font-medium" style={{ color: T.teal }}>
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Follow-up: {formatShortDate(rx.followUpDate)}</span>
                    </div>
                  )}
                </div>
              </Surface>
            );
          })}
        </div>
      )}

      {/* Disclaimer */}
      <Disclaimer />

      {/* ── PRESCRIPTION DETAIL & PRINT MODAL ── */}
      {selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border flex flex-col max-h-[92vh]"
            style={{ background: T.surfaceRaised, borderColor: T.border }}
          >
            {/* Modal actions bar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b print:hidden" style={{ borderColor: T.borderSoft }}>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" style={{ color: T.teal }} />
                <h3 className="font-semibold text-base" style={{ color: T.ink, fontFamily: "Syne, sans-serif" }}>
                  Digital Prescription Details
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full text-white shadow-sm"
                  style={{ background: T.teal }}
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRx(null)}
                  className="p-1.5 rounded-lg border transition-colors"
                  style={{ borderColor: T.border, color: T.inkLight }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Prescription Document Area */}
            <div
              ref={printAreaRef}
              className="flex-1 overflow-y-auto p-5 sm:p-6 bg-white border rounded-xl space-y-5 text-gray-900 print:border-none print:p-0"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-teal-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold text-base">
                      +
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-teal-900">RuralCare AI</h2>
                      <p className="text-[11px] text-teal-700 font-medium">Digital Primary Healthcare Network</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Telemedicine & Rural Primary Health Center</p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-sm text-gray-900">
                    {formatDoctorName(selectedRx.doctor?.fullName || "Dr. Medical Officer")}
                  </p>
                  <p className="text-xs text-teal-800 font-medium">
                    {selectedRx.doctor?.specialization || "General Physician & Rural Health"}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Date: {new Date(selectedRx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <p className="text-[11px] font-mono text-gray-400">
                    Rx ID: #{selectedRx._id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Patient Banner */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <p className="text-gray-400 uppercase text-[10px] font-bold">Patient Name</p>
                  <p className="font-bold text-gray-900 mt-0.5">{selectedRx.patient?.fullName || user?.fullName || "Patient"}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase text-[10px] font-bold">Age / Gender</p>
                  <p className="font-semibold text-gray-800 mt-0.5">
                    {selectedRx.patient?.age || user?.age || "—"} Y / {selectedRx.patient?.gender || user?.gender || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase text-[10px] font-bold">Location</p>
                  <p className="font-semibold text-gray-800 mt-0.5">
                    {selectedRx.patient?.village || user?.village || "—"}, {selectedRx.patient?.district || user?.district || ""}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase text-[10px] font-bold">Contact</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{selectedRx.patient?.phone || user?.phone || "—"}</p>
                </div>
              </div>

              {/* Diagnosis */}
              {selectedRx.diagnosis && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-1">
                    Diagnosis & Findings
                  </p>
                  <div className="p-2.5 bg-teal-50/50 border-l-4 border-teal-700 text-xs font-medium text-gray-800">
                    {selectedRx.diagnosis}
                  </div>
                </div>
              )}

              {/* Rx Medication Table */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-serif font-black text-teal-800">℞</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Prescribed Medicines
                  </span>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 font-semibold text-gray-700 border-b border-gray-200">
                      <tr>
                        <th className="p-2 w-8">#</th>
                        <th className="p-2">Medicine Name</th>
                        <th className="p-2">Dosage</th>
                        <th className="p-2">Frequency & Timing</th>
                        <th className="p-2">Duration</th>
                        <th className="p-2">Route</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(selectedRx.medicines || []).map((m, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-2 text-gray-400 font-bold">{idx + 1}</td>
                          <td className="p-2 font-bold text-gray-900">
                            {m.name}
                            {m.instructions && (
                              <p className="text-[11px] font-normal text-gray-500 italic mt-0.5">
                                • {m.instructions}
                              </p>
                            )}
                          </td>
                          <td className="p-2 font-medium text-gray-700">{m.dosage || "—"}</td>
                          <td className="p-2 font-semibold text-teal-800">{m.frequency || "—"}</td>
                          <td className="p-2 font-medium text-gray-700">{m.duration || "—"}</td>
                          <td className="p-2 text-gray-500">{m.route || "Oral"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Advice & Instructions */}
              {selectedRx.additionalNotes && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Special Advice / Lifestyle
                  </p>
                  <p className="text-xs text-gray-700 p-2.5 bg-gray-50 rounded-lg border border-gray-200 leading-relaxed">
                    {selectedRx.additionalNotes}
                  </p>
                </div>
              )}

              {/* Follow-up & Footer */}
              <div className="pt-4 border-t border-gray-200 flex items-end justify-between text-xs">
                <div>
                  {selectedRx.followUpDate ? (
                    <p className="font-semibold text-teal-800">
                      🔄 Recommended Follow-up:{" "}
                      {new Date(selectedRx.followUpDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  ) : (
                    <p className="text-gray-400">Follow-up as needed or report if symptoms persist.</p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">
                    Emergency: Contact nearest Primary Health Center (PHC) or call 108.
                  </p>
                </div>

                {/* Doctor Signature */}
                <div className="text-center w-48">
                  <div className="h-10 border-b border-gray-400 border-dashed mb-1 flex items-end justify-center">
                    <span className="text-[11px] font-serif italic text-teal-800">
                      {formatDoctorName(selectedRx.doctor?.fullName || "Dr. Medical Officer")}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-gray-700">Authorizing Medical Doctor</p>
                  <p className="text-[9px] text-gray-400">RuralCare AI Verified Practitioner</p>
                </div>
              </div>

              {/* Document Disclaimer */}
              <p className="text-[9px] text-center text-gray-400 pt-2 border-t border-gray-100">
                This digital prescription is generated on the RuralCare AI teleconsultation and clinic platform for community healthcare.
              </p>
            </div>
          </div>
        </div>
      )}
    </PatientPage>
  );
}
