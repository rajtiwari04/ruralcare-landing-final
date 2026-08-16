import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { healthWorkerAPI, leaderboardAPI } from "../../services/index";
import {
  Users, AlertTriangle, Activity, Trophy, MapPin,
  Shield, ChevronRight,
} from "lucide-react";
import {
  PageHeader, SectionLabel, Surface, MetricTile, StatusBadge,
  EmptyState, Skeleton, ErrorState, RefreshButton, QuickAction,
} from "../../components/dashboard/ui";
import { T, greetingForHour, formatShortDate } from "../../design/tokens";

export default function HWDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dashRes, boardRes] = await Promise.all([
        healthWorkerAPI.getDashboard(),
        leaderboardAPI.getLeaderboard({ district: user?.district }).catch(() => null),
      ]);
      setData(dashRes.data?.data || null);

      // Only show rank if the API returns a real match for this worker/village
      const board = boardRes?.data?.data;
      const entries = board?.leaderboard || board?.villages || board?.entries || [];
      if (Array.isArray(entries) && user?.village) {
        const match = entries.find(
          (e) =>
            (e.village && e.village.toLowerCase() === user.village.toLowerCase()) ||
            (e.name && e.name.toLowerCase() === user.village.toLowerCase()) ||
            String(e.healthWorkerId || e.workerId) === String(user._id)
        );
        if (match) {
          setRank({
            position: match.rank || match.position || match.place,
            grade: match.grade || match.scoreLabel,
            score: match.score,
          });
        } else {
          setRank(null);
        }
      } else {
        setRank(null);
      }
    } catch {
      setError("We couldn't load your village health overview.");
      setData(null);
      setRank(null);
    } finally {
      setLoading(false);
    }
  }, [user?.district, user?.village, user?._id]);

  useEffect(() => { load(); }, [load]);

  const activity = data?.recentActivity || [];
  const village = data?.village || user?.village;
  const district = data?.district || user?.district;

  const signalBars = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0, emergency: 0 };
    activity.forEach((a) => {
      const k = a.riskLevel || "low";
      if (counts[k] !== undefined) counts[k] += 1;
      else counts.low += 1;
    });
    const total = Math.max(1, activity.length);
    return [
      { label: "Emergency", value: counts.emergency / total, tone: T.danger },
      { label: "High risk", value: counts.high / total, tone: T.warn },
      { label: "Medium", value: counts.medium / total, tone: "#CA8A04" },
      { label: "Low / other", value: counts.low / total, tone: T.teal },
    ];
  }, [activity]);

  const priorities = useMemo(() => {
    const list = [];
    (activity || [])
      .filter((a) => a.riskLevel === "emergency" || a.riskLevel === "high")
      .forEach((a) => {
        list.push({
          id: a._id,
          title: a.patient?.fullName || "Patient",
          detail: a.symptoms || "High-risk follow-up required",
          meta: a.patient?.village || village,
          level: a.riskLevel,
          href: "/health-worker/high-risk",
        });
      });
    if ((data?.highRiskCount || 0) > 0 && list.length === 0) {
      list.push({
        id: "hr-summary",
        title: "High-risk patients",
        detail: `${data.highRiskCount} case${data.highRiskCount === 1 ? "" : "s"} need follow-up`,
        meta: village,
        level: "high",
        href: "/health-worker/high-risk",
      });
    }
    return list.slice(0, 6);
  }, [activity, data?.highRiskCount, village]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
      <PageHeader
        title={`${greetingForHour()}, ${user?.fullName?.split(" ")[0] || "ASHA"}`}
        subtitle={`Village health overview${village ? ` · ${village}` : ""}${district ? `, ${district}` : ""}`}
        action={<RefreshButton onClick={load} loading={loading} />}
      />

      {error && <ErrorState message={error} onRetry={load} />}

      {loading && !data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Skeleton className="h-24" /><Skeleton className="h-24" />
            <Skeleton className="h-24" /><Skeleton className="h-24" />
          </div>
          <Skeleton className="h-56 w-full" />
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricTile
              label="Assigned families"
              value={data.totalPatients ?? 0}
              hint="Active patients"
              icon={Users}
              to="/health-worker/patients"
            />
            <MetricTile
              label="High risk"
              value={data.highRiskCount ?? 0}
              hint="Last 7 days"
              icon={AlertTriangle}
              tone={(data.highRiskCount || 0) > 0 ? "danger" : "default"}
              to="/health-worker/high-risk"
            />
            <MetricTile
              label="Recent reports"
              value={activity.length}
              hint="Latest village signals"
              icon={Activity}
            />
            {rank?.position != null ? (
              <MetricTile
                label="Village rank"
                value={`#${rank.position}`}
                hint={rank.grade ? `Grade ${rank.grade}` : district || "Leaderboard"}
                icon={Trophy}
                to="/health-worker/leaderboard"
              />
            ) : (
              <MetricTile
                label="Coverage area"
                value={village ? village.slice(0, 10) : "—"}
                hint={district || "Assigned region"}
                icon={MapPin}
                tone="muted"
              />
            )}
          </div>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6">
            {/* Today's priorities */}
            <Surface className="p-5 md:p-6">
              <SectionLabel>Today's priorities</SectionLabel>
              <h2 className="text-lg font-semibold -mt-1 mb-5" style={{ fontFamily: "Syne, sans-serif", color: T.ink }}>
                Who needs attention
              </h2>

              {priorities.length > 0 ? (
                <ol className="space-y-3">
                  {priorities.map((p, i) => (
                    <li key={p.id || i}>
                      <Link
                        to={p.href}
                        className="flex items-start gap-3 rounded-xl border p-3.5 transition-all duration-300 hover:-translate-y-0.5"
                        style={{ borderColor: T.borderSoft, background: T.bg }}
                      >
                        <span
                          className="text-sm font-bold tabular-nums w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: T.tealSoft, color: T.teal, fontFamily: "Syne, sans-serif" }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold" style={{ color: T.ink }}>{p.title}</span>
                            <StatusBadge status={p.level === "emergency" ? "danger" : "warn"}>
                              {p.level}
                            </StatusBadge>
                          </span>
                          <span className="block text-xs mt-1 line-clamp-2" style={{ color: T.inkMid }}>{p.detail}</span>
                          <span className="block text-[10px] mt-1.5" style={{ color: T.inkLight }}>{p.meta}</span>
                        </span>
                        <ChevronRight className="w-4 h-4 shrink-0 mt-1" style={{ color: T.inkLight }} />
                      </Link>
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState
                  title="No high-risk patients"
                  description="No immediate follow-up is required from recent high-risk signals."
                />
              )}
            </Surface>

            {/* Village health signal */}
            <Surface className="p-5 md:p-6">
              <SectionLabel>Village health signal</SectionLabel>
              <h2 className="text-lg font-semibold -mt-1 mb-2" style={{ fontFamily: "Syne, sans-serif", color: T.ink }}>
                Recent risk distribution
              </h2>
              <p className="text-xs mb-5" style={{ color: T.inkLight }}>
                Based on the latest {activity.length || 0} village health report{activity.length === 1 ? "" : "s"} — not an official outbreak declaration.
              </p>

              {activity.length > 0 ? (
                <div className="space-y-3">
                  {signalBars.map((b) => (
                    <div key={b.label}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span style={{ color: T.inkMid }}>{b.label}</span>
                        <span className="tabular-nums font-semibold" style={{ color: T.ink }}>
                          {Math.round(b.value * 100)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: T.bgAlt }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.max(4, Math.round(b.value * 100))}%`,
                            background: b.tone,
                            opacity: b.value > 0 ? 1 : 0.25,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No recent village signals"
                  description="Symptom reports from assigned families will appear here."
                />
              )}

              <div className="mt-6 pt-4 border-t" style={{ borderColor: T.borderSoft }}>
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 shrink-0 mt-0.5" style={{ color: T.teal }} />
                  <p className="text-xs leading-relaxed" style={{ color: T.inkMid }}>
                    Use this as an early field signal. Confirm patterns with supervisors and public health guidance before escalating.
                  </p>
                </div>
              </div>
            </Surface>
          </div>

          {/* Recent activity list */}
          <Surface className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <SectionLabel>Recent village reports</SectionLabel>
                <h2 className="text-lg font-semibold -mt-1" style={{ fontFamily: "Syne, sans-serif", color: T.ink }}>
                  Field activity
                </h2>
              </div>
              <Link to="/health-worker/high-risk" className="text-xs font-semibold" style={{ color: T.teal }}>
                Triage queue →
              </Link>
            </div>

            {activity.length > 0 ? (
              <div className="space-y-2">
                {activity.map((act) => (
                  <div
                    key={act._id}
                    className="flex items-center justify-between gap-3 rounded-xl border p-3.5"
                    style={{ borderColor: T.borderSoft, background: T.bg }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold" style={{ color: T.ink }}>
                        {act.patient?.fullName || "Village resident"}
                      </p>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: T.inkMid }}>
                        {act.symptoms || "Health report"}
                      </p>
                      <p className="text-[10px] mt-1.5" style={{ color: T.inkLight }}>
                        {formatShortDate(act.createdAt)} · {act.patient?.village || village || "—"}
                      </p>
                    </div>
                    <StatusBadge
                      status={
                        act.riskLevel === "emergency" || act.riskLevel === "high"
                          ? "danger"
                          : act.riskLevel === "medium"
                            ? "warn"
                            : "success"
                      }
                    >
                      {act.riskLevel || "low"}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recent reports"
                description="Assigned patient symptom activity will show up here."
              />
            )}
          </Surface>

          <div>
            <SectionLabel>Field actions</SectionLabel>
            <div className="grid sm:grid-cols-3 gap-3">
              <QuickAction to="/health-worker/patients" icon={Users} label="Village directory" desc="View assigned families" />
              <QuickAction to="/health-worker/high-risk" icon={AlertTriangle} label="High-risk queue" desc="Urgent follow-ups" />
              <QuickAction to="/health-worker/leaderboard" icon={Trophy} label="Village leaderboard" desc="Community progress" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
