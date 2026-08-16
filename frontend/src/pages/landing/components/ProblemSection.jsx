import React, { useState } from "react";
import { problems } from "../data";
import { T } from "../tokens";
import { useReveal } from "../hooks";
import { SectionLabel, DisplayHeading, SectionShell } from "./ui";

export default function ProblemSection() {
  const ref = useReveal();
  const [focus, setFocus] = useState(0);
  const FocusIcon = problems[focus].icon;

  return (
    <SectionShell id="problem" alt>
      <div ref={ref} className="rc-reveal">
        <SectionLabel>The Problem</SectionLabel>
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-start">
          <div>
            <DisplayHeading>
              Rural healthcare is broken in systemic ways
            </DisplayHeading>
            <p className="mt-5 text-base max-w-md leading-relaxed" style={{ color: T.inkMid }}>
              Before explaining what RuralCare AI does, it is important to understand why it needs to exist.
            </p>

            {/* Central problem focus */}
            <div className="mt-10 relative">
              <div
                className="absolute -inset-4 rounded-[2rem] opacity-60 pointer-events-none"
                style={{ background: `radial-gradient(circle at 30% 20%, ${T.tealSoft}, transparent 70%)` }}
              />
              <div className="relative py-6">
                <p
                  className="text-[4.5rem] md:text-[6rem] font-semibold leading-none tabular-nums tracking-tight"
                  style={{ color: T.teal, fontFamily: "Syne, sans-serif", opacity: 0.2 }}
                >
                  {String(focus + 1).padStart(2, "0")}
                </p>
                <div className="flex items-start gap-4 -mt-8 md:-mt-12">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: T.teal, color: "#fff" }}
                  >
                    <FocusIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold" style={{ color: T.ink, fontFamily: "Syne, sans-serif" }}>
                      {problems[focus].title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed max-w-sm" style={{ color: T.inkMid }}>
                      {problems[focus].desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
            {problems.map((p, i) => {
              const Icon = p.icon;
              const active = focus === i;
              return (
                <button
                  key={p.title}
                  type="button"
                  onMouseEnter={() => setFocus(i)}
                  onFocus={() => setFocus(i)}
                  onClick={() => setFocus(i)}
                  className="text-left flex gap-3 py-4 border-b transition-all duration-500 group"
                  style={{
                    borderColor: active ? `${T.teal}55` : T.borderSoft,
                    transform: active ? "translateX(4px)" : "none",
                  }}
                >
                  <span
                    className="text-xs font-bold tabular-nums pt-1 w-6"
                    style={{ color: active ? T.teal : T.inkLight }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: active ? T.teal : T.inkLight }} />
                      <span className="text-sm font-semibold" style={{ color: active ? T.ink : T.inkMid }}>
                        {p.title}
                      </span>
                    </span>
                    <span
                      className="block text-xs mt-1.5 leading-relaxed transition-opacity duration-500"
                      style={{ color: T.inkLight, opacity: active ? 1 : 0.65 }}
                    >
                      {p.desc}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
