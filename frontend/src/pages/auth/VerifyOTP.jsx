import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import { Shield, CheckCircle } from "lucide-react";

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
      setError(err.response?.data?.message || "Invalid OTP");
    } finally { setLoading(false); }
  };

  if (done) return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center">
      <div className="card text-center p-8">
        <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Verified!</h2>
        <p className="text-gray-500 mt-2">Redirecting to your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-sm">
        <Shield className="w-10 h-10 text-primary-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-gray-900 text-center mb-1">Enter OTP</h2>
        <p className="text-sm text-gray-500 text-center mb-5">Check your Telegram for the 6-digit code</p>
        {error && <p className="text-red-600 text-sm text-center mb-3">{error}</p>}
        <form onSubmit={verify} className="space-y-3">
          <input className="input text-center text-2xl tracking-[0.5em] font-mono" maxLength={6}
            placeholder="000000" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} inputMode="numeric" />
          <button type="submit" disabled={loading||otp.length<6} className="btn-primary w-full">
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
