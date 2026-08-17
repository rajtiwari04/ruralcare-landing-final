import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import { Heart, Loader2, AlertCircle, CheckCircle, ArrowLeft, User, Phone, Lock, MapPin, Globe } from "lucide-react";
import { T } from "../../design/tokens";

const LANGUAGES = [
  { value:"hindi",    label:"हिंदी (Hindi)" },
  { value:"english",  label:"English" },
  { value:"bhojpuri", label:"भोजपुरी (Bhojpuri)" },
  { value:"awadhi",   label:"अवधी (Awadhi)" },
  { value:"bengali",  label:"বাংলা (Bengali)" },
  { value:"marathi",  label:"मराठी (Marathi)" },
  { value:"tamil",    label:"தமிழ் (Tamil)" },
  { value:"telugu",   label:"తెలుగు (Telugu)" },
];

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm] = useState({
    fullName:"", phone:"", password:"", confirmPassword:"",
    age:"", gender:"", village:"", tehsil:"", district:"", preferredLanguage:"hindi",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [step,    setStep]    = useState(1);

  const update = k => e => setForm(f=>({...f, [k]:e.target.value}));

  const nextStep = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    setError(""); setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const { confirmPassword, ...data } = form;
      const res = await authAPI.register({ ...data, age:Number(data.age) || undefined });
      const { user, token } = res.data.data;
      login(user, token);
      navigate("/patient");
    } catch(err) {
      setError(err.response?.data?.message || "Registration failed.");
      setStep(1);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ background: T.bg }}>
      {/* Background glow overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 60% 50% at 50% 30%, ${T.tealGlow}, transparent 70%)` }}
      />

      <div className="w-full max-w-md relative z-10 my-6">
        {/* Header Branding */}
        <div className="text-center mb-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md"
            style={{ background: T.teal, color: "#FFFFFF" }}
          >
            <Heart className="w-7 h-7 fill-white/20" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "Syne, sans-serif", color: T.ink }}>
            Create Account
          </h1>
          <p className="text-xs mt-1" style={{ color: T.inkLight }}>
            RuralCare AI — Free Healthcare Assistant
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6 px-6">
          <div className="flex items-center gap-2 flex-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
              style={{
                background: step >= 1 ? T.teal : T.border,
                color: step >= 1 ? "#FFFFFF" : T.inkMid,
              }}
            >
              {step > 1 ? <CheckCircle className="w-4 h-4" /> : "1"}
            </div>
            <span className="text-xs font-semibold" style={{ color: step === 1 ? T.teal : T.inkLight }}>
              Basic Info
            </span>
          </div>

          <div className="h-0.5 flex-1 transition-colors" style={{ background: step > 1 ? T.teal : T.border }} />

          <div className="flex items-center gap-2 flex-1 justify-end">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
              style={{
                background: step >= 2 ? T.teal : T.border,
                color: step >= 2 ? "#FFFFFF" : T.inkMid,
              }}
            >
              2
            </div>
            <span className="text-xs font-semibold" style={{ color: step === 2 ? T.teal : T.inkLight }}>
              Location & Lang
            </span>
          </div>
        </div>

        {/* Auth Card */}
        <div
          className="rounded-3xl p-6 sm:p-8 shadow-sm border"
          style={{ background: T.surfaceRaised, borderColor: T.border }}
        >
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl p-3 mb-4 text-xs" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: T.danger }}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={nextStep} className="space-y-3.5">
              <h2 className="text-base font-bold mb-2" style={{ fontFamily: "Syne, sans-serif", color: T.ink }}>
                Personal Information
              </h2>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.inkLight }}>
                  Full Name *
                </label>
                <input
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors"
                  style={{ borderColor: T.border, background: T.surface, color: T.ink }}
                  placeholder="e.g. Ramesh Kumar"
                  value={form.fullName}
                  onChange={update("fullName")}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.inkLight }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors"
                  style={{ borderColor: T.border, background: T.surface, color: T.ink }}
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={update("phone")}
                  required
                  maxLength={10}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.inkLight }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors"
                    style={{ borderColor: T.border, background: T.surface, color: T.ink }}
                    placeholder="Min 6 chars"
                    value={form.password}
                    onChange={update("password")}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.inkLight }}>
                    Confirm *
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors"
                    style={{ borderColor: T.border, background: T.surface, color: T.ink }}
                    placeholder="Repeat"
                    value={form.confirmPassword}
                    onChange={update("confirmPassword")}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.inkLight }}>
                    Age
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors"
                    style={{ borderColor: T.border, background: T.surface, color: T.ink }}
                    placeholder="Age"
                    value={form.age}
                    onChange={update("age")}
                    min={1}
                    max={120}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.inkLight }}>
                    Gender
                  </label>
                  <select
                    className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors"
                    style={{ borderColor: T.border, background: T.surface, color: T.ink }}
                    value={form.gender}
                    onChange={update("gender")}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-white transition-all duration-300 mt-3 shadow-sm"
                style={{ background: T.teal }}
              >
                Continue to Step 2 →
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <h2 className="text-base font-bold mb-2" style={{ fontFamily: "Syne, sans-serif", color: T.ink }}>
                Location & Preferences
              </h2>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.inkLight }}>
                  Village
                </label>
                <input
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors"
                  style={{ borderColor: T.border, background: T.surface, color: T.ink }}
                  placeholder="Your village name"
                  value={form.village}
                  onChange={update("village")}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.inkLight }}>
                  Tehsil / Block
                </label>
                <input
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors"
                  style={{ borderColor: T.border, background: T.surface, color: T.ink }}
                  placeholder="Tehsil name"
                  value={form.tehsil}
                  onChange={update("tehsil")}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.inkLight }}>
                  District *
                </label>
                <input
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors"
                  style={{ borderColor: T.border, background: T.surface, color: T.ink }}
                  placeholder="District name"
                  value={form.district}
                  onChange={update("district")}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.inkLight }}>
                  Preferred Language *
                </label>
                <select
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors"
                  style={{ borderColor: T.border, background: T.surface, color: T.ink }}
                  value={form.preferredLanguage}
                  onChange={update("preferredLanguage")}
                >
                  {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={()=>setStep(1)}
                  className="flex-1 py-2.5 px-4 rounded-full border text-xs font-semibold transition-colors text-center"
                  style={{ borderColor: T.border, background: T.surface, color: T.inkMid }}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs font-semibold text-white transition-all duration-300 disabled:opacity-50 shadow-sm"
                  style={{ background: T.teal }}
                >
                  {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating…</> : "Register"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t text-center space-y-2 text-xs" style={{ borderColor: T.borderSoft }}>
            <p style={{ color: T.inkMid }}>
              Already have an account?{" "}
              <Link to="/login" className="font-bold hover:underline" style={{ color: T.teal }}>
                Sign in
              </Link>
            </p>
            <p>
              <Link to="/" className="inline-flex items-center gap-1 font-medium hover:underline" style={{ color: T.inkLight }}>
                <ArrowLeft className="w-3 h-3" /> Back to RuralCare AI
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
