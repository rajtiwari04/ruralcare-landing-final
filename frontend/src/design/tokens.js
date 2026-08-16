/** Shared RuralCare AI product design tokens (landing + authenticated) */
export const T = {
  bg: "#F7F5F0",
  bgAlt: "#EFECE6",
  surface: "#FBFAF7",
  surfaceRaised: "#FFFFFF",
  teal: "#0D5C50",
  tealMid: "#17806E",
  tealSoft: "#E6F3F0",
  tealGlow: "rgba(13, 92, 80, 0.14)",
  ink: "#14141F",
  inkMid: "#4A4A5C",
  inkLight: "#8A8A9A",
  accent: "#B45309",
  accentSoft: "#FEF6EE",
  border: "#E2DED6",
  borderSoft: "#EBE7DF",
  danger: "#B91C1C",
  warn: "#D97706",
  success: "#15803D",
};

export const MOTION = {
  ease: "cubic-bezier(0.22, 1, 0.36, 1)",
  fast: "400ms",
  base: "650ms",
  slow: "900ms",
};

export function greetingForHour(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function formatShortDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isSameDay(a, b = new Date()) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
