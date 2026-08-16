import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { doctorAPI } from "../../services/index";
import { formatDoctorName } from "../../utils/doctor";
import {
  Calendar, Clock, Users, AlertTriangle, Video, Pill,
  TestTube2, ArrowUpRight, Activity,
} from "lucide-react";
import {
  PageHeader, SectionLabel, Surface, MetricTile, StatusBadge,
  EmptyState, Skeleton, ErrorState, RefreshButton, QuickAction,
} from "../../components/dashboard/ui";
import { T, greetingForHour, formatTime } from "../../design/tokens";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [attention, setAttention] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await doctorAPI.getDashboard();
      const d = res.data?.data || {};
      setStats({
        todayAppointments: d.todayAppointments ?? 0,
        pendingAppointments: d.pendingAppointments ?? 0,
        totalPatients: d.totalPatients ?? 0,
        highRiskCount: d.highRiskCount ?? 0,
      });
      setSchedule(d.todaySchedule || []);
      setAttention(d.attention || []);
    } catch {
      setError("We couldn't load your clinical overview.");
      setStats(null);
      setSchedule([]);
      setAttention([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      <PageHeader
        title={`${greetingForHour()}, ${formatDoctorName(user?.fullName || "Doctor")}`}
        subtitle="Here is your clinical overview for today — who needs attention, and what to prepare."
        action={<RefreshButton onClick={load} loading={loading} />}
      />

      {error && <ErrorState message={error} onRetry={load} />}

      {loading && !stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Skeleton className="h-24" /><Skeleton className="h-24" />
            <Skeleton className="h-24" /><Skeleton className="h-24" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricTile
              label="Today's visits"
              value={stats.todayAppointments}
              hint="Scheduled for today"
              icon={Calendar}
              to="/doctor/appointments"
            />
            <MetricTile
              label="Pending"
              value={stats.pendingAppointments}
              hint="Awaiting confirmation"
              icon={Clock}
              tone={stats.pendingAppointments > 0 ? "warn" : "default"}
              to="/doctor/appointments"
            />
            <MetricTile
              label="Patients"
              value={stats.totalPatients}
              hint="In your care"
              icon={Users}
              to="/doctor/patients"
            />
            <MetricTile
              label="High-risk"
              value={stats.highRiskCount}
              hint="Last 7 days"
              icon={AlertTriangle}
              tone={stats.highRiskCount > 0 ? "danger" : "default"}
            />
          </div>

          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
            {/* Today's clinic */}
            <Surface className="p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <SectionLabel>Today's clinic</SectionLabel>
                  <h2 className="text-lg font-semibold -mt-1" style={{ fontFamily: "Syne, sans-serif", color: T.ink }}>
                    Consultation schedule
                  </h2>
                </div>
                <Link to="/doctor/appointments" className="text-xs font-semibold" style={{ color: T.teal }}>
                  View all →
                </Link>
              </div>

              {schedule.length > 0 ? (
                <div className="space-y-2">
                  {schedule.map((apt) => {
                    const patient = apt.patient || {};
                    const isTelemed = apt.consultationType === "telemedicine";
                    return (
                      <div
                        key={apt._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5"
                        style={{ borderColor: T.borderSoft, background: T.bg }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                            style={{ background: T.tealSoft, color: T.teal }}
                          >
                            {(patient.fullName || "P").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            {patient._id ? (
                              <Link
                                to={`/doctor/patients/${patient._id}`}
                                className="text-sm font-semibold inline-flex items-center gap-1 hover:underline"
                                style={{ color: T.ink }}
                              >
                                {patient.fullName || "Patient"}
                                <ArrowUpRight className="w-3 h-3" style={{ color: T.teal }} />
                              </Link>
                            ) : (
                              <p className="text-sm font-semibold" style={{ color: T.ink }}>
                                {patient.fullName || "Patient"}
                              </p>
                            )}
                            <p className="text-xs mt-0.5" style={{ color: T.inkLight }}>
                              {[patient.age && `${patient.age}y`, patient.gender, patient.village]
                                .filter(Boolean)
                                .join(" · ") || patient.phone || "—"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                          <span className="text-xs font-medium tabular-nums flex items-center gap-1" style={{ color: T.inkMid }}>
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(apt.scheduledAt)}
                          </span>
                          <StatusBadge status={apt.status === "confirmed" ? "success" : apt.status === "cancelled" ? "muted" : "warn"}>
                            {apt.status || "scheduled"}
                          </StatusBadge>
                          {isTelemed ? (
                            <button
                              type="button"
                              onClick={() => navigate(`/telemedicine/consult-${apt._id}`)}
                              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full text-white"
                              style={{ background: T.teal }}
                            >
                              <Video className="w-3.5 h-3.5" /> Start
                            </button>
                          ) : patient._id ? (
                            <Link
                              to={`/doctor/patients/${patient._id}`}
                              className="text-xs font-semibold px-3 py-1.5 rounded-full border"
                              style={{ borderColor: T.border, color: T.inkMid }}
                            >
                              Record
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="No consultations scheduled for today"
                  description="Your clinic schedule is clear. Pending requests appear under Appointments."
                />
              )}
            </Surface>

            {/* Requires attention */}
            <Surface className="p-5 md:p-6">
              <SectionLabel>Requires attention</SectionLabel>
              <h2 className="text-lg font-semibold -mt-1 mb-4" style={{ fontFamily: "Syne, sans-serif", color: T.ink }}>
                Clinical priorities
              </h2>

              <div className="space-y-2 mb-5">
                {stats.pendingAppointments > 0 && (
                  <Link
                    to="/doctor/appointments"
                    className="flex items-center gap-3 rounded-xl border p-3 transition-colors"
                    style={{ borderColor: T.borderSoft, background: T.accentSoft }}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: T.warn }} />
                    <span className="text-sm flex-1" style={{ color: T.ink }}>
                      {stats.pendingAppointments} appointment{stats.pendingAppointments === 1 ? "" : "s"} pending confirmation
                    </span>
                    <ChevronHint />
                  </Link>
                )}
                {stats.highRiskCount > 0 && (
                  <div
                    className="flex items-center gap-3 rounded-xl border p-3"
                    style={{ borderColor: "#FECACA", background: "#FEF2F2" }}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: T.danger }} />
                    <span className="text-sm flex-1" style={{ color: T.ink }}>
                      {stats.highRiskCount} high-risk record{stats.highRiskCount === 1 ? "" : "s"} in the last 7 days
                    </span>
                  </div>
                )}
                {stats.pendingAppointments === 0 && stats.highRiskCount === 0 && attention.length === 0 && (
                  <EmptyState
                    title="No urgent items"
                    description="No pending appointments or high-risk signals right now."
                  />
                )}
              </div>

              {attention.length > 0 && (
                <>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: T.inkLight }}>
                    Recent high-risk signals
                  </p>
                  <ul className="space-y-2">
                    {attention.map((rec) => (
                      <li key={rec._id}>
                        {rec.patient?._id ? (
                          <Link
                            to={`/doctor/patients/${rec.patient._id}`}
                            className="block rounded-xl border p-3 transition-colors"
                            style={{ borderColor: T.borderSoft, background: T.bg }}
                          >
                            <AttentionRow rec={rec} />
                          </Link>
                        ) : (
                          <div className="rounded-xl border p-3" style={{ borderColor: T.borderSoft, background: T.bg }}>
                            <AttentionRow rec={rec} />
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] mt-3" style={{ color: T.inkLight }}>
                    AI and symptom risk signals support clinical judgment — they are not a diagnosis.
                  </p>
                </>
              )}
            </Surface>
          </div>

          <div>
            <SectionLabel>Clinical actions</SectionLabel>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <QuickAction to="/doctor/appointments" icon={Calendar} label="Appointments" desc="Manage today's clinic" />
              <QuickAction to="/doctor/prescriptions" icon={Pill} label="Prescriptions" desc="Digital clinical Rx" />
              <QuickAction to="/doctor/lab" icon={TestTube2} label="Lab tests" desc="Order & review" />
              <QuickAction to="/doctor/patients" icon={Users} label="Patient directory" desc="Records & history" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ChevronHint() {
  return <ArrowUpRight className="w-3.5 h-3.5 shrink-0" style={{ color: T.teal }} />;
}

function AttentionRow({ rec }) {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold" style={{ color: T.ink }}>
          {rec.patient?.fullName || "Patient"}
        </p>
        <StatusBadge status={rec.riskLevel === "emergency" ? "danger" : "warn"}>
          {rec.riskLevel}
        </StatusBadge>
      </div>
      <p className="text-xs mt-1 line-clamp-2" style={{ color: T.inkMid }}>
        {rec.symptoms || "High-risk health activity"}
      </p>
      <p className="text-[10px] mt-1.5 flex items-center gap-1" style={{ color: T.inkLight }}>
        <Activity className="w-3 h-3" />
        {rec.patient?.village || "—"}
      </p>
    </>
  );
}
