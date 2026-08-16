import React from "react";
import { Check } from "lucide-react";
import { T } from "../tokens";
import { useReveal, useInView, usePrefersReducedMotion } from "../hooks";
import { SectionLabel, DisplayHeading, SectionShell } from "./ui";

const DISTRICTS = [
  { name: "Varanasi", x: 62, y: 48, risk: 0.92 },
  { name: "Gorakhpur", x: 72, y: 38, risk: 0.7 },
  { name: "Lucknow", x: 52, y: 36, risk: 0.45 },
  { name: "Kanpur", x: 46, y: 44, risk: 0.35 },
  { name: "Prayagraj", x: 55, y: 55, risk: 0.55 },
  { name: "Agra", x: 38, y: 42, risk: 0.25 },
  { name: "Meerut", x: 34, y: 28, risk: 0.3 },
  { name: "Bareilly", x: 48, y: 26, risk: 0.4 },
];

function riskColor(v) {
  if (v > 0.75) return "#B91C1C";
  if (v > 0.5) return "#D97706";
  if (v > 0.35) return "#CA8A04";
  return T.tealMid;
}

export default function CommunitySection() {
  const ref = useReveal();
  const [mapRef, inView] = useInView(0.25);
  const reduced = usePrefersReducedMotion();

  return (
    <SectionShell>
      <div ref={ref} className="rc-reveal">
        <SectionLabel>Community Intelligence</SectionLabel>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <DisplayHeading>
              Disease clusters detected before they become outbreaks
            </DisplayHeading>
            <p className="mt-5 leading-relaxed" style={{ color: T.inkMid }}>
              When multiple patients from the same village report similar symptoms within a short period,
              RuralCare AI’s surveillance engine analyzes anonymized regional patterns and generates an early-warning alert.
            </p>

            <div
              className="mt-6 pl-4 border-l-2 py-1"
              style={{ borderColor: T.accent }}
            >
              <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: T.accent }}>
                Important note
              </p>
              <p className="text-sm leading-relaxed" style={{ color: T.inkMid }}>
                RuralCare AI provides early-warning signals based on symptom patterns. It does not replace official
                epidemiological confirmation by public health authorities.
              </p>
            </div>

            <ul className="mt-8 space-y-3">
              {[
                "14-day rolling symptom trend analysis per district",
                "AI epidemic probability prediction (low / medium / high)",
                "Seasonal factor weighting (monsoon, winter, summer)",
                "Telegram outbreak alert to health workers in affected areas",
                "Preventive guidance in local language for at-risk patients",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: T.tealSoft }}
                  >
                    <Check className="w-3 h-3" style={{ color: T.teal }} />
                  </span>
                  <span className="text-sm leading-relaxed" style={{ color: T.inkMid }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Command-center intelligence map */}
          <div
            ref={mapRef}
            className="rounded-3xl border overflow-hidden"
            style={{ background: T.bgAlt, borderColor: T.border }}
          >
            <div className="px-5 pt-5 pb-2 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: T.inkLight }}>
                  District command view
                </p>
                <p className="text-xs mt-1" style={{ color: T.inkLight }}>Demo data — anonymized patterns</p>
              </div>
              <div className="flex gap-3">
                {[["High", "#B91C1C"], ["Med", "#D97706"], ["Low", T.tealMid]].map(([l, c]) => (
                  <span key={l} className="flex items-center gap-1.5 text-[10px]" style={{ color: T.inkLight }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                    {l}
                  </span>
                ))}
              </div>
            </div>

            <svg viewBox="0 0 100 78" className="w-full px-2" aria-hidden="true">
              {/* Abstract UP-like region silhouette */}
              <path
                d="M22 22 C28 12 40 10 50 14 C62 18 74 16 82 24 C90 34 88 48 82 58 C74 68 58 72 44 70 C30 68 18 58 16 44 C14 32 16 26 22 22 Z"
                fill={T.surface}
                stroke={T.border}
                strokeWidth="0.4"
              />
              {/* Connection lines between elevated districts */}
              <line x1="62" y1="48" x2="72" y2="38" stroke={T.accent} strokeWidth="0.25" opacity="0.5" />
              <line x1="62" y1="48" x2="55" y2="55" stroke={T.accent} strokeWidth="0.25" opacity="0.4" />
              {DISTRICTS.map((d) => (
                <g key={d.name}>
                  {(inView && !reduced && d.risk > 0.7) && (
                    <circle cx={d.x} cy={d.y} r="4.5" fill={riskColor(d.risk)} opacity="0.2">
                      <animate attributeName="r" values="3;6;3" dur="2.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.25;0.08;0.25" dur="2.8s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle cx={d.x} cy={d.y} r={1.2 + d.risk} fill={riskColor(d.risk)} opacity={0.55 + d.risk * 0.35} />
                  <text x={d.x} y={d.y - 3.2} textAnchor="middle" fontSize="2.2" fill={T.inkMid} fontFamily="Manrope,sans-serif" fontWeight="600">
                    {d.name}
                  </text>
                </g>
              ))}
            </svg>

            <div className="m-4 p-4 rounded-2xl border" style={{ background: T.accentSoft, borderColor: "#F5C0AC" }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full rc-pulse-soft" style={{ background: T.accent }} />
                <p className="text-xs font-bold" style={{ color: T.accent }}>Early Warning · Varanasi District</p>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: T.inkMid }}>
                9 fever + cough reports in 3 days · AI prediction: Medium dengue risk · Telegram alert sent to 2 health workers
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
