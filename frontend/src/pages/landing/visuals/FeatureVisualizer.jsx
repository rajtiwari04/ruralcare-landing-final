import React, { useEffect, useRef } from "react";
import { T } from "../tokens";
import { useInView, usePrefersReducedMotion } from "../hooks";

/** Lightweight per-feature visualization panels */
export default function FeatureVisualizer({ featureId }) {
  const [ref, inView] = useInView(0.25);
  const reduced = usePrefersReducedMotion();

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-3xl border h-full min-h-[280px]"
      style={{
        background: `linear-gradient(160deg, ${T.surface} 0%, ${T.tealSoft} 100%)`,
        borderColor: T.border,
      }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `radial-gradient(circle at 20% 20%, ${T.tealGlow}, transparent 40%), radial-gradient(circle at 80% 70%, rgba(180,83,9,0.08), transparent 35%)`,
      }} />
      <div className="relative h-full p-5 flex items-center justify-center">
        {featureId === "voice" && <VoiceViz active={inView && !reduced} />}
        {featureId === "reports" && <ReportViz active={inView && !reduced} />}
        {featureId === "doctor" && <DoctorViz />}
        {featureId === "community" && <CommunityViz active={inView && !reduced} />}
        {featureId === "telegram" && <TelegramViz />}
        {featureId === "personal" && <PersonalViz active={inView && !reduced} />}
        {featureId === "worker" && <WorkerViz />}
        {(featureId === "ai" || !featureId) && <NeuralViz active={inView && !reduced} />}
      </div>
    </div>
  );
}

function NeuralViz({ active }) {
  return (
    <svg viewBox="0 0 320 240" className="w-full max-w-sm">
      {[
        [60, 60], [60, 120], [60, 180],
        [160, 80], [160, 160],
        [260, 70], [260, 130], [260, 190],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 3 || i === 4 ? 7 : 5} fill={T.teal} opacity={0.35 + (i % 3) * 0.15}>
          {active && (
            <animate attributeName="opacity" values="0.35;0.85;0.35" dur={`${2.4 + (i % 3) * 0.4}s`} repeatCount="indefinite" />
          )}
        </circle>
      ))}
      {[
        [60, 60, 160, 80], [60, 120, 160, 80], [60, 120, 160, 160], [60, 180, 160, 160],
        [160, 80, 260, 70], [160, 80, 260, 130], [160, 160, 260, 130], [160, 160, 260, 190],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={T.teal} strokeWidth="1" opacity="0.25" />
      ))}
      <text x="160" y="30" textAnchor="middle" fontSize="11" fill={T.inkMid} fontFamily="Manrope,sans-serif" fontWeight="600">
        Neural healthcare intelligence
      </text>
    </svg>
  );
}

function VoiceViz({ active }) {
  const bars = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="w-full max-w-sm">
      <p className="text-center text-xs font-semibold mb-6" style={{ color: T.inkMid }}>Voice intelligence</p>
      <div className="flex items-end justify-center gap-1.5 h-28">
        {bars.map((i) => (
          <div
            key={i}
            className="w-1.5 rounded-full origin-bottom"
            style={{
              background: T.teal,
              opacity: 0.35 + (i % 5) * 0.1,
              height: `${28 + Math.sin(i * 0.7) * 22 + (i % 4) * 8}%`,
              animation: active ? `rc-wave ${0.9 + (i % 5) * 0.12}s ease-in-out ${i * 0.04}s infinite alternate` : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ReportViz({ active }) {
  return (
    <div className="w-full max-w-xs rounded-2xl border bg-white/80 p-4" style={{ borderColor: T.border }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold" style={{ color: T.ink }}>CBC Report</p>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: T.tealSoft, color: T.teal }}>
          Scanning
        </span>
      </div>
      {["Hemoglobin", "WBC", "Platelets", "Glucose"].map((row, i) => (
        <div key={row} className="flex items-center gap-3 mb-2.5">
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: T.bgAlt }}>
            <div
              className="h-full rounded-full"
              style={{
                width: active ? `${55 + i * 10}%` : "30%",
                background: i === 2 ? T.accent : T.teal,
                transition: "width 900ms cubic-bezier(0.22,1,0.36,1)",
                transitionDelay: `${i * 120}ms`,
              }}
            />
          </div>
          <span className="text-[10px] w-16" style={{ color: T.inkLight }}>{row}</span>
        </div>
      ))}
      <p className="text-[11px] mt-3 leading-relaxed" style={{ color: T.inkMid }}>
        Values explained in the patient’s preferred language.
      </p>
    </div>
  );
}

function DoctorViz() {
  return (
    <div className="w-full max-w-xs rounded-2xl border bg-white/85 p-4 space-y-3" style={{ borderColor: T.border }}>
      <p className="text-xs font-bold" style={{ color: T.ink }}>Clinical briefing</p>
      {["Patient summary ready", "Abnormals flagged", "SOAP notes draft"].map((t, i) => (
        <div key={t} className="flex items-center gap-2 text-xs" style={{ color: T.inkMid }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.teal, opacity: 1 - i * 0.2 }} />
          {t}
        </div>
      ))}
      <div className="h-16 rounded-xl border border-dashed flex items-center justify-center text-[11px]" style={{ borderColor: T.border, color: T.inkLight }}>
        Prescription PDF preview
      </div>
    </div>
  );
}

function CommunityViz({ active }) {
  const cells = [0.2, 0.5, 0.9, 0.3, 0.7, 0.4, 0.15, 1, 0.55, 0.25, 0.8, 0.35, 0.45, 0.2, 0.6, 0.3];
  const color = (v) => (v > 0.75 ? "#B91C1C" : v > 0.45 ? "#D97706" : v > 0.25 ? "#CA8A04" : T.tealSoft);
  return (
    <div className="w-full max-w-xs">
      <p className="text-center text-xs font-semibold mb-4" style={{ color: T.inkMid }}>Geographic intelligence</p>
      <div className="grid grid-cols-4 gap-1.5">
        {cells.map((v, i) => (
          <div
            key={i}
            className="aspect-square rounded-md"
            style={{
              background: color(v),
              opacity: 0.55 + v * 0.4,
              animation: active && v > 0.75 ? "rc-pulse-soft 2.8s ease-in-out infinite" : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function TelegramViz() {
  return (
    <div className="w-full max-w-xs space-y-2">
      {[
        { side: "left", text: "बुखार और खांसी है" },
        { side: "right", text: "Symptoms understood. Risk: medium. Hydration + rest guidance sent." },
        { side: "left", text: "📎 blood_report.jpg" },
      ].map((m, i) => (
        <div
          key={i}
          className={`max-w-[85%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed ${m.side === "right" ? "ml-auto" : ""}`}
          style={{
            background: m.side === "right" ? T.teal : "#fff",
            color: m.side === "right" ? "#fff" : T.inkMid,
            border: m.side === "left" ? `1px solid ${T.border}` : "none",
          }}
        >
          {m.text}
        </div>
      ))}
    </div>
  );
}

function PersonalViz({ active }) {
  const pathRef = useRef(null);
  useEffect(() => {
    const path = pathRef.current;
    if (!path || !active) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(len);
    requestAnimationFrame(() => {
      path.style.transition = "stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1)";
      path.style.strokeDashoffset = "0";
    });
  }, [active]);
  return (
    <svg viewBox="0 0 280 160" className="w-full max-w-sm">
      <path ref={pathRef} d="M20 110 C60 100 80 40 120 70 C150 92 170 120 200 60 C220 30 250 50 265 40" fill="none" stroke={T.teal} strokeWidth="2" strokeLinecap="round" />
      <circle cx="265" cy="40" r="4" fill={T.teal} />
      <text x="140" y="150" textAnchor="middle" fontSize="11" fill={T.inkMid} fontFamily="Manrope,sans-serif">Health timeline</text>
    </svg>
  );
}

function WorkerViz() {
  return (
    <div className="w-full max-w-xs rounded-2xl border bg-white/85 p-4" style={{ borderColor: T.border }}>
      <p className="text-xs font-bold mb-3" style={{ color: T.ink }}>Village priorities</p>
      {[
        { name: "High risk follow-ups", n: 4 },
        { name: "ANC due", n: 2 },
        { name: "New registrations", n: 1 },
      ].map((r) => (
        <div key={r.name} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: T.borderSoft }}>
          <span className="text-xs" style={{ color: T.inkMid }}>{r.name}</span>
          <span className="text-xs font-bold tabular-nums" style={{ color: T.teal }}>{r.n}</span>
        </div>
      ))}
    </div>
  );
}
