import React, { useState, useEffect } from "react";
import { leaderboardAPI } from "../../services/index";
import { useAuth } from "../../context/AuthContext";
import {
  Trophy, Award, Medal, Users, Shield, TrendingUp,
  MapPin, CheckCircle2, RefreshCw, Star, Sparkles, Loader2
} from "lucide-react";

const MOCK_LEADERBOARD = [
  {
    _id: "lb-01",
    village: "Sunderpur",
    district: "Varanasi",
    rank: 1,
    grade: "S",
    scores: { total: 96, medicationAdherence: 98, followUpRate: 94, ancCompliance: 96, vaccinationRate: 98, screeningRate: 92 },
  },
  {
    _id: "lb-02",
    village: "Rampur Kalan",
    district: "Varanasi",
    rank: 2,
    grade: "A",
    scores: { total: 91, medicationAdherence: 92, followUpRate: 88, ancCompliance: 94, vaccinationRate: 95, screeningRate: 86 },
  },
  {
    _id: "lb-03",
    village: "Shivpur",
    district: "Varanasi",
    rank: 3,
    grade: "A",
    scores: { total: 88, medicationAdherence: 90, followUpRate: 86, ancCompliance: 89, vaccinationRate: 92, screeningRate: 83 },
  },
  {
    _id: "lb-04",
    village: "Baragaon",
    district: "Varanasi",
    rank: 4,
    grade: "B",
    scores: { total: 82, medicationAdherence: 84, followUpRate: 80, ancCompliance: 85, vaccinationRate: 86, screeningRate: 75 },
  },
  {
    _id: "lb-05",
    village: "Durgapur",
    district: "Chandauli",
    rank: 5,
    grade: "B",
    scores: { total: 79, medicationAdherence: 81, followUpRate: 78, ancCompliance: 80, vaccinationRate: 82, screeningRate: 74 },
  },
  {
    _id: "lb-06",
    village: "Mirzapur Rural",
    district: "Mirzapur",
    rank: 6,
    grade: "C",
    scores: { total: 72, medicationAdherence: 74, followUpRate: 70, ancCompliance: 76, vaccinationRate: 75, screeningRate: 65 },
  },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await leaderboardAPI.getLeaderboard(district ? { district } : {});
      const apiBoards = res.data?.data?.leaderboard;
      setLeaderboard(Array.isArray(apiBoards) ? apiBoards : []);
    } catch {
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [district]);

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Community Health Leaderboard</h1>
            <p className="text-sm text-gray-500">Gram Panchayat healthcare performance, vaccination coverage, and medication adherence rankings.</p>
          </div>
        </div>
        <button
          onClick={loadLeaderboard}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white border border-gray-200 rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-600" : ""}`} />
        </button>
      </div>

      {/* District Filter Bar */}
      <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">Filter District:</span>
          <select
            value={district}
            onChange={e => setDistrict(e.target.value)}
            className="input text-xs w-48"
          >
            <option value="">All Rural Districts</option>
            <option value="Varanasi">Varanasi</option>
            <option value="Chandauli">Chandauli</option>
            <option value="Mirzapur">Mirzapur</option>
            <option value="Jaunpur">Jaunpur</option>
            <option value="Ghazipur">Ghazipur</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Rankings updated weekly by ASHA field surveillance records.</span>
        </div>
      </div>

      {/* Podium Top 3 */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Rank 2 (Silver) */}
          <div className="card p-5 border-2 border-slate-200 bg-gradient-to-b from-slate-50/60 to-white flex flex-col justify-between space-y-3 order-2 sm:order-1">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm">
                🥈 2
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 uppercase">
                Grade {topThree[1].grade}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{topThree[1].village}</h3>
              <p className="text-xs text-gray-500">{topThree[1].district}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">Overall Score:</span>
              <span className="font-bold text-slate-800 text-base">{topThree[1].scores?.total}%</span>
            </div>
          </div>

          {/* Rank 1 (Gold) */}
          <div className="card p-6 border-2 border-amber-300 bg-gradient-to-b from-amber-50/80 to-white flex flex-col justify-between space-y-3 shadow-md order-1 sm:order-2 sm:-translate-y-2">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-full bg-amber-400 text-amber-950 font-bold flex items-center justify-center text-base shadow-sm">
                👑 1
              </span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase tracking-wider">
                Grade {topThree[0].grade} (Top Village)
              </span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-xl">{topThree[0].village}</h3>
              <p className="text-xs text-gray-500">{topThree[0].district} District</p>
            </div>
            <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">Adherence & UIP Rate:</span>
              <span className="font-extrabold text-amber-900 text-xl">{topThree[0].scores?.total}%</span>
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="card p-5 border-2 border-amber-700/20 bg-gradient-to-b from-amber-50/30 to-white flex flex-col justify-between space-y-3 order-3">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-amber-700/20 text-amber-900 font-bold flex items-center justify-center text-sm">
                🥉 3
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                Grade {topThree[2].grade}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{topThree[2].village}</h3>
              <p className="text-xs text-gray-500">{topThree[2].district}</p>
            </div>
            <div className="pt-2 border-t border-amber-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">Overall Score:</span>
              <span className="font-bold text-amber-900 text-base">{topThree[2].scores?.total}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="card p-0 overflow-hidden border border-gray-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 uppercase font-semibold text-gray-500 border-b border-gray-100">
            <tr>
              <th className="py-3 px-4 w-12">Rank</th>
              <th className="py-3 px-4">Village / District</th>
              <th className="py-3 px-4">Grade</th>
              <th className="py-3 px-4">Medication Adherence</th>
              <th className="py-3 px-4">Vaccination (UIP)</th>
              <th className="py-3 px-4">ANC Compliance</th>
              <th className="py-3 px-4 text-right">Composite Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leaderboard.map((item, idx) => (
              <tr key={item._id || idx} className="hover:bg-gray-50/70 transition-colors">
                <td className="py-3 px-4 font-bold text-gray-700">#{item.rank || idx + 1}</td>
                <td className="py-3 px-4">
                  <p className="font-bold text-gray-900 text-sm">{item.village}</p>
                  <p className="text-[11px] text-gray-400">{item.district}</p>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                    item.grade === "S" ? "bg-amber-100 text-amber-800" : item.grade === "A" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    Grade {item.grade}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium text-gray-700">{item.scores?.medicationAdherence || 85}%</td>
                <td className="py-3 px-4 font-medium text-gray-700">{item.scores?.vaccinationRate || 90}%</td>
                <td className="py-3 px-4 font-medium text-gray-700">{item.scores?.ancCompliance || 88}%</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900 text-sm">
                  {item.scores?.total || 80}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
