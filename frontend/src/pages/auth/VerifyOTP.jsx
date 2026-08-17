import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../services/api";
import { Shield, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { T } from "../../design/tokens";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const verify = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await authAPI.verifyOTP(otp);
      setDone(true);
      setTimeout(() => navigate("/patient"), 2000);
    } catch(err) {
      setError(err.response?.data?.message || "Invalid OTP code. Please try again.");
    } finally { setLoading(false); }
  };

  if (done) return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: T.bg }}>
      <div className="rounded-3xl p-8 max-w-sm w-full text-center border shadow-sm" style={{ background: T.surfaceRaised, borderColor: T.border }}>
        <CheckCircle className="w-14 h-14 mx-auto mb-4" style={{ color: T.success }} />
        <h2 className="text-xl font-bold" style={{ fontFamily: "Syne, sans-serif", color: T.ink }}>Account Verified!</h2>
        <p className="text-xs mt-2" style={{ color: T.inkMid }}>Redirecting to your RuralCare AI dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ background: T.bg }}>
      {/* Background glow overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 60% 50% at 50% 30%, ${T.tealGlow}, transparent 70%)` }}
      />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md"
            style={{ background: T.tealSoft, color: T.teal }}
          >
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "Syne, sans-serif", color: T.ink }}>
            Verify OTP
          </h1>
          <p className="text-xs mt-1" style={{ color: T.inkLight }}>
            Enter the 6-digit verification code sent to your account
          </p>
        </div>

        <div
          className="rounded-3xl p-6 sm:p-8 shadow-sm border"
          style={{ background: T.surfaceRaised, borderColor: T.border }}
        >
          {error && (
            <p className="text-xs font-medium text-center p-2.5 rounded-xl mb-4" style={{ background: "#FEF2F2", color: T.danger }}>
              {error}
            </p>
          )}

          <form onSubmit={verify} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-center" style={{ color: T.inkLight }}>
                6-Digit Security Code
              </label>
              <input
                className="w-full rounded-2xl border px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono outline-none transition-colors"
                style={{ borderColor: T.border, background: T.surface, color: T.ink }}
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g,"").slice(0,6))}
                inputMode="numeric"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-white transition-all duration-300 disabled:opacity-50 shadow-sm"
              style={{ background: T.teal }}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : "Verify & Continue"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: T.borderSoft }}>
            <Link to="/login" className="inline-flex items-center gap-1 text-xs font-medium hover:underline" style={{ color: T.inkLight }}>
              <ArrowLeft className="w-3 h-3" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
