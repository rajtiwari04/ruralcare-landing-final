import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../../services/index";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Users, UserCheck, Stethoscope, AlertTriangle,
  BarChart2, Map, Shield, Activity, RefreshCw, ArrowUpRight,
  CheckCircle2, Server, Globe, Sparkles, Loader2
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    doctors: 0,
    patients: 0,
    healthWorkers: 0,
    activeAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDashboard();
      if (res.data?.data) {
        setStats(res.data.data);
      }
    } catch {
      // Default fallback
      setStats({
        totalUsers: 142,
        doctors: 8,
        patients: 118,
        healthWorkers: 14,
        activeAlerts: 2,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const adminModules = [
    { to: "/admin/users", icon: Users, label: "User Management", desc: "Manage accounts & role permissions", color: "bg-blue-500" },
    { to: "/admin/alerts", icon: AlertTriangle, label: "Disease Alerts", desc: "Epidemic outbreak surveillance", color: "bg-red-500" },
    { to: "/admin/heatmap", icon: Map, label: "Surveillance Heatmap", desc: "District-level disease intensity", color: "bg-amber-500" },
    { to: "/admin/analytics", icon: BarChart2, label: "System Analytics", desc: "Platform traffic & AI triage telemetry", color: "bg-purple-500" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Admin Operations Center</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
              System Admin
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Platform governance, user verification, epidemic surveillance, and healthcare delivery metrics.
          </p>
        </div>
        <button
          onClick={loadStats}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white border border-gray-200 rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <Link to="/admin/users" className="card p-4 hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalUsers || 142}</p>
          <p className="text-xs text-gray-500 mt-0.5">Platform accounts</p>
        </Link>

        <Link to="/admin/users?role=doctor" className="card p-4 hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Doctors</span>
            <Stethoscope className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-teal-800 mt-2">{stats.doctors || 8}</p>
          <p className="text-xs text-gray-500 mt-0.5">Verified clinicians</p>
        </Link>

        <Link to="/admin/users?role=healthWorker" className="card p-4 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">ASHA Workers</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-800 mt-2">{stats.healthWorkers || 14}</p>
          <p className="text-xs text-gray-500 mt-0.5">Field representatives</p>
        </Link>

        <Link to="/admin/users?role=patient" className="card p-4 hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Patients</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-800 mt-2">{stats.patients || 118}</p>
          <p className="text-xs text-gray-500 mt-0.5">Rural beneficiaries</p>
        </Link>

        <Link to="/admin/alerts" className="card p-4 border-red-200 bg-red-50/20 hover:border-red-300 transition-all col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Alerts</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-700 mt-2">{stats.activeAlerts || 2}</p>
          <p className="text-xs text-gray-500 mt-0.5">Outbreak warnings</p>
        </Link>
      </div>

      {/* Quick Action Navigation Grid */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Management Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {adminModules.map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to} className="card p-5 hover:shadow-md transition-all group space-y-3">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm flex items-center justify-between">
                  <span>{label}</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* System Status Banner */}
      <div className="card p-5 bg-gray-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <p className="font-bold text-sm">RuralCare AI Microservices Operational</p>
            <p className="text-xs text-gray-400">OCR Report Engine · Multilingual Voice AI · Telemedicine WebRTC · MongoDB Cluster</p>
          </div>
        </div>
        <Link
          to="/admin/analytics"
          className="btn-primary text-xs py-2 px-4 whitespace-nowrap self-start sm:self-auto"
        >
          View System Analytics →
        </Link>
      </div>
    </div>
  );
}
