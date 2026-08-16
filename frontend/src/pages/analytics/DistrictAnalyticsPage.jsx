import React, { useState, useEffect } from "react";
import { MapPin, TrendingUp, Loader2, RefreshCw } from "lucide-react";
import { analyticsAPI } from "../../services/phase5_6";
import { useAuth } from "../../context/AuthContext";

export default function DistrictAnalyticsPage() {
  const { user }     = useAuth();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [district,setDistrict]= useState(user?.district || "");
  const [days,    setDays]    = useState(14);

  const load = async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.getDistrictMetrics(district, days);
      setData(res.data.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { if (district) load(); }, [district, days]);

  const metrics = [
    { label: "Total Patients",   value: data?.totalPatients },
    { label: "Consultations",    value: data?.totalConsultations },
    { label: "Emergencies",      value: data?.emergencyCases },
    { label: "Report Uploads",   value: data?.reportUploads },
    { label: "Tele-medicine",    value: data?.telemedSessions },
    { label: "Avg Risk Score",   value: data?.avgRiskScore },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-500" />District Analytics
        </h1>
        <div className="flex gap-2">
          <input className="input py-1.5 text-sm w-40" placeholder="District name"
            value={district} onChange={e => setDistrict(e.target.value)} />
          <select className="input py-1.5 text-sm w-28" value={days} onChange={e => setDays(Number(e.target.value))}>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
          <button onClick={load} className="btn-outline py-1.5 px-3">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : !data ? (
        <div className="card text-center py-12 text-gray-400">Enter a district name to view analytics</div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {metrics.map(({ label, value }) => (
              <div key={label} className="card text-center">
                <p className="text-3xl font-bold text-gray-900">{value ?? "-"}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {data.topSymptoms?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Top Symptoms in {data.district}</h3>
              <div className="space-y-2">
                {data.topSymptoms.map((s, i) => {
                  const max = data.topSymptoms[0].count;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <p className="text-xs text-gray-600 w-32 truncate">{s._id}</p>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-primary-500"
                          style={{ width: `${Math.round((s.count/max)*100)}%` }} />
                      </div>
                      <p className="text-xs font-semibold text-gray-700 w-6 text-right">{s.count}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
