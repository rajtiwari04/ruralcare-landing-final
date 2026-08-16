import React, { useState } from "react";
import { BarChart2, Map } from "lucide-react";
import AnalyticsDashboard from "../analytics/AnalyticsDashboard";
import DistrictAnalyticsPage from "../analytics/DistrictAnalyticsPage";

export default function AdminAnalyticsPage() {
  const [tab, setTab] = useState("system");

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          ["system", "System Overview", BarChart2],
          ["district", "District View", Map],
        ].map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === "system" && <AnalyticsDashboard />}
      {tab === "district" && <DistrictAnalyticsPage />}
    </div>
  );
}