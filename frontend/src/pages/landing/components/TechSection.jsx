import React, { useState } from "react";
import { techStack } from "../data";
import { T } from "../tokens";
import { useReveal } from "../hooks";
import { SectionLabel, DisplayHeading, SectionShell } from "./ui";

const LAYERS = ["Interface", "API", "Data", "Intelligence", "Care", "Access"];

export default function TechSection() {
  const ref = useReveal();
  const [layer, setLayer] = useState(null);

  return (
    <SectionShell id="technology" alt>
      <div ref={ref} className="rc-reveal">
        <SectionLabel>How It Is Built</SectionLabel>
        <DisplayHeading>Purpose-built for rural healthcare</DisplayHeading>
        <p className="mt-4 max-w-xl" style={{ color: T.inkMid }}>
          Every technology choice solves a real problem for rural healthcare users. The stack supports the mission — not the other way around.
        </p>

        {/* Architecture diagram */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="text-center">
            <div
              className="inline-flex px-5 py-2.5 rounded-full text-sm font-bold text-white"
              style={{ background: T.teal, fontFamily: "Syne, sans-serif" }}
            >
              RuralCare AI
            </div>
            <div className="mx-auto w-px h-8" style={{ background: T.border }} />
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              {["Patients", "Doctors", "Community"].map((n) => (
                <div
                  key={n}
                  className="py-2.5 rounded-2xl border text-xs font-semibold text-center"
                  style={{ borderColor: T.border, background: T.surface, color: T.ink }}
                >
                  {n}
                </div>
              ))}
            </div>
            <div className="mx-auto w-px h-8" style={{ background: T.border }} />
            <div
              className="inline-flex px-4 py-2 rounded-2xl text-xs font-bold border"
              style={{ borderColor: `${T.teal}44`, background: T.tealSoft, color: T.teal }}
            >
              AI Intelligence
            </div>
            <div className="mx-auto w-px h-6" style={{ background: T.border }} />
            <p className="text-xs" style={{ color: T.inkLight }}>Data + Voice + Reports → Healthcare outcomes</p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-2 justify-center">
          <button
            type="button"
            onClick={() => setLayer(null)}
            className="px-3 py-1.5 rounded-full text-[11px] font-semibold border"
            style={{
              borderColor: layer === null ? T.teal : T.border,
              background: layer === null ? T.teal : "transparent",
              color: layer === null ? "#fff" : T.inkLight,
            }}
          >
            All layers
          </button>
          {LAYERS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLayer(l)}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold border"
              style={{
                borderColor: layer === l ? T.teal : T.border,
                background: layer === l ? T.teal : "transparent",
                color: layer === l ? "#fff" : T.inkLight,
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-3xl overflow-hidden border" style={{ borderColor: T.border, background: T.border }}>
          {techStack
            .filter((t) => !layer || t.layer === layer)
            .map((t) => (
              <div
                key={t.name}
                className="p-5 transition-colors duration-300"
                style={{ background: T.surface }}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: T.teal }}>
                  {t.layer}
                </p>
                <p className="font-semibold text-sm" style={{ color: T.ink }}>{t.name}</p>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: T.inkMid }}>{t.role}</p>
              </div>
            ))}
        </div>
      </div>
    </SectionShell>
  );
}
