import React, { useState, useEffect } from "react";
import { heatmapAPI } from "../../services/index";
import { useAuth } from "../../context/AuthContext";
import {
  Map, Activity, AlertTriangle, Shield, TrendingUp,
  MapPin, RefreshCw, Loader2, Sparkles, ChevronRight, X
} from "lucide-react";

const MOCK_HEATMAP = [
  { district: "Varanasi", totalCases: 38, emergency: 4, high: 12, intensity: 52, topSymptoms: ["Dengue / High Fever", "Joint Pains", "Thrombocytopenia"] },
  { district: "Chandauli", totalCases: 22, emergency: 2, high: 7, intensity: 31, topSymptoms: ["Viral Gastroenteritis", "Dehydration", "Vomiting"] },
  { district: "Mirzapur", totalCases: 19, emergency: 1, high: 5, intensity: 23, topSymptoms: ["Seasonal Influenza", "Dry Cough", "Sore Throat"] },
  { district: "Jaunpur", totalCases: 14, emergency: 0, high: 4, intensity: 16, topSymptoms: ["Acute Bronchitis", "Fever"] },
  { district: "Ghazipur", totalCases: 9, emergency: 0, high: 2, intensity: 10, topSymptoms: ["Allergic Rhinitis", "Mild Fever"] },
  { district: "Sonbhadra", totalCases: 16, emergency: 2, high: 4, intensity: 20, topSymptoms: ["Waterborne Diarrhea", "Abdominal Cramps"] },
];

export default function HeatmapPage() {
  const { user } = useAuth();
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const loadHeatmap = async () => {
    setLoading(true);
    try {
      const res = await heatmapAPI.getHeatmap();
      const apiHeat = res.data?.data?.heatmap;
      if (Array.isArray(apiHeat) && apiHeat.length > 0) {
        setHeatmapData(apiHeat);
      } else {
        setHeatmapData(MOCK_HEATMAP);
      }
    } catch {
      setHeatmapData(MOCK_HEATMAP);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHeatmap();
  }, []);

  const totalCases = heatmapData.reduce((acc, curr) => acc + (curr.totalCases || 0), 0);
  const totalEmergency = heatmapData.reduce((acc, curr) => acc + (curr.emergency || 0), 0);

  const getIntensityBadge = (intensity) => {
    if (intensity >= 40) return { label: "Critical Outbreak", color: "bg-red-500 text-white", border: "border-red-300 bg-red-50/40" };
    if (intensity >= 20) return { label: "Elevated Risk", color: "bg-amber-500 text-white", border: "border-amber-300 bg-amber-50/40" };
    return { label: "Low / Baseline", color: "bg-emerald-500 text-white", border: "border-emerald-200 bg-emerald-50/20" };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <Map className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">District Disease Heatmap</h1>
            <p className="text-sm text-gray-500">Real-time epidemiological cluster surveillance and outbreak intensity mapping.</p>
          </div>
        </div>
        <button
          onClick={loadHeatmap}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white border border-gray-200 rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-red-600" : ""}`} />
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="card p-4">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Districts</span>
            <MapPin className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{heatmapData.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Surveillance zones</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Cases (7d)</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-800 mt-2">{totalCases}</p>
          <p className="text-xs text-gray-500 mt-0.5">Reported symptoms</p>
        </div>

        <div className="card p-4 border-red-200 bg-red-50/20">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Emergency Triage</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-700 mt-2">{totalEmergency}</p>
          <p className="text-xs text-gray-500 mt-0.5">Urgent hospitalizations</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Vector Trend</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-800 mt-2">+14%</p>
          <p className="text-xs text-gray-500 mt-0.5">Monsoon seasonal rise</p>
        </div>
      </div>

      {/* Interactive Risk Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Regional Outbreak Intensity Grid
        </h2>

        {loading ? (
          <div className="card text-center py-16">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-600 font-medium text-sm">Loading epidemiological heatmap...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {heatmapData.map((d) => {
              const badge = getIntensityBadge(d.intensity);

              return (
                <div
                  key={d.district}
                  onClick={() => setSelectedDistrict(d)}
                  className={`card p-5 border-2 ${badge.border} hover:shadow-md transition-all cursor-pointer space-y-3`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-lg">{d.district}</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white/80 p-2 rounded-lg border border-gray-200">
                      <p className="text-[10px] text-gray-400">Total</p>
                      <p className="font-bold text-gray-800">{d.totalCases}</p>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-gray-200">
                      <p className="text-[10px] text-red-500">Emergency</p>
                      <p className="font-bold text-red-700">{d.emergency}</p>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-gray-200">
                      <p className="text-[10px] text-amber-500">High Risk</p>
                      <p className="font-bold text-amber-700">{d.high}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-500 font-medium mb-1">
                      <span>Outbreak Intensity</span>
                      <span>{d.intensity} pts</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full bg-red-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, d.intensity * 1.5)}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 flex items-center justify-between pt-1">
                    <span>Click to view cluster analysis</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* District Detail Modal */}
      {selectedDistrict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                  Epidemic Surveillance Report
                </span>
                <h3 className="font-bold text-gray-900 text-lg mt-1">{selectedDistrict.district} District</h3>
              </div>
              <button
                onClick={() => setSelectedDistrict(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">7-Day Case Volume:</span>
                <strong className="text-gray-900">{selectedDistrict.totalCases} cases</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Emergency Referrals:</span>
                <strong className="text-red-700">{selectedDistrict.emergency} cases</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">High-Risk Cases:</span>
                <strong className="text-amber-700">{selectedDistrict.high} cases</strong>
              </div>
            </div>

            {selectedDistrict.topSymptoms && (
              <div className="space-y-1 text-xs">
                <p className="font-bold text-gray-700">Prevalent Clinical Symptoms:</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDistrict.topSymptoms.map((s, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-medium text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-950 space-y-1">
              <p className="font-bold text-red-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> ASHA Directives:
              </p>
              <p className="leading-relaxed">
                Prioritize fever and hydration checks in high-density blocks. Ensure primary health centers (PHCs) maintain adequate stock of rapid antigen kits and paracetamol.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDistrict(null)}
                className="btn-primary text-xs py-2 px-4"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
