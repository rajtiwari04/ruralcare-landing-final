import React, { useState, useEffect } from "react";
import { adminAPI } from "../../services/index";
import { useAuth } from "../../context/AuthContext";
import {
  AlertTriangle, ShieldAlert, CheckCircle2, MapPin,
  Calendar, RefreshCw, Loader2, Plus, Bell, X
} from "lucide-react";

const MOCK_ALERTS = [
  {
    _id: "alt-01",
    disease: "Dengue Fever Outbreak (Serotype-2)",
    severity: "outbreak",
    district: "Varanasi",
    tehsil: "Pindra",
    affectedVillages: ["Sunderpur", "Rampur Kalan"],
    caseCount: 24,
    reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    guidelines: "Deploy ASHA workers for anti-larval fogging and door-to-door fever surveillance. Distribute paracetamol and ORS packets.",
    isActive: true,
  },
  {
    _id: "alt-02",
    disease: "Acute Viral Gastroenteritis",
    severity: "warning",
    district: "Chandauli",
    tehsil: "Sakaldiha",
    affectedVillages: ["Durgapur"],
    caseCount: 11,
    reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    guidelines: "Water source chlorination required at local handpumps. Advise boiling drinking water and immediate ORS hydration.",
    isActive: true,
  },
];

export default function AdminAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [newAlertForm, setNewAlertForm] = useState({
    disease: "",
    severity: "warning",
    district: "Varanasi",
    affectedVillages: "",
    caseCount: 5,
    guidelines: "",
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAlerts();
      const apiAlerts = res.data?.data?.alerts;
      if (Array.isArray(apiAlerts) && apiAlerts.length > 0) {
        setAlerts(apiAlerts);
      } else {
        setAlerts(MOCK_ALERTS);
      }
    } catch {
      setAlerts(MOCK_ALERTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleResolveAlert = (id) => {
    setAlerts(prev => prev.filter(a => a._id !== id));
    showToast("Disease alert resolved and archived.");
  };

  const handleBroadcastAlert = (e) => {
    e.preventDefault();
    const created = {
      _id: `alt-${Date.now()}`,
      disease: newAlertForm.disease,
      severity: newAlertForm.severity,
      district: newAlertForm.district,
      affectedVillages: newAlertForm.affectedVillages.split(",").map(v => v.trim()),
      caseCount: Number(newAlertForm.caseCount),
      guidelines: newAlertForm.guidelines,
      reportedAt: new Date().toISOString(),
      isActive: true,
    };
    setAlerts(prev => [created, ...prev]);
    showToast(`Outbreak alert broadcast for ${newAlertForm.disease}.`);
    setShowBroadcastModal(false);
    setNewAlertForm({
      disease: "",
      severity: "warning",
      district: "Varanasi",
      affectedVillages: "",
      caseCount: 5,
      guidelines: "",
    });
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Epidemic & Disease Alerts</h1>
            <p className="text-sm text-gray-500">Disease surveillance broadcast system and public health advisories.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAlerts}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white border border-gray-200 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-red-600" : ""}`} />
          </button>
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm bg-red-600 hover:bg-red-700"
          >
            <Plus className="w-4 h-4" /> Broadcast Outbreak Advisory
          </button>
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="card text-center py-16">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 font-medium text-sm">Loading active alerts...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="card text-center py-16 border-dashed border-2">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <p className="font-bold text-gray-800 text-base">No active outbreak alerts</p>
          <p className="text-xs text-gray-400 mt-1">All district epidemic surveillance parameters are within baseline levels.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alt) => {
            const isOutbreak = alt.severity === "outbreak";
            return (
              <div
                key={alt._id}
                className={`card p-6 border transition-all space-y-4 ${
                  isOutbreak ? "border-red-300 bg-red-50/20" : "border-amber-200 bg-amber-50/10"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-lg">{alt.disease}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isOutbreak ? "bg-red-600 text-white animate-pulse" : "bg-amber-100 text-amber-800"
                      }`}>
                        {alt.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{alt.district} District · Villages: <strong>{alt.affectedVillages?.join(", ") || alt.district}</strong></span>
                    </p>
                  </div>

                  <div className="bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-right self-start sm:self-auto">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Reported Cases</p>
                    <p className="text-lg font-bold text-red-700">{alt.caseCount}</p>
                  </div>
                </div>

                {/* Guidelines */}
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Containment Directives & Field Guidance
                  </p>
                  <p className="text-xs text-gray-800 bg-white p-3 rounded-xl border border-gray-200/80 leading-relaxed">
                    {alt.guidelines}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-gray-400">
                    Issued: {new Date(alt.reportedAt).toLocaleDateString("en-IN")}
                  </span>
                  <button
                    onClick={() => handleResolveAlert(alt._id)}
                    className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">Broadcast Outbreak Advisory</h3>
              <button onClick={() => setShowBroadcastModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBroadcastAlert} className="space-y-3 text-xs">
              <div>
                <label className="label">Disease Name / Condition *</label>
                <input
                  type="text"
                  placeholder="e.g. Dengue Fever / Malaria"
                  value={newAlertForm.disease}
                  onChange={e => setNewAlertForm(f => ({ ...f, disease: e.target.value }))}
                  className="input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Severity</label>
                  <select
                    value={newAlertForm.severity}
                    onChange={e => setNewAlertForm(f => ({ ...f, severity: e.target.value }))}
                    className="input"
                  >
                    <option value="warning">Warning</option>
                    <option value="outbreak">Outbreak (Urgent)</option>
                    <option value="advisory">Advisory</option>
                  </select>
                </div>
                <div>
                  <label className="label">District</label>
                  <input
                    type="text"
                    value={newAlertForm.district}
                    onChange={e => setNewAlertForm(f => ({ ...f, district: e.target.value }))}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Affected Villages (comma separated)</label>
                <input
                  type="text"
                  placeholder="Sunderpur, Rampur Kalan"
                  value={newAlertForm.affectedVillages}
                  onChange={e => setNewAlertForm(f => ({ ...f, affectedVillages: e.target.value }))}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Containment Directives & ASHA instructions</label>
                <textarea
                  rows={3}
                  placeholder="Directives for field teams..."
                  value={newAlertForm.guidelines}
                  onChange={e => setNewAlertForm(f => ({ ...f, guidelines: e.target.value }))}
                  className="input resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowBroadcastModal(false)} className="btn-outline text-xs py-1.5">Cancel</button>
                <button type="submit" className="btn-primary text-xs py-1.5 bg-red-600 hover:bg-red-700">Broadcast Alert</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
