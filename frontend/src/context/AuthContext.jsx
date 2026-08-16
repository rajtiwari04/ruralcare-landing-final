import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("rc_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me")
      .then(r => setUser(r.data.data.user))
      .catch(()  => localStorage.removeItem("rc_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("rc_token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("rc_token");
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7F5F0" }}>
      <div className="text-center">
        <div
          className="w-10 h-10 border-4 rounded-full animate-spin mx-auto"
          style={{ borderColor: "#0D5C50", borderTopColor: "transparent" }}
        />
        <p className="text-sm mt-3" style={{ color: "#8A8A9A" }}>Loading RuralCare AI...</p>
      </div>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
