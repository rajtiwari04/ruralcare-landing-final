import React, { useState, useEffect } from "react";
import {
  TrendingUp, Users, Activity, AlertTriangle,
  MessageCircle, FileText, Globe, BarChart2,
  Loader2, RefreshCw, ThumbsUp, Smartphone
} from "lucide-react";
import { analyticsAPI } from "../../services/phase5_6";

const COLORS = ["#0ea5e9","#22c55e","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899"];

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value ?? "-"}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
);

const BarRow = ({ label, count, max, color }) => (
  <div className="flex items-center gap-3">
    <p className="text-xs text-gray-600 w-28 truncate">{label}</p>
    <div className="flex-1 bg-gray-100 rounded-full h-2">
      <div className="h-2 rounded-full transition-all" style={{ width: `${Math.round((count/max)*100)}%`, backgroundColor: color }} />
    </div>
    <p className="text-xs font-semibold text-gray-700 w-8 text-right">{count}</p>
  </div>
);

export default function AnalyticsDashboard() {
  const [metrics,   setMetrics]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [days,      setDays]      = useState(30);
  const [tab,       setTab]       = useState("overview");

  const load = async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.getSystemMetrics(days);
      setMetrics(res.data.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [days]);

  const maxSymptom = metrics?.topSymptoms?.[0]?.count || 1;
  const maxPlatform= metrics?.platformStats?.[0]?.count || 1;

  const riskColors = { low:"#22c55e", medium:"#f59e0b", high:"#ef4444", emergency:"#7f1d1d" };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary-500" />System Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">Real-time health platform insights</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="input py-1.5 text-sm w-32" value={days} onChange={e => setDays(Number(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={load} className="btn-outline py-1.5 px-3 flex items-center gap-1.5 text-sm">
            <RefreshCw className="w-3.5 h-3.5" />Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {[["overview","Overview"],["symptoms","Symptoms"],["platforms","Platforms"],["risk","Risk"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${tab===id?"bg-white text-gray-900 shadow-sm":"text-gray-500 hover:text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : !metrics ? (
        <div className="card text-center py-12 text-gray-400">No data available</div>
      ) : (
        <>
          {/* Overview tab */}
          {tab === "overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Users}         label="Total Users"     value={metrics.totalUsers?.toLocaleString()}        sub="all roles"           color="bg-primary-500" />
                <StatCard icon={TrendingUp}    label="New Users"       value={metrics.newUsers?.toLocaleString()}          sub={`last ${days} days`} color="bg-green-500" />
                <StatCard icon={Activity}      label="Consultations"   value={metrics.totalConsultations?.toLocaleString()} sub={`last ${days} days`} color="bg-purple-500" />
                <StatCard icon={AlertTriangle} label="Emergencies"     value={metrics.emergencies?.toLocaleString()}       sub={`last ${days} days`} color="bg-red-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <StatCard icon={FileText}    label="Reports Uploaded" value={metrics.totalReports?.toLocaleString()}    sub="OCR + AI analyzed" color="bg-orange-500" />
                <StatCard icon={MessageCircle}label="Chat Messages"   value={metrics.chatMessages?.toLocaleString?.() || "-"} sub="all languages"  color="bg-teal-500" />
              </div>

              {/* Daily trend */}
              {metrics.dailyTrend?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-gray-800 text-sm mb-4">Daily Consultations Trend</h3>
                  <div className="flex items-end gap-1 h-32">
                    {metrics.dailyTrend.slice(-20).map((d, i) => {
                      const maxVal = Math.max(...metrics.dailyTrend.map(x => x.count));
                      const h = Math.round((d.count / maxVal) * 100);
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div className="w-full bg-primary-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                            style={{ height: `${h}%` }} />
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded hidden group-hover:block whitespace-nowrap z-10">
                            {d._id}: {d.count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">Hover bars for date details</p>
                </div>
              )}

              {/* Language distribution */}
              {metrics.languageDist?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-gray-800 text-sm mb-4">Language Distribution</h3>
                  <div className="space-y-2">
                    {metrics.languageDist.map((l, i) => (
                      <BarRow key={i} label={l._id || "unknown"} count={l.count}
                        max={metrics.languageDist[0].count} color={COLORS[i % COLORS.length]} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Symptoms tab */}
          {tab === "symptoms" && (
            <div className="card space-y-4">
              <h3 className="font-semibold text-gray-800 text-sm">Top Reported Symptoms (Last {days} days)</h3>
              {metrics.topSymptoms?.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No symptom data yet</p>
              ) : (
                <div className="space-y-2.5">
                  {metrics.topSymptoms?.map((s, i) => (
                    <BarRow key={i} label={s._id} count={s.count}
                      max={maxSymptom} color={COLORS[i % COLORS.length]} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Platforms tab */}
          {tab === "platforms" && (
            <div className="space-y-4">
              <div className="card space-y-4">
                <h3 className="font-semibold text-gray-800 text-sm">Platform Usage</h3>
                {metrics.platformStats?.map((p, i) => (
                  <BarRow key={i} label={p._id} count={p.count}
                    max={maxPlatform} color={COLORS[i % COLORS.length]} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="card text-center">
                  <Globe className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                  <p className="font-bold text-2xl text-gray-900">
                    {metrics.platformStats?.find(p => p._id === "web")?.count || 0}
                  </p>
                  <p className="text-xs text-gray-500">Web sessions</p>
                </div>
                <div className="card text-center">
                  <Smartphone className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="font-bold text-2xl text-gray-900">
                    {metrics.platformStats?.find(p => p._id === "telegram")?.count || 0}
                  </p>
                  <p className="text-xs text-gray-500">Telegram sessions</p>
                </div>
              </div>
            </div>
          )}

          {/* Risk tab */}
          {tab === "risk" && (
            <div className="card space-y-4">
              <h3 className="font-semibold text-gray-800 text-sm">Risk Level Distribution</h3>
              <div className="grid grid-cols-2 gap-4">
                {metrics.riskDist?.map((r, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 text-center border"
                    style={{ borderColor: riskColors[r._id] || "#e5e7eb" }}>
                    <p className="text-3xl font-bold" style={{ color: riskColors[r._id] || "#374151" }}>{r.count}</p>
                    <p className="text-xs font-semibold text-gray-500 uppercase mt-1">{r._id}</p>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-800 mb-1">Emergency Rate</p>
                <p className="text-2xl font-bold text-amber-900">
                  {metrics.totalConsultations > 0
                    ? ((metrics.emergencies / metrics.totalConsultations) * 100).toFixed(1)
                    : 0}%
                </p>
                <p className="text-xs text-amber-600 mt-0.5">{metrics.emergencies} emergency cases detected</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
