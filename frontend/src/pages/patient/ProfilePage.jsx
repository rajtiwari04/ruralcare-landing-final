import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { patientAPI } from "../../services/index";
import {
  Phone, MapPin, Globe, Edit3, Pill, FileText,
  Calendar, Activity, Loader2, X, Save, Users,
} from "lucide-react";
import {
  PatientPage, PageHeader, Surface, SectionLabel, MetricTile,
  EmptyState, Skeleton, ErrorState, RefreshButton, PatientBtn,
  FieldLabel, FieldInput, FieldSelect, StatusBadge, T,
} from "../../components/patient/ui";

const SUPPORTED_LANGUAGES = [
  { code: "hindi", label: "हिन्दी (Hindi)" },
  { code: "english", label: "English" },
  { code: "bhojpuri", label: "भोजपुरी (Bhojpuri)" },
  { code: "awadhi", label: "अवधी (Awadhi)" },
  { code: "bengali", label: "বাংলা (Bengali)" },
  { code: "marathi", label: "मराठी (Marathi)" },
  { code: "tamil", label: "தமிழ் (Tamil)" },
  { code: "telugu", label: "తెలుగు (Telugu)" },
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ProfilePage() {
  const { user: authUser, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");
  const [editForm, setEditForm] = useState({});

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  };

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await patientAPI.getProfile();
      if (res.data?.success && res.data?.data) {
        setProfileData(res.data.data);
      } else {
        throw new Error("Failed");
      }
    } catch {
      if (authUser) {
        setProfileData({
          user: authUser,
          stats: {
            totalReports: 0,
            upcomingAppointments: 0,
            healthRecords: 0,
            chronicDiseasesCount: 0,
            activeRemindersCount: 0,
          },
          chronicDiseases: [],
          reminders: [],
        });
      } else {
        setError("Unable to load profile. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const openEdit = () => {
    const u = profileData?.user || authUser || {};
    setEditForm({
      fullName: u.fullName || "",
      age: u.age || "",
      gender: u.gender || "male",
      preferredLanguage: u.preferredLanguage || "hindi",
      village: u.village || "",
      tehsil: u.tehsil || "",
      district: u.district || "",
      bloodGroup: u.bloodGroup || "",
      allergies: u.allergies || "",
      emergencyContactName: u.emergencyContact?.name || "",
      emergencyContactRelation: u.emergencyContact?.relationship || "",
      emergencyContactPhone: u.emergencyContact?.phone || "",
    });
    setShowEdit(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editForm.fullName?.trim()) {
      showToast("Full name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        fullName: editForm.fullName.trim(),
        age: editForm.age ? Number(editForm.age) : null,
        gender: editForm.gender,
        preferredLanguage: editForm.preferredLanguage,
        village: editForm.village.trim(),
        tehsil: editForm.tehsil.trim(),
        district: editForm.district.trim(),
        bloodGroup: editForm.bloodGroup,
        allergies: editForm.allergies.trim(),
        emergencyContact: {
          name: editForm.emergencyContactName.trim(),
          relationship: editForm.emergencyContactRelation.trim(),
          phone: editForm.emergencyContactPhone.trim(),
        },
      };
      const res = await patientAPI.updateProfile(payload);
      const updatedUser = res.data?.data?.user;
      if (updatedUser) {
        setProfileData((prev) => ({ ...prev, user: { ...prev?.user, ...updatedUser } }));
        updateUser(updatedUser);
      }
      setShowEdit(false);
      showToast("Profile updated successfully.");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const user = profileData?.user || authUser || {};
  const stats = profileData?.stats || {};
  const chronicDiseases = profileData?.chronicDiseases || [];
  const reminders = profileData?.reminders || [];
  const healthWorker = user.assignedHealthWorker;

  const completeness = useMemo(() => {
    const fields = [
      user.fullName, user.phone, user.age, user.gender, user.village,
      user.district, user.preferredLanguage, user.bloodGroup,
      user.emergencyContact?.name, user.emergencyContact?.phone,
    ];
    const filled = fields.filter((f) => f !== undefined && f !== null && String(f).trim() !== "").length;
    return Math.round((filled / fields.length) * 100);
  }, [user]);

  const initials = user.fullName
    ? user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "P";

  const langLabel = SUPPORTED_LANGUAGES.find((l) => l.code === user.preferredLanguage)?.label || user.preferredLanguage;

  if (loading && !profileData) {
    return (
      <PatientPage max="max-w-4xl">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Skeleton className="h-24" /><Skeleton className="h-24" />
          <Skeleton className="h-24" /><Skeleton className="h-24" />
        </div>
      </PatientPage>
    );
  }

  if (error && !profileData) {
    return (
      <PatientPage max="max-w-xl">
        <ErrorState message={error} onRetry={loadProfile} />
      </PatientPage>
    );
  }

  return (
    <PatientPage max="max-w-4xl">
      {toast && (
        <div
          className="fixed bottom-20 md:bottom-6 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium text-white shadow-lg"
          style={{ background: T.ink }}
          role="status"
        >
          {toast}
        </div>
      )}

      <PageHeader
        title="Profile"
        subtitle="Your personal details, language preference, and emergency information."
        action={
          <div className="flex gap-2">
            <RefreshButton onClick={loadProfile} loading={loading} />
            <PatientBtn onClick={openEdit}><Edit3 className="w-4 h-4" /> Edit</PatientBtn>
          </div>
        }
      />

      <Surface className="p-5 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
            style={{ background: T.tealSoft, color: T.teal, fontFamily: "Syne, sans-serif" }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold" style={{ fontFamily: "Syne, sans-serif", color: T.ink }}>
              {user.fullName || "Patient"}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm" style={{ color: T.inkMid }}>
              {user.phone && (
                <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{user.phone}</span>
              )}
              {(user.village || user.district) && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {[user.village, user.district].filter(Boolean).join(", ")}
                </span>
              )}
              {langLabel && (
                <span className="inline-flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />{langLabel}</span>
              )}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <StatusBadge status="info">Profile {completeness}% complete</StatusBadge>
              {user.isVerified && <StatusBadge status="success">Verified</StatusBadge>}
            </div>
          </div>
        </div>
      </Surface>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricTile label="Reports" value={stats.totalReports ?? 0} icon={FileText} to="/patient/reports" />
        <MetricTile label="Appointments" value={stats.upcomingAppointments ?? 0} icon={Calendar} to="/patient/appointments" />
        <MetricTile label="Records" value={stats.healthRecords ?? 0} icon={Activity} to="/patient/history" />
        <MetricTile label="Reminders" value={stats.activeRemindersCount ?? reminders.length} icon={Pill} />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Surface className="p-5 space-y-3">
          <SectionLabel>Personal information</SectionLabel>
          <InfoRow label="Age" value={user.age ? `${user.age} years` : "—"} />
          <InfoRow label="Gender" value={user.gender || "—"} />
          <InfoRow label="Blood group" value={user.bloodGroup || "—"} />
          <InfoRow label="Allergies" value={user.allergies || "None listed"} />
          <InfoRow label="Language" value={langLabel || "—"} />
        </Surface>

        <Surface className="p-5 space-y-3">
          <SectionLabel>Location & emergency</SectionLabel>
          <InfoRow label="Village" value={user.village || "—"} />
          <InfoRow label="Tehsil" value={user.tehsil || "—"} />
          <InfoRow label="District" value={user.district || "—"} />
          <InfoRow
            label="Emergency contact"
            value={
              user.emergencyContact?.name
                ? `${user.emergencyContact.name}${user.emergencyContact.phone ? ` · ${user.emergencyContact.phone}` : ""}`
                : "—"
            }
          />
          {healthWorker && (
            <div className="pt-2 border-t" style={{ borderColor: T.borderSoft }}>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: T.inkLight }}>
                Assigned health worker
              </p>
              <p className="text-sm font-semibold flex items-center gap-2" style={{ color: T.ink }}>
                <Users className="w-4 h-4" style={{ color: T.teal }} />
                {healthWorker.fullName}
              </p>
              {healthWorker.phone && (
                <p className="text-xs mt-0.5" style={{ color: T.inkLight }}>{healthWorker.phone}</p>
              )}
            </div>
          )}
        </Surface>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Surface className="p-5">
          <SectionLabel>Active medications</SectionLabel>
          {reminders.length > 0 ? (
            <ul className="space-y-2 mt-1">
              {reminders.map((r) => (
                <li key={r._id} className="flex items-center justify-between gap-2 py-2 border-b last:border-0" style={{ borderColor: T.borderSoft }}>
                  <span className="text-sm font-medium" style={{ color: T.ink }}>{r.medicationName}</span>
                  <span className="text-xs" style={{ color: T.inkLight }}>{r.dosage || r.frequency || "Active"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No medication reminders" description="You're all caught up." />
          )}
        </Surface>

        <Surface className="p-5">
          <SectionLabel>Chronic conditions</SectionLabel>
          {chronicDiseases.length > 0 ? (
            <ul className="space-y-2 mt-1">
              {chronicDiseases.map((d) => (
                <li key={d._id} className="flex items-center justify-between gap-2 py-2 border-b last:border-0" style={{ borderColor: T.borderSoft }}>
                  <span className="text-sm font-medium" style={{ color: T.ink }}>{d.diseaseName}</span>
                  <StatusBadge status="warn">{d.severity || "active"}</StatusBadge>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No conditions listed" description="Chronic conditions will appear here when recorded." />
          )}
        </Surface>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { to: "/patient/chat", label: "Ask AI" },
          { to: "/patient/appointments", label: "Appointments" },
          { to: "/patient/reports", label: "Reports" },
          { to: "/patient/feedback", label: "Feedback" },
        ].map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border"
            style={{ borderColor: T.border, background: T.surfaceRaised, color: T.inkMid }}
          >
            {a.label}
          </Link>
        ))}
      </div>

      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={() => setShowEdit(false)} />
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border p-5 sm:p-6"
            style={{ background: T.surfaceRaised, borderColor: T.border }}
            role="dialog"
            aria-modal="true"
            aria-label="Edit profile"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ fontFamily: "Syne, sans-serif", color: T.ink }}>
                Edit profile
              </h3>
              <button type="button" onClick={() => setShowEdit(false)} className="p-2 rounded-xl" style={{ color: T.inkLight }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <FieldLabel>Full name</FieldLabel>
                <FieldInput value={editForm.fullName} onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Age</FieldLabel>
                  <FieldInput type="number" value={editForm.age} onChange={(e) => setEditForm((f) => ({ ...f, age: e.target.value }))} />
                </div>
                <div>
                  <FieldLabel>Gender</FieldLabel>
                  <FieldSelect value={editForm.gender} onChange={(e) => setEditForm((f) => ({ ...f, gender: e.target.value }))}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </FieldSelect>
                </div>
              </div>
              <div>
                <FieldLabel>Preferred language</FieldLabel>
                <FieldSelect value={editForm.preferredLanguage} onChange={(e) => setEditForm((f) => ({ ...f, preferredLanguage: e.target.value }))}>
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </FieldSelect>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Village</FieldLabel>
                  <FieldInput value={editForm.village} onChange={(e) => setEditForm((f) => ({ ...f, village: e.target.value }))} />
                </div>
                <div>
                  <FieldLabel>District</FieldLabel>
                  <FieldInput value={editForm.district} onChange={(e) => setEditForm((f) => ({ ...f, district: e.target.value }))} />
                </div>
              </div>
              <div>
                <FieldLabel>Tehsil</FieldLabel>
                <FieldInput value={editForm.tehsil} onChange={(e) => setEditForm((f) => ({ ...f, tehsil: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Blood group</FieldLabel>
                  <FieldSelect value={editForm.bloodGroup} onChange={(e) => setEditForm((f) => ({ ...f, bloodGroup: e.target.value }))}>
                    <option value="">Select…</option>
                    {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </FieldSelect>
                </div>
                <div>
                  <FieldLabel>Allergies</FieldLabel>
                  <FieldInput value={editForm.allergies} onChange={(e) => setEditForm((f) => ({ ...f, allergies: e.target.value }))} />
                </div>
              </div>
              <SectionLabel>Emergency contact</SectionLabel>
              <div>
                <FieldLabel>Name</FieldLabel>
                <FieldInput value={editForm.emergencyContactName} onChange={(e) => setEditForm((f) => ({ ...f, emergencyContactName: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Relation</FieldLabel>
                  <FieldInput value={editForm.emergencyContactRelation} onChange={(e) => setEditForm((f) => ({ ...f, emergencyContactRelation: e.target.value }))} />
                </div>
                <div>
                  <FieldLabel>Phone</FieldLabel>
                  <FieldInput value={editForm.emergencyContactPhone} onChange={(e) => setEditForm((f) => ({ ...f, emergencyContactPhone: e.target.value }))} />
                </div>
              </div>
              <PatientBtn type="submit" disabled={submitting} className="w-full mt-2">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save changes</>}
              </PatientBtn>
            </form>
          </div>
        </div>
      )}
    </PatientPage>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b last:border-0" style={{ borderColor: T.borderSoft }}>
      <span className="text-xs font-semibold uppercase tracking-wider shrink-0" style={{ color: T.inkLight }}>{label}</span>
      <span className="text-sm text-right capitalize" style={{ color: T.ink }}>{value}</span>
    </div>
  );
}
