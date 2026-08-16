import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import { Heart, Loader2, AlertCircle, CheckCircle } from "lucide-react";

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
      const res = await authAPI.register({ ...data, age:Number(data.age) });
      const { user, token } = res.data.data;
      login(user, token);
      navigate("/patient");
    } catch(err) {
      setError(err.response?.data?.message || "Registration failed.");
      setStep(1);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 text-sm">RuralCare AI — Free healthcare assistant</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-5 px-4">
          {[1,2].map(s => (
            <React.Fragment key={s}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step>=s ? "bg-primary-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                {step>s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s<2 && <div className={`flex-1 h-0.5 ${step>s?"bg-primary-500":"bg-gray-200"}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="card shadow-xl">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={nextStep} className="space-y-3">
              <h2 className="font-semibold text-gray-900 mb-3">Basic Info</h2>
              <div><label className="label">Full Name *</label><input className="input" placeholder="Your full name" value={form.fullName} onChange={update("fullName")} required /></div>
              <div><label className="label">Phone Number *</label><input type="tel" className="input" placeholder="10-digit number" value={form.phone} onChange={update("phone")} required maxLength={10} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Password *</label><input type="password" className="input" placeholder="Min 6 chars" value={form.password} onChange={update("password")} required minLength={6} /></div>
                <div><label className="label">Confirm *</label><input type="password" className="input" placeholder="Repeat" value={form.confirmPassword} onChange={update("confirmPassword")} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Age</label><input type="number" className="input" placeholder="Age" value={form.age} onChange={update("age")} min={1} max={120} /></div>
                <div><label className="label">Gender</label>
                  <select className="input" value={form.gender} onChange={update("gender")}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full mt-1">Next →</button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <h2 className="font-semibold text-gray-900 mb-3">Location & Language</h2>
              <div><label className="label">Village</label><input className="input" placeholder="Your village" value={form.village} onChange={update("village")} /></div>
              <div><label className="label">Tehsil / Block</label><input className="input" placeholder="Tehsil name" value={form.tehsil} onChange={update("tehsil")} /></div>
              <div><label className="label">District *</label><input className="input" placeholder="District name" value={form.district} onChange={update("district")} required /></div>
              <div>
                <label className="label">Preferred Language *</label>
                <select className="input" value={form.preferredLanguage} onChange={update("preferredLanguage")}>
                  {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div className="flex gap-2 mt-1">
                <button type="button" onClick={()=>setStep(1)} className="btn-outline flex-1">← Back</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : "Register"}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            <Link to="/" className="text-gray-500 hover:text-primary-600 hover:underline">← Back to RuralCare AI</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
