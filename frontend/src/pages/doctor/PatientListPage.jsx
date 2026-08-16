import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doctorAPI } from "../../services/index";
import { useAuth } from "../../context/AuthContext";
import {
  Users, Search, Filter, Phone, MapPin, Globe,
  Calendar, Pill, TestTube2, ArrowUpRight, RefreshCw,
  Loader2, User, ChevronRight
} from "lucide-react";

const MOCK_PATIENTS = [
  { _id: "pat-001", fullName: "Sunita Devi", phone: "+91 98765 43210", age: 38, gender: "Female", village: "Sunderpur", district: "Varanasi", preferredLanguage: "hindi" },
  { _id: "pat-002", fullName: "Rameshwar Prasad", phone: "+91 98123 45678", age: 54, gender: "Male", village: "Rampur Kalan", district: "Varanasi", preferredLanguage: "bhojpuri" },
  { _id: "pat-003", fullName: "Pooja Kumari", phone: "+91 97234 56789", age: 26, gender: "Female", village: "Durgapur", district: "Chandauli", preferredLanguage: "hindi" },
  { _id: "pat-004", fullName: "Harish Chandra Verma", phone: "+91 94567 12345", age: 62, gender: "Male", village: "Shivpur", district: "Varanasi", preferredLanguage: "hindi" },
  { _id: "pat-005", fullName: "Anandi Bai", phone: "+91 91234 56780", age: 45, gender: "Female", village: "Baragaon", district: "Jaunpur", preferredLanguage: "awadhi" },
  { _id: "pat-006", fullName: "Mukesh Yadav", phone: "+91 99887 65432", age: 31, gender: "Male", village: "Mirzapur Rural", district: "Mirzapur", preferredLanguage: "hindi" },
];

export default function PatientListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("all");

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await doctorAPI.getPatients();
      const apiPatients = res.data?.data?.patients;
      if (Array.isArray(apiPatients) && apiPatients.length > 0) {
        setPatients(apiPatients);
      } else {
        setPatients(MOCK_PATIENTS);
      }
    } catch {
      setPatients(MOCK_PATIENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      if (districtFilter !== "all" && p.district !== districtFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (p.fullName || "").toLowerCase();
        const phone = (p.phone || "").toLowerCase();
        const village = (p.village || "").toLowerCase();
        return name.includes(q) || phone.includes(q) || village.includes(q);
      }
      return true;
    });
  }, [patients, districtFilter, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Directory</h1>
            <p className="text-sm text-gray-500">View and manage clinical records of your registered and teleconsultation patients.</p>
          </div>
        </div>
        <button
          onClick={loadPatients}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white border border-gray-200 rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient name, phone, or village..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input pl-9 text-sm"
            />
          </div>

          <div>
            <select
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
              className="input text-sm cursor-pointer"
            >
              <option value="all">All Districts</option>
              <option value="Varanasi">Varanasi</option>
              <option value="Chandauli">Chandauli</option>
              <option value="Mirzapur">Mirzapur</option>
              <option value="Jaunpur">Jaunpur</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients List */}
      {loading ? (
        <div className="card text-center py-16">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 font-medium text-sm">Loading patients...</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="card text-center py-16 border-dashed border-2">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-800 text-base">No patients found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your search query or district filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Desktop Table */}
          <div className="hidden lg:block card p-0 overflow-hidden border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Age / Gender</th>
                  <th className="py-3.5 px-4">Village & District</th>
                  <th className="py-3.5 px-4">Language</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {patient.fullName ? patient.fullName.charAt(0).toUpperCase() : "P"}
                        </div>
                        <div>
                          <Link to={`/doctor/patients/${patient._id}`} className="font-bold text-gray-900 hover:text-blue-700 flex items-center gap-1 group">
                            <span>{patient.fullName}</span>
                            <ArrowUpRight className="w-3 h-3 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{patient.phone}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-gray-700">
                      {patient.age ? `${patient.age} yrs` : "—"} · <span className="capitalize">{patient.gender || "—"}</span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-gray-700">
                      {patient.village ? `${patient.village}, ` : ""}{patient.district || "—"}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-gray-700 capitalize">
                      {patient.preferredLanguage || "Hindi"}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/doctor/prescriptions?patientId=${patient._id}&patientName=${encodeURIComponent(patient.fullName || "")}`}
                          className="p-1.5 text-gray-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Prescribe Medication"
                        >
                          <Pill className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/doctor/lab?patientId=${patient._id}&patientName=${encodeURIComponent(patient.fullName || "")}`}
                          className="p-1.5 text-gray-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Order Lab Test"
                        >
                          <TestTube2 className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/doctor/patients/${patient._id}`}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors"
                        >
                          Medical Profile
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-3.5">
            {filteredPatients.map((patient) => (
              <div key={patient._id} className="card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm flex-shrink-0">
                    {patient.fullName ? patient.fullName.charAt(0).toUpperCase() : "P"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/doctor/patients/${patient._id}`} className="font-bold text-gray-900 text-sm hover:text-blue-700 block truncate">
                      {patient.fullName}
                    </Link>
                    <p className="text-xs text-gray-500 truncate">
                      {patient.age ? `${patient.age}y · ` : ""}{patient.village || patient.district}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                  <Link
                    to={`/doctor/patients/${patient._id}`}
                    className="flex-1 btn-primary py-1.5 text-xs text-center font-semibold"
                  >
                    View Record
                  </Link>
                  <Link
                    to={`/doctor/prescriptions?patientId=${patient._id}&patientName=${encodeURIComponent(patient.fullName || "")}`}
                    className="p-1.5 border border-gray-200 rounded-lg text-teal-700"
                    title="Prescribe"
                  >
                    <Pill className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
