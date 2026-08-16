import React, { useState, useEffect, useCallback } from "react";
import { Brain, AlertTriangle, Info, X } from "lucide-react";
import { analyticsAPI } from "../../services/phase5_6";
import {
  PatientPage, PageHeader, Surface, SectionLabel, StatusBadge,
  EmptyState, Skeleton, ErrorState, RefreshButton, PatientBtn, Disclaimer, T,
} from "../../components/patient/ui";
import { formatShortDate } from "../../design/tokens";

const TYPE_LABELS = {
  risk_trend: "Risk trend",
  condition_pattern: "Symptom pattern",
  medication_adherence: "Medication",
  seasonal_risk: "Seasonal alert",
  recommended_screening: "Screening",
  lifestyle_alert: "Lifestyle",
};

function severityTone(s) {
  if (s === "critical") return "danger";
  if (s === "warning") return "warn";
  return "info";
}

export default function InsightsPage() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await analyticsAPI.getMyInsights();
      setInsights(res.data?.data?.insights || []);
    } catch {
      setError("We couldn't load your insights.");
      setInsights([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    setGenerating(true);
    try {
      await analyticsAPI.generateInsights();
      await load();
    } catch {
      setError("Could not generate insights right now. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const markRead = async (id) => {
    await analyticsAPI.markInsightRead(id).catch(() => {});
    setInsights((prev) => prev.filter((i) => i._id !== id));
  };

  const submitFeedback = async (insightId, rating) => {
    await analyticsAPI.submitFeedback("ai_response", insightId, rating, "").catch(() => {});
  };

  return (
    <PatientPage>
      <PageHeader
        title="AI health insights"
        subtitle="Personalized observations based on your recent health activity."
        action={
          <div className="flex gap-2">
            <RefreshButton onClick={load} loading={loading} />
            <PatientBtn onClick={generate} disabled={generating}>
              <Brain className="w-4 h-4" />
              {generating ? "Analyzing…" : "Refresh insights"}
            </PatientBtn>
          </div>
        }
      />

      {error && <ErrorState message={error} onRetry={load} />}

      {loading && insights.length === 0 && (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      )}

      {!loading && insights.length === 0 && !error && (
        <Surface>
          <EmptyState
            title="No insights yet"
            description="Log more symptoms and health data to receive AI-powered insights."
            action={
              <PatientBtn onClick={generate} disabled={generating}>
                {generating ? "Analyzing…" : "Generate my insights"}
              </PatientBtn>
            }
          />
        </Surface>
      )}

      <div className="space-y-3">
        {insights.map((insight) => {
          const Icon = insight.severity === "critical" || insight.severity === "warning" ? AlertTriangle : Info;
          return (
            <Surface key={insight._id} className="p-4 relative">
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => markRead(insight._id)}
                className="absolute top-3 right-3 p-1 rounded-lg"
                style={{ color: T.inkLight }}
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-3 pr-8">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: insight.severity === "critical" ? "#FEF2F2" : insight.severity === "warning" ? T.accentSoft : T.tealSoft,
                    color: insight.severity === "critical" ? T.danger : insight.severity === "warning" ? T.warn : T.teal,
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold" style={{ color: T.ink }}>{insight.title}</p>
                    <StatusBadge status={severityTone(insight.severity)}>
                      {TYPE_LABELS[insight.insightType] || insight.insightType}
                    </StatusBadge>
                  </div>
                  <p className="text-[10px] mt-1 font-semibold uppercase tracking-wider" style={{ color: T.inkLight }}>
                    AI-generated insight
                  </p>
                  <p className="text-sm mt-2 leading-relaxed" style={{ color: T.inkMid }}>{insight.body}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs" style={{ color: T.inkLight }}>{formatShortDate(insight.createdAt)}</span>
                    <span className="text-xs" style={{ color: T.inkLight }}>Helpful?</span>
                    <button type="button" onClick={() => submitFeedback(insight._id, 5)} className="text-xs font-semibold" style={{ color: T.success }}>Yes</button>
                    <button type="button" onClick={() => submitFeedback(insight._id, 2)} className="text-xs font-semibold" style={{ color: T.danger }}>No</button>
                  </div>
                </div>
              </div>
            </Surface>
          );
        })}
      </div>

      {insights.length > 0 && <Disclaimer />}
    </PatientPage>
  );
}
