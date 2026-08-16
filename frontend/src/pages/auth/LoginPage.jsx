import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import { Heart, Phone, Lock, Loader2, AlertCircle } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">RuralCare AI</h1>
          <p className="text-gray-500 text-sm mt-1">Multilingual Healthcare for Rural India</p>
        </div>

        <div className="card shadow-xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Sign In</h2>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" className="input pl-10" placeholder="9876543210" value={form.phone}
                  onChange={e => setForm(f=>({...f, phone:e.target.value}))} required maxLength={10} />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" className="input pl-10" placeholder="Enter password" value={form.password}
                  onChange={e => setForm(f=>({...f, password:e.target.value}))} required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</> : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            New user?{" "}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">Register here</Link>
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            <Link to="/" className="text-gray-500 hover:text-primary-600 hover:underline">← Back to RuralCare AI</Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Emergency? Call <a href="tel:108" className="text-red-500 font-bold">108</a> (Free Ambulance)
        </p>
      </div>
    </div>
  );
}
