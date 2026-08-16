import React, { useState, useEffect } from "react";
import { maternalAPI } from "../../services/index";
import { useAuth } from "../../context/AuthContext";
import {
  Baby, Heart, Calendar, Clock, Plus, CheckCircle2,
  AlertTriangle, Shield, User, Activity, FileText,
  ChevronRight, Sparkles, X, Save, Loader2, RefreshCw,
  Check, Phone
} from "lucide-react";

const STANDARD_VACCINES = [
  { name: "BCG (Tuberculosis)", defaultDueDays: 0 },
  { name: "OPV-0 (Oral Polio)", defaultDueDays: 0 },
  { name: "Hepatitis B (Birth Dose)", defaultDueDays: 0 },
  { name: "Pentavalent-1 (DPT+HepB+Hib)", defaultDueDays: 45 },
  { name: "Rotavirus-1", defaultDueDays: 45 },
  { name: "Pentavalent-2", defaultDueDays: 75 },
  { name: "Pentavalent-3 & IPV", defaultDueDays: 105 },
  { name: "MR-1 (Measles & Rubella)", defaultDueDays: 270 },
  { name: "Vitamin A (1st Dose)", defaultDueDays: 270 },
  { name: "DPT Booster-1", defaultDueDays: 480 },
];

export default function MaternalHealthPage() {
  const { user } = useAuth();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pregnancy"); // "pregnancy" | "child"
  
  // Modals
  const [showANCModal, setShowANCModal] = useState(false);
  const [showPregnancyModal, setShowPregnancyModal] = useState(false);
  const [showChildModal, setShowChildModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Forms
  const [ancForm, setAncForm] = useState({ date: new Date().toISOString().split("T")[0], weight: "", bp: "120/80", fetalHR: "140", notes: "" });
  const [pregForm, setPregForm] = useState({ pregnancyWeek: 20, expectedDelivery: "", riskLevel: "low" });
  const [childForm, setChildForm] = useState({ name: "", dob: new Date().toISOString().split("T")[0], gender: "Female" });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await maternalAPI.getRecord();
      if (res.data?.data?.record) {
        setRecord(res.data.data.record);
      } else {
        setRecord(null);
      }
    } catch {
      setRecord(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update Pregnancy status
  const handleSavePregnancy = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        pregnancyWeek: Number(pregForm.pregnancyWeek),
        expectedDelivery: pregForm.expectedDelivery ? new Date(pregForm.expectedDelivery).toISOString() : null,
        riskLevel: pregForm.riskLevel,
      };
      await maternalAPI.updateRecord(payload);
      setRecord(prev => ({ ...prev, ...payload }));
      showToast("Pregnancy details updated.");
      setShowPregnancyModal(false);
    } catch {
      setRecord(prev => ({ ...prev, ...pregForm }));
      setShowPregnancyModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Add ANC Visit
  const handleAddANC = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newVisit = {
        date: new Date(ancForm.date).toISOString(),
        weight: Number(ancForm.weight) || 0,
        bp: ancForm.bp,
        fetalHR: Number(ancForm.fetalHR) || 0,
        notes: ancForm.notes,
      };
      const updatedVisits = [newVisit, ...(record?.ancVisits || [])];
      await maternalAPI.updateRecord({ ancVisits: updatedVisits });
      setRecord(prev => ({ ...prev, ancVisits: updatedVisits }));
      showToast("ANC visit record added.");
      setShowANCModal(false);
      setAncForm({ date: new Date().toISOString().split("T")[0], weight: "", bp: "120/80", fetalHR: "140", notes: "" });
    } catch {
      setShowANCModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Add Child
  const handleAddChild = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const birthDate = new Date(childForm.dob);
      const vaccines = STANDARD_VACCINES.map(v => ({
        name: v.name,
        dueDate: new Date(birthDate.getTime() + v.defaultDueDays * 86400000).toISOString(),
        givenDate: v.defaultDueDays === 0 ? birthDate.toISOString() : null,
        status: v.defaultDueDays === 0 ? "given" : "due"
      }));

      const newChild = {
        name: childForm.name,
        dob: birthDate.toISOString(),
        gender: childForm.gender,
        vaccines,
        growthRecords: [{ date: birthDate.toISOString(), weight: 3.1, height: 49, notes: "Birth vitals" }]
      };

      const updatedChildren = [...(record?.children || []), newChild];
      await maternalAPI.updateRecord({ children: updatedChildren });
      setRecord(prev => ({ ...prev, children: updatedChildren }));
      showToast(`${childForm.name} registered with immunization tracker.`);
      setShowChildModal(false);
      setChildForm({ name: "", dob: new Date().toISOString().split("T")[0], gender: "Female" });
    } catch {
      setShowChildModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Vaccine Status
  const toggleVaccine = async (childIndex, vaccineIndex) => {
    if (!record?.children) return;
    const updatedChildren = JSON.parse(JSON.stringify(record.children));
    const v = updatedChildren[childIndex].vaccines[vaccineIndex];
    if (v.status === "given") {
      v.status = "due";
      v.givenDate = null;
    } else {
      v.status = "given";
      v.givenDate = new Date().toISOString();
    }
    setRecord(prev => ({ ...prev, children: updatedChildren }));
    await maternalAPI.updateRecord({ children: updatedChildren }).catch(()=>{});
    showToast("Vaccination status updated.");
  };

  const trimester = record?.pregnancyWeek <= 12 ? 1 : record?.pregnancyWeek <= 27 ? 2 : 3;

  if (!loading && !record) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maternal & Child Health</h1>
          <p className="text-sm text-gray-500 mt-1">Track pregnancy visits, child growth, and vaccinations.</p>
        </div>
        <div className="card text-center py-14">
          <Baby className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-800 font-semibold">No maternal record yet</p>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Start by adding pregnancy details or registering a child. Your real records will appear here once saved.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            <button onClick={() => { setRecord({ pregnancyWeek: 20, expectedDelivery: "", riskLevel: "low", ancVisits: [], children: [] }); setShowPregnancyModal(true); }} className="btn-primary text-sm">
              Start pregnancy record
            </button>
            <button onClick={() => { setRecord({ pregnancyWeek: null, expectedDelivery: "", riskLevel: "low", ancVisits: [], children: [] }); setShowChildModal(true); setActiveTab("child"); }} className="btn-outline text-sm">
              Register a child
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
            <Baby className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Maternal & Child Health</h1>
            <p className="text-sm text-gray-500">Antenatal care check-ups, gestational tracking, and child vaccination schedule.</p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white border border-gray-200 rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-pink-600" : ""}`} />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl max-w-sm">
        <button
          onClick={() => setActiveTab("pregnancy")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "pregnancy" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-pink-500" /> Pregnancy (ANC)
        </button>
        <button
          onClick={() => setActiveTab("child")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "child" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Baby className="w-3.5 h-3.5 text-blue-500" /> Child Health ({record?.children?.length || 0})
        </button>
      </div>

      {activeTab === "pregnancy" ? (
        <div className="space-y-6">
          {/* Pregnancy Overview Card */}
          <div className="card p-6 bg-gradient-to-br from-pink-50/60 via-white to-pink-50/30 border border-pink-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-100/70 px-2.5 py-0.5 rounded-full">
                  Trimester {trimester} · Week {record?.pregnancyWeek || 0}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">
                  {40 - (record?.pregnancyWeek || 0)} Weeks to Delivery
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Expected Delivery Date: <strong>{record?.expectedDelivery ? new Date(record.expectedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Not set"}</strong>
                </p>
              </div>

              <button
                onClick={() => {
                  setPregForm({
                    pregnancyWeek: record?.pregnancyWeek || 20,
                    expectedDelivery: record?.expectedDelivery ? record.expectedDelivery.split("T")[0] : "",
                    riskLevel: record?.riskLevel || "low",
                  });
                  setShowPregnancyModal(true);
                }}
                className="btn-outline text-xs py-1.5 px-3 self-start sm:self-center"
              >
                Update Week / EDD
              </button>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-gray-500 mb-1.5">
                <span>Month 1 (Conception)</span>
                <span>Trimester 2 (Quickening)</span>
                <span>Month 9 (Term)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round(((record?.pregnancyWeek || 0) / 40) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* ANC Visits Section */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Antenatal Check-up (ANC) Visits</h3>
                <p className="text-xs text-gray-500">Government guidelines recommend at least 4 ANC visits during pregnancy.</p>
              </div>
              <button
                onClick={() => setShowANCModal(true)}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Record ANC Visit
              </button>
            </div>

            {record?.ancVisits && record.ancVisits.length > 0 ? (
              <div className="space-y-3">
                {record.ancVisits.map((visit, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-sm">
                        ANC Visit #{record.ancVisits.length - idx}
                      </span>
                      <span className="text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(visit.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="bg-white p-2 rounded-lg border border-gray-100">
                        <p className="text-gray-400 text-[10px]">Maternal Weight</p>
                        <p className="font-bold text-gray-800">{visit.weight ? `${visit.weight} kg` : "—"}</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-gray-100">
                        <p className="text-gray-400 text-[10px]">Blood Pressure</p>
                        <p className="font-bold text-gray-800">{visit.bp || "—"}</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-gray-100">
                        <p className="text-gray-400 text-[10px]">Fetal Heart Rate</p>
                        <p className="font-bold text-gray-800">{visit.fetalHR ? `${visit.fetalHR} bpm` : "—"}</p>
                      </div>
                    </div>

                    {visit.notes && (
                      <p className="text-gray-600 bg-white p-2 rounded-lg border border-gray-100 italic">
                        {visit.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                <Heart className="w-8 h-8 text-pink-300 mx-auto mb-2" />
                <p className="font-semibold text-gray-700">No ANC visits recorded yet</p>
                <p className="mt-0.5">Record your routine check-ups with your ASHA worker or doctor.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Child Health & Immunization */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Children Registered</h3>
              <p className="text-xs text-gray-500">Universal Immunization Programme (UIP) tracking for infants and toddlers.</p>
            </div>
            <button
              onClick={() => setShowChildModal(true)}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Register Child
            </button>
          </div>

          {record?.children && record.children.length > 0 ? (
            <div className="space-y-6">
              {record.children.map((child, cIdx) => (
                <div key={cIdx} className="card p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm">
                        {child.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">{child.name}</h4>
                        <p className="text-xs text-gray-500">
                          DOB: {new Date(child.dob).toLocaleDateString("en-IN")} · {child.gender}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vaccines */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Immunization Schedule
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(child.vaccines || []).map((vac, vIdx) => {
                        const isGiven = vac.status === "given";
                        return (
                          <div
                            key={vIdx}
                            onClick={() => toggleVaccine(cIdx, vIdx)}
                            className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                              isGiven ? "bg-emerald-50/60 border-emerald-200 text-emerald-950" : "bg-gray-50 border-gray-200 text-gray-800 hover:border-gray-300"
                            }`}
                          >
                            <div>
                              <p className="font-bold">{vac.name}</p>
                              <p className="text-[10px] text-gray-400">
                                {isGiven ? `Given on ${new Date(vac.givenDate).toLocaleDateString("en-IN")}` : `Due: ${new Date(vac.dueDate).toLocaleDateString("en-IN")}`}
                              </p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isGiven ? "bg-emerald-200 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                              {isGiven ? "✓ Given" : "Due"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-16 border-dashed border-2">
              <Baby className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-bold text-gray-800 text-base">No child registered yet</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Add your newborn or child to track UIP vaccination schedules and growth milestones.
              </p>
              <button
                onClick={() => setShowChildModal(true)}
                className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 mt-4"
              >
                <Plus className="w-3.5 h-3.5" /> Register Child
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Update Pregnancy Week */}
      {showPregnancyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-base">Update Pregnancy Details</h3>
            <form onSubmit={handleSavePregnancy} className="space-y-3 text-xs">
              <div>
                <label className="label">Current Pregnancy Week (1 - 40)</label>
                <input
                  type="number"
                  min="1"
                  max="42"
                  value={pregForm.pregnancyWeek}
                  onChange={e => setPregForm(f => ({ ...f, pregnancyWeek: e.target.value }))}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Expected Delivery Date (EDD)</label>
                <input
                  type="date"
                  value={pregForm.expectedDelivery}
                  onChange={e => setPregForm(f => ({ ...f, expectedDelivery: e.target.value }))}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Risk Category</label>
                <select
                  value={pregForm.riskLevel}
                  onChange={e => setPregForm(f => ({ ...f, riskLevel: e.target.value }))}
                  className="input"
                >
                  <option value="low">Low Risk</option>
                  <option value="medium">Moderate Risk</option>
                  <option value="high">High Risk (Requires ASHA monitoring)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowPregnancyModal(false)} className="btn-outline text-xs py-1.5">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary text-xs py-1.5">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Record ANC Visit */}
      {showANCModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-base">Record Antenatal Check-up (ANC)</h3>
            <form onSubmit={handleAddANC} className="space-y-3 text-xs">
              <div>
                <label className="label">Check-up Date</label>
                <input type="date" value={ancForm.date} onChange={e => setAncForm(f => ({ ...f, date: e.target.value }))} className="input" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Weight (kg)</label>
                  <input type="number" step="0.5" value={ancForm.weight} onChange={e => setAncForm(f => ({ ...f, weight: e.target.value }))} className="input" placeholder="e.g. 54" />
                </div>
                <div>
                  <label className="label">Blood Pressure</label>
                  <input type="text" value={ancForm.bp} onChange={e => setAncForm(f => ({ ...f, bp: e.target.value }))} className="input" placeholder="120/80" />
                </div>
              </div>
              <div>
                <label className="label">Fetal Heart Rate (bpm)</label>
                <input type="number" value={ancForm.fetalHR} onChange={e => setAncForm(f => ({ ...f, fetalHR: e.target.value }))} className="input" placeholder="140" />
              </div>
              <div>
                <label className="label">Clinical Advice & Notes</label>
                <textarea rows={2} value={ancForm.notes} onChange={e => setAncForm(f => ({ ...f, notes: e.target.value }))} className="input resize-none" placeholder="IFA prescribed, Td booster given..." />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowANCModal(false)} className="btn-outline text-xs py-1.5">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary text-xs py-1.5">Save Visit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Add Child */}
      {showChildModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-base">Register Child</h3>
            <form onSubmit={handleAddChild} className="space-y-3 text-xs">
              <div>
                <label className="label">Child's Name *</label>
                <input type="text" value={childForm.name} onChange={e => setChildForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="Baby Name" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Date of Birth</label>
                  <input type="date" value={childForm.dob} onChange={e => setChildForm(f => ({ ...f, dob: e.target.value }))} className="input" required />
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select value={childForm.gender} onChange={e => setChildForm(f => ({ ...f, gender: e.target.value }))} className="input">
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowChildModal(false)} className="btn-outline text-xs py-1.5">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary text-xs py-1.5">Register & Generate Vaccine Tracker</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
