import React, { useEffect, useState } from "react";
import { ecosystemSteps } from "../data";
import { T } from "../tokens";
import { useReveal, useInView, usePrefersReducedMotion } from "../hooks";
import { SectionLabel, DisplayHeading, SectionShell } from "./ui";

export default function HowItWorksSection() {
  const ref = useReveal();
  const [flowRef, inView] = useInView(0.3);
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    const id = setInterval(() => setActive((s) => (s + 1) % ecosystemSteps.length), 2000);
    return () => clearInterval(id);
  }, [inView, reduced]);

  return (
    <SectionShell alt>
      <div ref={ref} className="rc-reveal">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <SectionLabel>How It Works</SectionLabel>
          <DisplayHeading>One platform. Every input. Every language.</DisplayHeading>
        </div>

        <div ref={flowRef} className="relative">
          {/* Desktop flow */}
          <div className="hidden md:block">
            <div className="relative flex items-start justify-between gap-2">
              <div
                className="absolute left-[8%] right-[8%] top-7 h-px pointer-events-none"
                style={{ background: T.border }}
                aria-hidden="true"
              >
                <div
                  className="h-full origin-left transition-transform duration-700"
                  style={{
                    background: T.teal,
                    transform: `scaleX(${active / (ecosystemSteps.length - 1)})`,
                    boxShadow: `0 0 8px ${T.tealGlow}`,
                  }}
                />
              </div>
              {ecosystemSteps.map((s, i) => {
                const Icon = s.icon;
                const isActive = active === i;
                return (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setActive(i)}
                    className="relative z-10 flex flex-col items-center text-center w-[100px] group"
                  >
                    <span
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all duration-500"
                      style={{
                        background: isActive ? T.teal : i === 2 ? T.tealMid : T.tealSoft,
                        color: isActive || i === 2 ? "#fff" : T.teal,
                        transform: isActive ? "scale(1.08) translateY(-2px)" : "scale(1)",
                        boxShadow: isActive ? `0 10px 28px ${T.tealGlow}` : "none",
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-bold" style={{ color: isActive ? T.teal : T.ink }}>{s.label}</span>
                    <span className="text-[11px] mt-1 leading-snug" style={{ color: T.inkLight }}>{s.sub}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-center text-sm mt-10 max-w-lg mx-auto leading-relaxed" style={{ color: T.inkMid }}>
              {ecosystemSteps[active].label}: {ecosystemSteps[active].sub}. Information flows forward — never trapped in one silo.
            </p>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-0">
            {ecosystemSteps.map((s, i) => {
              const Icon = s.icon;
              const isActive = active === i;
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setActive(i)}
                  className="flex items-center gap-4 w-full text-left py-3"
                >
                  <span
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500"
                    style={{ background: isActive ? T.teal : T.tealSoft, color: isActive ? "#fff" : T.teal }}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold" style={{ color: T.ink }}>{s.label}</span>
                    <span className="block text-xs" style={{ color: T.inkLight }}>{s.sub}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-14">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] mb-6" style={{ color: T.inkLight }}>
            Supported input channels
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {[
              { label: "Text", sub: "Any language" },
              { label: "Voice", sub: "Telegram / web" },
              { label: "PDF", sub: "Blood reports" },
              { label: "Image", sub: "Prescriptions" },
              { label: "IVR", sub: "Basic phones" },
            ].map((t) => (
              <div key={t.label} className="text-center min-w-[72px]">
                <p className="text-sm font-semibold" style={{ color: T.ink }}>{t.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: T.inkLight }}>{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
