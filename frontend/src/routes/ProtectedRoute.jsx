import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const roleRoutes = { patient:"/patient", doctor:"/doctor", healthWorker:"/health-worker", admin:"/admin" };
    return <Navigate to={roleRoutes[user.role] || "/login"} replace />;
  }

  return children;
}
