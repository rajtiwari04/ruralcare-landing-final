import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { appointmentAPI } from "../../services/index";
import { formatDoctorName } from "../../utils/doctor";
import { Calendar, Clock, Plus, Loader2, Video } from "lucide-react";
import useAnalytics from "../../hooks/useAnalytics";
import {
  PatientPage, PageHeader, Surface, SectionLabel, SoftChip, StatusBadge,
  EmptyState, Skeleton, ErrorState, RefreshButton, PatientBtn,
  FieldLabel, FieldInput, FieldSelect, FieldTextarea, T,
} from "../../components/patient/ui";
import { formatShortDate, formatTime, isSameDay } from "../../design/tokens";

function statusTone(status) {
  if (status === "confirmed" || status === "completed") return "success";
  if (status === "cancelled") return "muted";
  return "warn";
}

export default function AppointmentsPage() {
  const { track } = useAnalytics();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    doctorId: "",
    scheduledAt: "",
    reason: "",
    consultationType: "in-person",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [apptRes, docRes] = await Promise.all([
        appointmentAPI.getMyList(),
        appointmentAPI.listDoctors(),
      ]);
      setAppointments(apptRes.data?.data?.appointments || []);
      setDoctors(docRes.data?.data?.doctors || []);
    } catch {
      setError("We couldn't load your appointments.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const book = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      await appointmentAPI.book(form);
      track("appointment_booked");
      setShowForm(false);
      setForm({ doctorId: "", scheduledAt: "", reason: "", consultationType: "in-person" });
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDT = minDate.toISOString().slice(0, 16);

  const upcoming = appointments.filter((a) => new Date(a.scheduledAt) >= new Date() && a.status !== "cancelled");
  const next = upcoming[0];

  return (
    <PatientPage>
      <PageHeader
        title="Appointments"
        subtitle="Book visits, join video consultations, and keep track of your care schedule."
        action={
          <div className="flex items-center gap-2">
            <RefreshButton onClick={load} loading={loading} />
            <PatientBtn onClick={() => setShowForm((f) => !f)}>
              <Plus className="w-4 h-4" />
              {showForm ? "Close" : "Book"}
            </PatientBtn>
          </div>
        }
      />

      {next && !showForm && (
        <Surface className="p-5 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 70% 80% at 100% 0%, ${T.tealGlow}, transparent 60%)` }}
          />
          <div className="relative">
            <SectionLabel>Next appointment</SectionLabel>
            <p className="text-lg font-semibold" style={{ fontFamily: "Syne, sans-serif", color: T.ink }}>
              {formatDoctorName(next.doctor?.fullName)}
            </p>
            <p className="text-sm mt-1 flex items-center gap-2 flex-wrap" style={{ color: T.inkMid }}>
              <Clock className="w-3.5 h-3.5" />
              {isSameDay(next.scheduledAt) ? "Today" : formatShortDate(next.scheduledAt)} · {formatTime(next.scheduledAt)}
              <StatusBadge status={statusTone(next.status)}>{next.status}</StatusBadge>
            </p>
            <p className="text-xs mt-2 capitalize" style={{ color: T.inkLight }}>
              {next.consultationType === "telemedicine" ? "Video consultation" : "In-person visit"}
              {next.reason ? ` · ${next.reason}` : ""}
            </p>
            {next.status === "confirmed" && next.consultationType === "telemedicine" && (
              <Link
                to={`/telemedicine/consult-${next._id}`}
                className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold px-4 py-2 rounded-full text-white"
                style={{ background: T.teal }}
              >
                <Video className="w-3.5 h-3.5" /> Join consultation
              </Link>
            )}
          </div>
        </Surface>
      )}

      {showForm && (
        <Surface className="p-5">
          <SectionLabel>Book new appointment</SectionLabel>
          <form onSubmit={book} className="space-y-3 mt-2">
            <div>
              <FieldLabel>Doctor</FieldLabel>
              <FieldSelect
                value={form.doctorId}
                onChange={(e) => setForm((f) => ({ ...f, doctorId: e.target.value }))}
                required
              >
                <option value="">Choose doctor…</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {formatDoctorName(d.fullName)} — {d.village || d.district || "Available"}
                  </option>
                ))}
              </FieldSelect>
            </div>
            <div>
              <FieldLabel>Date & time</FieldLabel>
              <FieldInput
                type="datetime-local"
                min={minDT}
                value={form.scheduledAt}
                onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                required
              />
            </div>
            <div>
              <FieldLabel>Reason</FieldLabel>
              <FieldTextarea
                rows={2}
                placeholder="Briefly describe why you need to visit…"
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              />
            </div>
            <div>
              <FieldLabel>Consultation type</FieldLabel>
              <div className="flex gap-2">
                <SoftChip
                  active={form.consultationType === "in-person"}
                  onClick={() => setForm((f) => ({ ...f, consultationType: "in-person" }))}
                >
                  In-person
                </SoftChip>
                <SoftChip
                  active={form.consultationType === "telemedicine"}
                  onClick={() => setForm((f) => ({ ...f, consultationType: "telemedicine" }))}
                >
                  Video call
                </SoftChip>
              </div>
            </div>
            {formError && <p className="text-sm" style={{ color: T.danger }}>{formError}</p>}
            <PatientBtn type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Booking…</>
              ) : (
                <><Calendar className="w-4 h-4" /> Confirm booking</>
              )}
            </PatientBtn>
          </form>
        </Surface>
      )}

      {error && <ErrorState message={error} onRetry={load} />}

      {loading && appointments.length === 0 && (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {!loading && appointments.length === 0 && !error && (
        <Surface>
          <EmptyState
            title="No upcoming appointments"
            description="You don't have an appointment scheduled yet."
            action={
              <PatientBtn onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4" /> Book appointment
              </PatientBtn>
            }
          />
        </Surface>
      )}

      {appointments.length > 0 && (
        <div className="space-y-2">
          <SectionLabel>All appointments</SectionLabel>
          {appointments.map((a) => {
            const past = new Date(a.scheduledAt) < new Date();
            return (
              <Surface key={a._id} className="p-4 flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: past ? T.bgAlt : T.tealSoft, color: past ? T.inkLight : T.teal }}
                >
                  {a.consultationType === "telemedicine" ? <Video className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: T.ink }}>
                    {formatDoctorName(a.doctor?.fullName)}
                  </p>
                  <p className="text-xs mt-0.5 flex items-center gap-2 flex-wrap" style={{ color: T.inkLight }}>
                    <Clock className="w-3 h-3" />
                    {formatShortDate(a.scheduledAt)} · {formatTime(a.scheduledAt)}
                    <StatusBadge status={statusTone(a.status)}>{a.status}</StatusBadge>
                  </p>
                  {a.reason && (
                    <p className="text-xs mt-1 line-clamp-1" style={{ color: T.inkMid }}>{a.reason}</p>
                  )}
                </div>
                {a.status === "confirmed" && a.consultationType === "telemedicine" && !past && (
                  <Link
                    to={`/telemedicine/consult-${a._id}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full text-white shrink-0"
                    style={{ background: T.teal }}
                  >
                    Join
                  </Link>
                )}
              </Surface>
            );
          })}
        </div>
      )}
    </PatientPage>
  );
}
