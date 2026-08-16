import React, { useState } from "react";
import { userJourneys } from "../data";
import { T } from "../tokens";
import { useReveal } from "../hooks";
import { SectionLabel, DisplayHeading, SectionShell } from "./ui";

export default function JourneysSection() {
  const ref = useReveal();
  const [active, setActive] = useState(0);
  const journey = userJourneys[active];
  const Icon = journey.icon;

  return (
    <SectionShell alt>
      <div ref={ref} className="rc-reveal">
        <SectionLabel>User Journeys</SectionLabel>
        <DisplayHeading>
          Who are you?
        </DisplayHeading>
        <p className="mt-4 text-base max-w-lg" style={{ color: T.inkMid }}>
          Four perspectives of one ecosystem. Choose a role to see how RuralCare AI shows up for them.
        </p>

        <div
          role="tablist"
          aria-label="User roles"
          className="mt-8 flex flex-wrap gap-2"
        >
          {userJourneys.map((u, i) => {
            const UIcon = u.icon;
            const on = active === i;
            return (
              <button
                key={u.id}
                role="tab"
                type="button"
                aria-selected={on}
                onClick={() => setActive(i)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border transition-all duration-400"
                style={{
                  borderColor: on ? u.color : T.border,
                  background: on ? u.color : "transparent",
                  color: on ? "#fff" : T.inkMid,
                }}
              >
                <UIcon className="w-4 h-4" />
                {u.role}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          className="mt-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start"
        >
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: journey.color }}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold" style={{ fontFamily: "Syne, sans-serif", color: T.ink }}>
                {journey.role}
              </h3>
            </div>
            <ol className="space-y-4">
              {journey.steps.map((step, j) => (
                <li key={j} className="flex items-start gap-3">
                  <span
                    className="w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: journey.bg, color: journey.color }}
                  >
                    {j + 1}
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: T.inkMid }}>{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Realistic UI preview — conceptual, based on existing product surfaces */}
          <div
            className="rounded-3xl border overflow-hidden"
            style={{ background: T.surfaceRaised, borderColor: T.border }}
          >
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: T.borderSoft, background: journey.bg }}>
              <p className="text-xs font-bold" style={{ color: journey.color }}>{journey.preview.title}</p>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: T.inkLight }}>Preview</span>
            </div>
            <div className="p-4 space-y-3">
              {journey.preview.lines.map((line) => (
                <div
                  key={line.k}
                  className="flex items-center justify-between gap-4 py-2.5 border-b last:border-0"
                  style={{ borderColor: T.borderSoft }}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: T.inkLight }}>{line.k}</span>
                  <span className="text-sm text-right" style={{ color: T.ink }}>{line.v}</span>
                </div>
              ))}
            </div>
            <p className="px-4 pb-4 text-[11px]" style={{ color: T.inkLight }}>
              Interface concepts reflect existing role dashboards in the platform — not fabricated capabilities.
            </p>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
