import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import { Heart, Phone, Lock, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { T } from "../../design/tokens";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ phone:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await authAPI.login(form);
      const { user, token } = res.data.data;
      login(user, token);
      const routes = { patient:"/patient", doctor:"/doctor", healthWorker:"/health-worker", admin:"/admin" };
      navigate(routes[user.role] || "/patient");
    } catch(err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ background: T.bg }}>
      {/* Background glow overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 60% 50% at 50% 30%, ${T.tealGlow}, transparent 70%)` }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md"
            style={{ background: T.teal, color: "#FFFFFF" }}
          >
            <Heart className="w-7 h-7 fill-white/20" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "Syne, sans-serif", color: T.ink }}>
            RuralCare AI
          </h1>
          <p className="text-xs mt-1" style={{ color: T.inkLight }}>
            Multilingual Healthcare Platform for Rural India
          </p>
        </div>

        {/* Auth Card */}
        <div
          className="rounded-3xl p-6 sm:p-8 shadow-sm border"
          style={{ background: T.surfaceRaised, borderColor: T.border }}
        >
          <div className="mb-5">
            <h2 className="text-lg font-bold" style={{ fontFamily: "Syne, sans-serif", color: T.ink }}>
              Sign In to Your Account
            </h2>
            <p className="text-xs mt-0.5" style={{ color: T.inkMid }}>
              Enter your registered phone number and password
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl p-3 mb-4 text-xs" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: T.danger }}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.inkLight }}>
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: T.inkLight }} />
                <input
                  type="tel"
                  className="w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm outline-none transition-colors"
                  style={{ borderColor: T.border, background: T.surface, color: T.ink }}
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={e => setForm(f=>({...f, phone:e.target.value}))}
                  required
                  maxLength={10}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.inkLight }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: T.inkLight }} />
                <input
                  type="password"
                  className="w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm outline-none transition-colors"
                  style={{ borderColor: T.border, background: T.surface, color: T.ink }}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm(f=>({...f, password:e.target.value}))}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-white transition-all duration-300 disabled:opacity-50 mt-2 shadow-sm"
              style={{ background: T.teal }}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t text-center space-y-2 text-xs" style={{ borderColor: T.borderSoft }}>
            <p style={{ color: T.inkMid }}>
              New to RuralCare AI?{" "}
              <Link to="/register" className="font-bold hover:underline" style={{ color: T.teal }}>
                Register here
              </Link>
            </p>
            <p>
              <Link to="/" className="inline-flex items-center gap-1 font-medium hover:underline" style={{ color: T.inkLight }}>
                <ArrowLeft className="w-3 h-3" /> Back to RuralCare AI
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: T.inkLight }}>
          Medical emergency? Call <a href="tel:108" className="font-bold" style={{ color: T.danger }}>108</a> (Free Ambulance)
        </p>
      </div>
    </div>
  );
}
