import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { patientAPI } from "../../services/index";
import {
  MessageCircle, Activity, FileText, Calendar, Mic,
  ChevronRight, Pill, Clock, Sparkles, Heart,
} from "lucide-react";
import {
  PageHeader, SectionLabel, Surface, MetricTile, StatusBadge,
  EmptyState, Skeleton, ErrorState, RefreshButton, QuickAction,
} from "../../components/dashboard/ui";
import {
  T, greetingForHour, formatShortDate, formatTime, isSameDay,
} from "../../design/tokens";
import { formatDoctorName } from "../../utils/doctor";

const RISK_STATUS = {
  low: "success",
  medium: "warn",
  high: "danger",
  emergency: "danger",
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await patientAPI.getDashboard();
      setData(res.data?.data || null);
    } catch {
      setError("We couldn't load your health summary.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const score = data?.score;
  const nextAppt = data?.nextAppointment;
  const reminders = data?.reminders || [];
  const records = data?.recentRecords || [];
  const reports = data?.recentReports || [];
  const stats = data?.stats || {};

  const attentionItems = [];
  if ((data?.unreadNotifications || 0) > 0) {
    attentionItems.push(`${data.unreadNotifications} unread notification${data.unreadNotifications === 1 ? "" : "s"}`);
  }
  if (reports.length > 0) {
    attentionItems.push(`${reports.length} recent report${reports.length === 1 ? "" : "s"} available`);
  }
  if (reminders.length > 0) {
    attentionItems.push(`${reminders.length} active medication reminder${reminders.length === 1 ? "" : "s"}`);
  }

  const healthStatusLabel = score
    ? (score.score >= 70 ? "Stable" : score.score >= 40 ? "Needs attention" : "Needs care")
    : "—";

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
      <PageHeader
        title={`${greetingForHour()}, ${user?.fullName?.split(" ")[0] || "there"}`}
        subtitle="Your health, understood. RuralCare AI helps you manage symptoms, reports, medications, and ongoing care."
        action={<RefreshButton onClick={load} loading={loading} />}
      />

      {error && <ErrorState message={error} onRetry={load} />}

      {loading && !data && (
        <div className="space-y-4">
          <Skeleton className="h-36 w-full" />
          <div className="grid sm:grid-cols-3 gap-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {data && (
        <>
          {/* Health today */}
          <Surface className="p-5 md:p-6 overflow-hidden relative">
            <div
              className="absolute inset-0 pointer-events-none opacity-80"
              style={{
                background: `radial-gradient(ellipse 60% 80% at 100% 0%, ${T.tealGlow}, transparent 55%)`,
              }}
            />
            <div className="relative">
              <SectionLabel>Your health today</SectionLabel>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: T.inkLight }}>Status</p>
                  <p className="text-lg font-semibold mt-1 flex items-center gap-2" style={{ color: T.ink }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: score?.score >= 70 ? T.success : score?.score >= 40 ? T.warn : T.danger }} />
                    {healthStatusLabel}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: T.inkLight }}>Next appointment</p>
                  {nextAppt ? (
                    <p className="text-sm font-semibold mt-1" style={{ color: T.ink }}>
                      {formatDoctorName(nextAppt.doctor?.fullName || "Doctor")}
                      <span className="block text-xs font-normal mt-0.5" style={{ color: T.inkMid }}>
                        {isSameDay(nextAppt.scheduledAt) ? "Today" : formatShortDate(nextAppt.scheduledAt)} · {formatTime(nextAppt.scheduledAt)}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm mt-1" style={{ color: T.inkLight }}>None scheduled</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: T.inkLight }}>Medication</p>
                  <p className="text-sm font-semibold mt-1" style={{ color: T.ink }}>
                    {reminders.length > 0 ? `${reminders.length} active reminder${reminders.length === 1 ? "" : "s"}` : "No active reminders"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: T.inkLight }}>Attention</p>
                  <p className="text-sm font-semibold mt-1" style={{ color: T.ink }}>
                    {attentionItems[0] || "You're all caught up"}
                  </p>
                </div>
              </div>
            </div>
          </Surface>

          {/* AI Assistant centerpiece */}
          <Surface className="p-5 md:p-7">
            <div className="flex items-start gap-3 mb-5">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 rc-pulse-soft"
                style={{ background: T.tealSoft, color: T.teal }}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <SectionLabel>AI Health Assistant</SectionLabel>
                <h2 className="text-xl font-semibold -mt-1" style={{ fontFamily: "Syne, sans-serif", color: T.ink }}>
                  How can I help with your health today?
                </h2>
                <p className="text-sm mt-1" style={{ color: T.inkMid }}>
                  Ask in {user?.preferredLanguage || "your language"} — text, voice, or upload a report.
                </p>
              </div>
            </div>

            <Link
              to="/patient/chat"
              className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-300 hover:border-teal-600/40"
              style={{ background: T.bg, borderColor: T.border }}
            >
              <span className="text-sm" style={{ color: T.inkLight }}>Ask anything about your symptoms or care…</span>
              <span
                className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-white"
                style={{ background: T.teal }}
              >
                Open chat
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              {[
                { to: "/patient/chat", icon: Mic, label: "Speak" },
                { to: "/patient/reports", icon: FileText, label: "Upload report" },
                { to: "/patient/symptoms", icon: Activity, label: "Check symptoms" },
                { to: "/patient/history", icon: Pill, label: "Medications" },
              ].map(({ to, icon: Icon, label }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-colors"
                  style={{ borderColor: T.border, color: T.inkMid, background: T.surfaceRaised }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: T.teal }} />
                  {label}
                </Link>
              ))}
            </div>
          </Surface>

          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6">
            {/* Health score */}
            <Surface className="p-5 md:p-6">
              <SectionLabel>Health status</SectionLabel>
              {score ? (
                <div className="flex items-center gap-5 mt-2">
                  <div className="relative w-24 h-24 shrink-0">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96" aria-hidden="true">
                      <circle cx="48" cy="48" r="40" fill="none" stroke={T.borderSoft} strokeWidth="8" />
                      <circle
                        cx="48" cy="48" r="40" fill="none"
                        stroke={score.score >= 70 ? T.success : score.score >= 40 ? T.warn : T.danger}
                        strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${(score.score / 100) * 251.2} 251.2`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-semibold tabular-nums" style={{ color: T.ink, fontFamily: "Syne, sans-serif" }}>
                        {score.score}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-semibold" style={{ color: T.ink }}>{score.grade || "Health score"}</p>
                    {score.improvementTips?.[0] && (
                      <p className="text-sm mt-1 leading-relaxed" style={{ color: T.inkMid }}>
                        {score.improvementTips[0]}
                      </p>
                    )}
                    <p className="text-[11px] mt-3" style={{ color: T.inkLight }}>
                      Based on recent symptom risk patterns and health activity.
                    </p>
                    <Link to="/patient/insights" className="inline-flex items-center gap-1 text-xs font-semibold mt-2" style={{ color: T.teal }}>
                      View insights <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No health score yet"
                  description="Complete a symptom check or chat with AI to build your health picture."
                  action={
                    <Link to="/patient/chat" className="text-sm font-semibold" style={{ color: T.teal }}>
                      Start AI chat →
                    </Link>
                  }
                />
              )}
            </Surface>

            {/* Next appointment + medications */}
            <div className="space-y-6">
              <Surface className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <SectionLabel>Next appointment</SectionLabel>
                  <Link to="/patient/appointments" className="text-xs font-semibold" style={{ color: T.teal }}>All →</Link>
                </div>
                {nextAppt ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold" style={{ color: T.ink }}>
                        {formatDoctorName(nextAppt.doctor?.fullName || "Doctor")}
                      </p>
                      <p className="text-sm mt-0.5" style={{ color: T.inkMid }}>
                        {nextAppt.doctor?.specialization || nextAppt.consultationType || "Consultation"}
                      </p>
                      <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: T.inkLight }}>
                        <Clock className="w-3.5 h-3.5" />
                        {isSameDay(nextAppt.scheduledAt) ? "Today" : formatShortDate(nextAppt.scheduledAt)} · {formatTime(nextAppt.scheduledAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={nextAppt.status === "confirmed" ? "success" : "warn"}>
                        {nextAppt.status}
                      </StatusBadge>
                      {nextAppt.consultationType === "telemedicine" && nextAppt.status === "confirmed" && (
                        <Link
                          to={`/telemedicine/consult-${nextAppt._id}`}
                          className="text-xs font-semibold px-3 py-2 rounded-full text-white"
                          style={{ background: T.teal }}
                        >
                          Join
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    title="No upcoming appointments"
                    description="You're all caught up. Book a visit when you need care."
                    action={
                      <Link to="/patient/appointments" className="text-sm font-semibold" style={{ color: T.teal }}>
                        Book appointment →
                      </Link>
                    }
                  />
                )}
              </Surface>

              <Surface className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <SectionLabel>Medications</SectionLabel>
                  <span className="text-xs" style={{ color: T.inkLight }}>{reminders.length} active</span>
                </div>
                {reminders.length > 0 ? (
                  <ul className="space-y-2.5">
                    {reminders.slice(0, 4).map((r) => (
                      <li
                        key={r._id}
                        className="flex items-center justify-between gap-3 py-2 border-b last:border-0"
                        style={{ borderColor: T.borderSoft }}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: T.ink }}>
                            {r.medicationName || r.medicineName || r.name || "Medication"}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: T.inkLight }}>
                            {[r.dosage, r.frequency || (Array.isArray(r.reminderTimes) ? r.reminderTimes.join(", ") : null)]
                              .filter(Boolean)
                              .join(" · ") || "Scheduled reminder"}
                          </p>
                        </div>
                        <Pill className="w-4 h-4 shrink-0" style={{ color: T.teal }} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    title="No medication reminders"
                    description="Reminders appear here when prescribed or set up for you."
                  />
                )}
              </Surface>
            </div>
          </div>

          {/* Timeline + Reports */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Surface className="p-5">
              <div className="flex items-center justify-between mb-4">
                <SectionLabel>Health timeline</SectionLabel>
                <Link to="/patient/history" className="text-xs font-semibold" style={{ color: T.teal }}>See all →</Link>
              </div>
              {records.length > 0 ? (
                <ol className="relative space-y-0 pl-1">
                  {records.map((r, i) => (
                    <li key={r._id} className="flex gap-3 pb-4 last:pb-0">
                      <div className="flex flex-col items-center">
                        <span
                          className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                          style={{ background: i === 0 ? T.teal : T.border }}
                        />
                        {i < records.length - 1 && (
                          <span className="w-px flex-1 mt-1" style={{ background: T.borderSoft }} />
                        )}
                      </div>
                      <div className="min-w-0 pb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge status={RISK_STATUS[r.riskLevel] || "muted"}>
                            {r.riskLevel || "record"}
                          </StatusBadge>
                          <span className="text-[11px]" style={{ color: T.inkLight }}>
                            {formatShortDate(r.createdAt)} · {formatTime(r.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm mt-1.5 line-clamp-2" style={{ color: T.inkMid }}>
                          {r.symptoms || r.summary || "Health activity recorded"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState
                  title="No timeline events yet"
                  description="Symptom checks and consultations will appear here."
                />
              )}
            </Surface>

            <Surface className="p-5">
              <div className="flex items-center justify-between mb-4">
                <SectionLabel>Report intelligence</SectionLabel>
                <Link to="/patient/reports" className="text-xs font-semibold" style={{ color: T.teal }}>All reports →</Link>
              </div>
              {reports.length > 0 ? (
                <div className="space-y-3">
                  {reports.map((rep) => (
                    <Link
                      key={rep._id}
                      to="/patient/reports"
                      className="block rounded-xl border p-3.5 transition-colors"
                      style={{ borderColor: T.borderSoft, background: T.bg }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: T.ink }}>
                            {(rep.reportType || "medical_report").replace(/_/g, " ")}
                          </p>
                          <p className="text-[11px] mt-0.5" style={{ color: T.inkLight }}>
                            Uploaded {formatShortDate(rep.createdAt)}
                          </p>
                        </div>
                        <FileText className="w-4 h-4 shrink-0" style={{ color: T.teal }} />
                      </div>
                      {(rep.aiSummary || rep.summary) && (
                        <p className="text-xs mt-2 line-clamp-2 leading-relaxed" style={{ color: T.inkMid }}>
                          {rep.aiSummary || rep.summary}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No reports yet"
                  description="Upload a blood report photo for plain-language AI explanation."
                  action={
                    <Link to="/patient/reports" className="text-sm font-semibold" style={{ color: T.teal }}>
                      Upload report →
                    </Link>
                  }
                />
              )}
            </Surface>
          </div>

          {/* Quick actions */}
          <div>
            <SectionLabel>Quick actions</SectionLabel>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <QuickAction to="/patient/prescriptions" icon={Pill} label="Prescriptions" desc="Doctor Rxs & medicines" />
              <QuickAction to="/patient/chat" icon={MessageCircle} label="Ask AI" desc="Symptom help & guidance" />
              <QuickAction to="/patient/reports" icon={FileText} label="Upload report" desc="OCR + explanation" />
              <QuickAction to="/patient/appointments" icon={Calendar} label="Book appointment" desc="In-person or video" />
            </div>
          </div>

          {/* Compact stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricTile label="Prescriptions" value={stats.prescriptionsCount ?? "View"} icon={Pill} to="/patient/prescriptions" />
            <MetricTile label="Upcoming" value={stats.upcomingAppointments ?? 0} icon={Calendar} to="/patient/appointments" />
            <MetricTile label="Reports" value={stats.recentReports ?? 0} icon={FileText} to="/patient/reports" />
            <MetricTile label="Records" value={stats.healthRecords ?? 0} icon={Activity} to="/patient/history" />
          </div>
        </>
      )}
    </div>
  );
}
