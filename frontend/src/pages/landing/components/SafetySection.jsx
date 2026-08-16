import React from "react";
import { safetyPrinciples } from "../data";
import { T } from "../tokens";
import { useReveal } from "../hooks";
import { SectionLabel, DisplayHeading, SectionShell } from "./ui";

export default function SafetySection() {
  const ref = useReveal();

  return (
    <SectionShell>
      <div ref={ref} className="rc-reveal">
        <SectionLabel>Responsible AI</SectionLabel>
        <DisplayHeading>Privacy, safety, and medical responsibility</DisplayHeading>
        <p className="mt-4 text-base max-w-xl" style={{ color: T.inkMid }}>
          Healthcare AI requires an especially high standard of responsibility. These principles are built into RuralCare AI by design.
        </p>

        <div className="mt-12 grid sm:grid-cols-2 gap-x-10 gap-y-8">
          {safetyPrinciples.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="flex gap-4">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: s.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: T.ink }}>{s.title}</h3>
                  <p className="text-sm mt-1.5 leading-relaxed" style={{ color: T.inkMid }}>{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
