import React, { useState } from "react";
import { Check, Clock } from "lucide-react";
import { roadmap } from "../data";
import { T } from "../tokens";
import { useReveal } from "../hooks";
import { SectionLabel, DisplayHeading, SectionShell } from "./ui";

export default function RoadmapSection() {
  const ref = useReveal();
  const [active, setActive] = useState(2);
  const phase = roadmap[active];

  return (
    <SectionShell id="roadmap" alt>
      <div ref={ref} className="rc-reveal">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <SectionLabel>Roadmap</SectionLabel>
            <DisplayHeading>From now to the future</DisplayHeading>
            <p className="mt-3 max-w-lg" style={{ color: T.inkMid }}>
              The first three phases are shipped. Two more phases remain ahead.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{ background: T.teal }}>
              <Check className="w-3 h-3" /> Shipped
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border" style={{ borderColor: T.border, color: T.inkLight }}>
              <Clock className="w-3 h-3" /> Upcoming
            </span>
          </div>
        </div>

        {/* Timeline path */}
        <div className="relative pt-2 pb-8">
          <div className="hidden sm:block absolute left-0 right-0 top-[22px] h-px" style={{ background: T.border }} />
          <div
            className="hidden sm:block absolute left-0 top-[22px] h-px transition-all duration-700"
            style={{
              background: `linear-gradient(90deg, ${T.teal}, ${T.tealMid})`,
              width: `${(active / (roadmap.length - 1)) * 100}%`,
              boxShadow: `0 0 12px ${T.tealGlow}`,
            }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-2">
            {roadmap.map((r, i) => {
              const on = active === i;
              return (
                <button
                  key={r.phase}
                  type="button"
                  onClick={() => setActive(i)}
                  className="relative text-left sm:text-center group"
                >
                  <span
                    className="relative z-10 inline-flex w-3.5 h-3.5 rounded-full border-2 mb-3 transition-all duration-500"
                    style={{
                      background: on || r.done ? T.teal : T.surface,
                      borderColor: on ? T.tealMid : r.done ? T.teal : T.border,
                      boxShadow: on ? `0 0 0 6px ${T.tealGlow}` : "none",
                      transform: on ? "scale(1.25)" : "scale(1)",
                    }}
                  />
                  <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: T.inkLight }}>
                    {r.phase}
                  </span>
                  <span className="block text-sm font-semibold mt-0.5" style={{ color: on ? T.teal : T.ink }}>
                    {r.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="rounded-3xl border p-6 md:p-8 transition-all duration-500"
          style={{ borderColor: `${T.teal}33`, background: T.surface }}
        >
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
              style={{
                background: phase.done ? T.teal : "transparent",
                border: phase.done ? "none" : `1px solid ${T.border}`,
                color: phase.done ? "#fff" : T.inkLight,
              }}
            >
              {phase.done ? <><Check className="w-3 h-3" />Shipped</> : <><Clock className="w-3 h-3" />Upcoming</>}
            </span>
            <h3 className="text-lg font-semibold" style={{ fontFamily: "Syne, sans-serif", color: T.ink }}>
              {phase.phase} · {phase.label}
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {phase.items.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2.5 py-2"
              >
                {phase.done
                  ? <Check className="w-3.5 h-3.5 shrink-0" style={{ color: T.teal }} />
                  : <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: T.inkLight }} />}
                <p className="text-sm" style={{ color: T.inkMid }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
