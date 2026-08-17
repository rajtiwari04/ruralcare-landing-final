import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationPanel from "../components/dashboard/NotificationPanel";
import { T } from "../design/tokens";
import {
  LayoutDashboard, MessageCircle, Activity, FileText, Calendar,
  User, Users, AlertTriangle, LogOut, Menu, X,
  Heart, ClipboardList, Baby, Leaf, Shield, Trophy,
  TestTube2, Map, Pill, Brain, Star, BarChart2,
} from "lucide-react";

const NAV = {
  patient: [
    { to: "/patient", icon: LayoutDashboard, label: "Home", s: "main", mobile: true },
    { to: "/patient/chat", icon: MessageCircle, label: "AI Assistant", s: "main", mobile: true },
    { to: "/patient/appointments", icon: Calendar, label: "Appointments", s: "main", mobile: true },
    { to: "/patient/history", icon: ClipboardList, label: "Timeline", s: "main" },
    { to: "/patient/reports", icon: FileText, label: "Reports", s: "main", mobile: true },
    { to: "/patient/symptoms", icon: Activity, label: "Symptoms", s: "main" },
    { to: "/patient/prescriptions", icon: Pill, label: "Prescriptions", s: "main", mobile: true },
    { to: "/patient/insights", icon: Brain, label: "AI Insights", s: "tools" },
    { to: "/patient/lab-tests", icon: TestTube2, label: "Lab Tests", s: "tools" },
    { to: "/patient/maternal", icon: Baby, label: "Maternal & Child", s: "tools" },
    { to: "/patient/nutrition", icon: Leaf, label: "Nutrition", s: "tools" },
    { to: "/patient/schemes", icon: Shield, label: "Govt Schemes", s: "tools" },
    { to: "/patient/leaderboard", icon: Trophy, label: "Leaderboard", s: "tools" },
    { to: "/patient/feedback", icon: Star, label: "Feedback", s: "tools" },
    { to: "/patient/profile", icon: User, label: "Profile", s: "account", mobile: true },
  ],
  doctor: [
    { to: "/doctor", icon: LayoutDashboard, label: "Dashboard", s: "main", mobile: true },
    { to: "/doctor/patients", icon: Users, label: "Patients", s: "main", mobile: true },
    { to: "/doctor/appointments", icon: Calendar, label: "Appointments", s: "main", mobile: true },
    { to: "/doctor/prescriptions", icon: Pill, label: "Prescriptions", s: "main", mobile: true },
    { to: "/doctor/lab", icon: TestTube2, label: "Lab Tests", s: "main" },
  ],
  healthWorker: [
    { to: "/health-worker", icon: LayoutDashboard, label: "Dashboard", s: "main", mobile: true },
    { to: "/health-worker/patients", icon: Users, label: "My Patients", s: "main", mobile: true },
    { to: "/health-worker/high-risk", icon: AlertTriangle, label: "High Risk", s: "main", mobile: true },
    { to: "/health-worker/leaderboard", icon: Trophy, label: "Leaderboard", s: "main", mobile: true },
  ],
  admin: [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", s: "main", mobile: true },
    { to: "/admin/analytics", icon: BarChart2, label: "Analytics", s: "main", mobile: true },
    { to: "/admin/users", icon: Users, label: "Users", s: "main", mobile: true },
    { to: "/admin/alerts", icon: AlertTriangle, label: "Disease Alerts", s: "main" },
    { to: "/admin/heatmap", icon: Map, label: "Heatmap", s: "main", mobile: true },
  ],
};

const ROLE_LABELS = {
  patient: "Patient Care",
  doctor: "Clinical Workspace",
  healthWorker: "Community Care",
  admin: "Administration",
};

const SECTION_LABELS = { main: null, tools: "Health Tools", account: "Account" };

const PAGE_TITLES = {
  "/patient": "Home",
  "/patient/chat": "AI Health Assistant",
  "/patient/symptoms": "Symptoms",
  "/patient/reports": "Reports",
  "/patient/history": "Health Timeline",
  "/patient/appointments": "Appointments",
  "/patient/prescriptions": "Prescriptions",
  "/patient/insights": "AI Insights",
  "/patient/lab-tests": "Lab Tests",
  "/patient/maternal": "Maternal & Child",
  "/patient/nutrition": "Nutrition",
  "/patient/schemes": "Government Schemes",
  "/patient/leaderboard": "Leaderboard",
  "/patient/feedback": "Feedback",
  "/patient/profile": "Profile",
  "/doctor": "Clinical Overview",
  "/doctor/patients": "Patients",
  "/doctor/appointments": "Appointments",
  "/doctor/prescriptions": "Prescriptions",
  "/doctor/lab": "Lab Tests",
  "/doctor/labs": "Lab Tests",
  "/health-worker": "Field Overview",
  "/health-worker/patients": "My Patients",
  "/health-worker/high-risk": "High-Risk Patients",
  "/health-worker/leaderboard": "Leaderboard",
  "/admin": "Admin Overview",
  "/admin/analytics": "Analytics",
  "/admin/users": "Users",
  "/admin/alerts": "Disease Alerts",
  "/admin/heatmap": "Heatmap",
};

function titleForPath(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/doctor/patients/")) return "Patient Detail";
  const match = Object.keys(PAGE_TITLES).find((k) => pathname.startsWith(k) && k !== "/");
  return match ? PAGE_TITLES[match] : "RuralCare AI";
}

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const items = NAV[role] || [];
  const sections = [...new Set(items.map((n) => n.s))];
  const mobileItems = items.filter((n) => n.mobile).slice(0, 5);
  const pageTitle = titleForPath(location.pathname);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const doLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 mb-0.5 ${
      isActive ? "shadow-sm" : ""
    }`;

  const linkStyle = (isActive) => ({
    background: isActive ? T.tealSoft : "transparent",
    color: isActive ? T.teal : T.inkMid,
    boxShadow: isActive ? `inset 3px 0 0 ${T.teal}` : "none",
  });

  const Sidebar = () => (
    <aside
      className="flex flex-col h-full w-full"
      style={{ background: T.surfaceRaised, borderRight: `1px solid ${T.border}` }}
    >
      <div className="px-4 py-4" style={{ borderBottom: `1px solid ${T.borderSoft}` }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: T.teal }}
          >
            <Heart className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-none truncate" style={{ color: T.ink, fontFamily: "Syne, sans-serif" }}>
              RuralCare AI
            </p>
            <p className="text-[11px] mt-1 truncate" style={{ color: T.inkLight }}>
              {ROLE_LABELS[role]}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Primary">
        {sections.map((s) => {
          const sItems = items.filter((n) => n.s === s);
          const label = SECTION_LABELS[s];
          return (
            <div key={s} className="mb-2">
              {label && (
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.16em] px-3 pt-3 pb-1.5"
                  style={{ color: T.inkLight }}
                >
                  {label}
                </p>
              )}
              {sItems.map(({ to, icon: Icon, label: lbl }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === `/${role}` || to === "/health-worker" || to === "/patient" || to === "/doctor" || to === "/admin"}
                  onClick={() => setOpen(false)}
                  className={linkClass}
                  style={({ isActive }) => linkStyle(isActive)}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{lbl}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="p-3" style={{ borderTop: `1px solid ${T.borderSoft}` }}>
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
            style={{ background: T.tealSoft, color: T.teal }}
          >
            {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate leading-tight" style={{ color: T.ink }}>
              {user?.fullName}
            </p>
            <p className="text-[11px] truncate" style={{ color: T.inkLight }}>{user?.phone}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={doLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl w-full text-sm font-medium transition-colors"
          style={{ color: T.danger }}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: T.bg }}>
      <div className="hidden md:flex flex-col w-60 lg:w-64 shrink-0">
        <Sidebar />
      </div>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[min(100%,280px)] z-50 shadow-2xl">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header
          className="flex items-center justify-between gap-3 px-4 md:px-6 h-14 shrink-0"
          style={{
            background: "rgba(251,250,247,0.9)",
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="md:hidden p-2 rounded-xl border"
              style={{ borderColor: T.border, color: T.ink }}
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] hidden sm:block" style={{ color: T.inkLight }}>
                RuralCare AI
              </p>
              <h1 className="text-sm md:text-base font-semibold truncate" style={{ color: T.ink, fontFamily: "Syne, sans-serif" }}>
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationPanel />
            <div
              className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border"
              style={{ borderColor: T.border, background: T.surfaceRaised }}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                style={{ background: T.tealSoft, color: T.teal }}
              >
                {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
              </span>
              <span className="text-xs font-medium max-w-[120px] truncate" style={{ color: T.inkMid }}>
                {user?.fullName?.split(" ")[0]}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav
          className="md:hidden fixed bottom-0 inset-x-0 z-30 flex items-stretch justify-around px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] border-t"
          style={{
            background: "rgba(251,250,247,0.96)",
            backdropFilter: "blur(12px)",
            borderColor: T.border,
          }}
          aria-label="Mobile"
        >
          {mobileItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === `/${role}` || to === "/health-worker" || to === "/patient" || to === "/doctor" || to === "/admin"}
              className="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 min-w-0 flex-1 rounded-xl"
              style={({ isActive }) => ({ color: isActive ? T.teal : T.inkLight })}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold truncate max-w-full">{label.split(" ")[0]}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
