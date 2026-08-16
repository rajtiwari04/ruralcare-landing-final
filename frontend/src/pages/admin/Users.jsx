import React, { useState, useEffect, useMemo } from "react";
import { adminAPI } from "../../services/index";
import { useAuth } from "../../context/AuthContext";
import {
  Users, Search, Filter, Shield, UserCheck, Stethoscope,
  Activity, RefreshCw, Loader2, Edit3, X, CheckCircle2,
  Calendar, Phone, MapPin
} from "lucide-react";

const MOCK_ADMIN_USERS = [
  { _id: "u-01", fullName: "Dr. Anshuman Sharma", phone: "+91 98765 00001", role: "doctor", village: "Medical College", district: "Varanasi", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString() },
  { _id: "u-02", fullName: "Sunita Devi", phone: "+91 98765 43210", role: "patient", village: "Sunderpur", district: "Varanasi", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString() },
  { _id: "u-03", fullName: "Manju ASHA Worker", phone: "+91 98765 11111", role: "healthWorker", village: "Sunderpur", district: "Varanasi", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString() },
  { _id: "u-04", fullName: "Rameshwar Prasad", phone: "+91 98123 45678", role: "patient", village: "Rampur Kalan", district: "Varanasi", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString() },
  { _id: "u-05", fullName: "Admin Officer", phone: "+91 99999 88888", role: "admin", village: "District HQ", district: "Varanasi", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString() },
];

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Role Edit Modal
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("patient");
  const [updating, setUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({
        role: activeRole === "all" ? undefined : activeRole,
        search: searchQuery.trim() || undefined,
      });
      const apiUsers = res.data?.data?.users;
      if (Array.isArray(apiUsers) && apiUsers.length > 0) {
        setUsers(apiUsers);
      } else {
        setUsers(MOCK_ADMIN_USERS);
      }
    } catch {
      setUsers(MOCK_ADMIN_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [activeRole]);

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setUpdating(true);
    try {
      await adminAPI.updateUserRole(editingUser._id, selectedRole);
      setUsers(prev => prev.map(u => u._id === editingUser._id ? { ...u, role: selectedRole } : u));
      showToast(`Updated role for ${editingUser.fullName} to ${selectedRole}.`);
      setEditingUser(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (activeRole !== "all" && u.role !== activeRole) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (u.fullName || "").toLowerCase();
        const phone = (u.phone || "").toLowerCase();
        const village = (u.village || "").toLowerCase();
        return name.includes(q) || phone.includes(q) || village.includes(q);
      }
      return true;
    });
  }, [users, activeRole, searchQuery]);

  const getRoleBadge = (role) => {
    switch (role) {
      case "doctor":
        return <span className="bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Doctor</span>;
      case "healthWorker":
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">ASHA Worker</span>;
      case "admin":
        return <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Admin</span>;
      default:
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Patient</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500">Manage all registered accounts, role permissions, and access privileges.</p>
          </div>
        </div>
        <button
          onClick={loadUsers}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white border border-gray-200 rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Users" },
              { id: "patient", label: "Patients" },
              { id: "doctor", label: "Doctors" },
              { id: "healthWorker", label: "Health Workers" },
              { id: "admin", label: "Admins" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveRole(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeRole === tab.id
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user name or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input pl-8 text-xs w-full sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="card text-center py-16">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 font-medium text-sm">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card text-center py-16 border-dashed border-2">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-800 text-base">No users found</p>
          <p className="text-xs text-gray-400 mt-1">No user accounts match the selected role or search filter.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden border border-gray-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-800 font-bold flex items-center justify-center text-xs">
                        {u.fullName ? u.fullName.charAt(0).toUpperCase() : "U"}
                      </div>
                      <span className="font-bold text-gray-900 text-sm">{u.fullName}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {getRoleBadge(u.role)}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-gray-700">
                    {u.phone}
                  </td>

                  <td className="py-3.5 px-4 text-gray-600">
                    {u.village ? `${u.village}, ` : ""}{u.district || "—"}
                  </td>

                  <td className="py-3.5 px-4 text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString("en-IN")}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setEditingUser(u);
                        setSelectedRole(u.role);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Change Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Role Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">Change Role Permission</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateRole} className="space-y-3 text-xs">
              <p className="text-gray-600">
                Update access role for <strong className="text-gray-900">{editingUser.fullName}</strong>:
              </p>

              <div>
                <label className="label">Assigned Platform Role</label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                  className="input font-semibold"
                >
                  <option value="patient">Patient (Standard beneficiary access)</option>
                  <option value="doctor">Doctor (Clinical & prescription permissions)</option>
                  <option value="healthWorker">Health Worker (ASHA / ANM field access)</option>
                  <option value="admin">System Administrator (Full platform control)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setEditingUser(null)} className="btn-outline text-xs py-1.5">Cancel</button>
                <button type="submit" disabled={updating} className="btn-primary text-xs py-1.5">Update Role</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}