import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Landing
import LandingPage from "./pages/landing/LandingPage";

// Auth
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyOTP from "./pages/auth/VerifyOTP";

// Patient (Phase 1 & 2)
import PatientDashboard from "./pages/patient/Dashboard";
import ChatPage from "./pages/patient/ChatPage";
import SymptomsPage from "./pages/patient/SymptomsPage";
import ReportsPage from "./pages/patient/ReportsPage";
import HealthHistoryPage from "./pages/patient/HealthHistoryPage";
import AppointmentsPage from "./pages/patient/AppointmentsPage";
import PrescriptionsPage from "./pages/patient/PrescriptionsPage";
import ProfilePage from "./pages/patient/ProfilePage";

// Patient (Phase 3 & 4)
import MaternalHealthPage from "./pages/maternal/MaternalHealthPage";
import NutritionPage from "./pages/nutrition/NutritionPage";
import SchemesPage from "./pages/schemes/SchemesPage";
import LeaderboardPage from "./pages/leaderboard/LeaderboardPage";
import LabTestsPage from "./pages/lab/LabTestsPage";

// Patient (Phase 5 & 6)
import InsightsPage from "./pages/patient/InsightsPage";
import FeedbackPage from "./pages/patient/FeedbackPage";

// Doctor
import DoctorDashboard from "./pages/doctor/Dashboard";
import PatientListPage from "./pages/doctor/PatientListPage";
import PatientDetail from "./pages/doctor/PatientDetail";
import DoctorAppointmentsPage from "./pages/doctor/DoctorAppointmentsPage";
import PrescriptionPage from "./pages/doctor/PrescriptionPage";
import DoctorLabPage from "./pages/doctor/DoctorLabPage";

// Health Worker
import HWDashboard from "./pages/healthworker/Dashboard";
import HWPatients from "./pages/healthworker/Patients";
import HWHighRisk from "./pages/healthworker/HighRisk";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminAlerts from "./pages/admin/Alerts";
import HeatmapPage from "./pages/heatmap/HeatmapPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";

// Telemedicine
import TeleconsultRoom from "./pages/telemedicine/TeleconsultRoom";

import DashboardLayout from "./layouts/DashboardLayout";

const ROLE_HOME = {
  patient: "/patient",
  doctor: "/doctor",
  healthWorker: "/health-worker",
  admin: "/admin",
};

/** Unauthenticated users see the landing page; authenticated users go to their role home. */
function RootEntry() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <LandingPage />;
  return <Navigate to={ROLE_HOME[user?.role] || "/patient"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyOTP />} />

        {/* Landing — public entry at /, /landing kept for existing links */}
        <Route path="/" element={<RootEntry />} />
        <Route path="/landing" element={<LandingPage />} />

        {/* Telemedicine — full-screen, no sidebar */}
        <Route
          path="/telemedicine/:roomId"
          element={
            <ProtectedRoute
              allowedRoles={["patient", "doctor", "admin"]}
            >
              <TeleconsultRoom />
            </ProtectedRoute>
          }
        />

        {/* ── Patient ── */}
        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <DashboardLayout role="patient" />
            </ProtectedRoute>
          }
        >
          <Route index element={<PatientDashboard />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="symptoms" element={<SymptomsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route
            path="history"
            element={<HealthHistoryPage />}
          />
          <Route
            path="appointments"
            element={<AppointmentsPage />}
          />
          <Route
            path="prescriptions"
            element={<PrescriptionsPage />}
          />
          <Route path="profile" element={<ProfilePage />} />

          {/* Phase 3 & 4 */}
          <Route path="lab-tests" element={<LabTestsPage />} />
          <Route
            path="maternal"
            element={<MaternalHealthPage />}
          />
          <Route path="nutrition" element={<NutritionPage />} />
          <Route path="schemes" element={<SchemesPage />} />
          <Route
            path="leaderboard"
            element={<LeaderboardPage />}
          />

          {/* Phase 5 & 6 */}
          <Route path="insights" element={<InsightsPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
        </Route>

        {/* ── Doctor ── */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute
              allowedRoles={["doctor", "admin"]}
            >
              <DashboardLayout role="doctor" />
            </ProtectedRoute>
          }
        >
          <Route index element={<DoctorDashboard />} />
          <Route
            path="patients"
            element={<PatientListPage />}
          />
          <Route
            path="patients/:id"
            element={<PatientDetail />}
          />
          <Route
            path="appointments"
            element={<DoctorAppointmentsPage />}
          />
          <Route
            path="prescriptions"
            element={<PrescriptionPage />}
          />
          <Route
            path="lab"
            element={<DoctorLabPage />}
          />
          <Route
            path="labs"
            element={<DoctorLabPage />}
          />
        </Route>

        {/* ── Health Worker ── */}
        <Route
          path="/health-worker"
          element={
            <ProtectedRoute
              allowedRoles={["healthWorker", "admin"]}
            >
              <DashboardLayout role="healthWorker" />
            </ProtectedRoute>
          }
        >
          <Route index element={<HWDashboard />} />
          <Route
            path="patients"
            element={<HWPatients />}
          />
          <Route
            path="high-risk"
            element={<HWHighRisk />}
          />
          <Route
            path="leaderboard"
            element={<LeaderboardPage />}
          />
        </Route>

        {/* ── Admin ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout role="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route
            path="analytics"
            element={<AdminAnalyticsPage />}
          />
          <Route
            path="users"
            element={<AdminUsers />}
          />
          <Route
            path="alerts"
            element={<AdminAlerts />}
          />
          <Route
            path="heatmap"
            element={<HeatmapPage />}
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
