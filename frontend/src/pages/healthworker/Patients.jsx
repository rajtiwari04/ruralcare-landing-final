import React, { useState, useEffect, useMemo } from "react";
import { healthWorkerAPI, authAPI } from "../../services/index";
import { useAuth } from "../../context/AuthContext";
import {
  Users, Search, Plus, Phone, MapPin, Globe,
  User, CheckCircle2, RefreshCw, Loader2, X, AlertCircle
} from "lucide-react";

const MOCK_HW_PATIENTS = [
  { _id: "hwp-1", fullName: "Sunita Devi", phone: "+91 98765 43210", age: 38, gender: "Female", village: "Sunderpur" },
  { _id: "hwp-2", fullName: "Rameshwar Prasad", phone: "+91 98123 45678", age: 54, gender: "Male", village: "Rampur Kalan" },
  { _id: "hwp-3", fullName: "Pooja Kumari", phone: "+91 97234 56789", age: 26, gender: "Female", village: "Durgapur" },
  { _id: "hwp-4", fullName: "Harish Chandra Verma", phone: "+91 94567 12345", age: 62, gender: "Male", village: "Shivpur" },
  { _id: "hwp-5", fullName: "Anandi Bai", phone: "+91 91234 56780", age: 45, gender: "Female", village: "Baragaon" },
  { _id: "hwp-6", fullName: "Mukesh Yadav", phone: "+91 99887 65432", age: 31, gender: "Male", village: "Sunderpur" },
];

export default function HWPatients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Register Patient Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    password: "Password@123",
    age: "",
    gender: "female",
    village: user?.village || "Sunderpur",
    district: user?.district || "Varanasi",
    preferredLanguage: "hindi",
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await healthWorkerAPI.getPatients();
      const apiPatients = res.data?.data?.patients;
      if (Array.isArray(apiPatients) && apiPatients.length > 0) {
        setPatients(apiPatients);
      } else {
        setPatients(MOCK_HW_PATIENTS);
      }
    } catch {
      setPatients(MOCK_HW_PATIENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authAPI.register(form);
      const newP = res.data?.data?.user || {
        _id: `hwp-${Date.now()}`,
        ...form,
        age: Number(form.age) || 30
      };
      setPatients(prev => [newP, ...prev]);
      showToast(`${form.fullName} registered successfully.`);
      setShowAddModal(false);
      setForm({
        fullName: "",
        phone: "",
        password: "Password@123",
        age: "",
        gender: "female",
        village: user?.village || "Sunderpur",
        district: user?.district || "Varanasi",
        preferredLanguage: "hindi",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to register patient");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (p.fullName || "").toLowerCase();
        const phone = (p.phone || "").toLowerCase();
        const village = (p.village || "").toLowerCase();
        return name.includes(q) || phone.includes(q) || village.includes(q);
      }
      return true;
    });
  }, [patients, searchQuery]);

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
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Village Residents Directory</h1>
            <p className="text-sm text-gray-500">Assigned households and individuals under your ASHA village sector.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadPatients}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white border border-gray-200 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Register Village Resident
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by resident name, phone, or village..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input pl-9 text-xs"
          />
        </div>
      </div>

      {/* Patients Grid */}
      {loading ? (
        <div className="card text-center py-16">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 font-medium text-sm">Loading village directory...</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="card text-center py-16 border-dashed border-2">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-800 text-base">No residents found</p>
          <p className="text-xs text-gray-400 mt-1">Register new village families to track their immunization and health needs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <div key={patient._id} className="card p-5 hover:border-emerald-300 transition-all space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm flex-shrink-0">
                  {patient.fullName ? patient.fullName.charAt(0).toUpperCase() : "P"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{patient.fullName}</p>
                  <p className="text-xs text-gray-500">
                    {patient.age ? `${patient.age}y · ` : ""}{patient.gender || ""}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-xl text-xs space-y-1 text-gray-600">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> {patient.village || "Local Village"}
                </p>
                <p className="flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> {patient.phone}
                </p>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  ASHA Monitored
                </span>
                <a
                  href={`tel:${patient.phone}`}
                  className="btn-outline text-xs py-1 px-3 flex items-center gap-1 text-emerald-700"
                >
                  <Phone className="w-3 h-3" /> Call
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Resident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">Register Village Resident</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterPatient} className="space-y-3 text-xs">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Phone Number *</label>
                <input
                  type="tel"
                  placeholder="+91..."
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="input font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Age</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select
                    value={form.gender}
                    onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                    className="input"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Village</label>
                  <input
                    type="text"
                    value={form.village}
                    onChange={e => setForm(f => ({ ...f, village: e.target.value }))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">District</label>
                  <input
                    type="text"
                    value={form.district}
                    onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                    className="input"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-outline text-xs py-1.5">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary text-xs py-1.5">Register Resident</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
