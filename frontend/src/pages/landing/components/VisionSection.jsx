import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { visionTransforms } from "../data";
import { T } from "../tokens";
import { useReveal, useInView, usePrefersReducedMotion } from "../hooks";
import { SectionLabel, DisplayHeading, SectionShell } from "./ui";
import HealthNetwork from "../visuals/HealthNetwork";

const STAGES = ["fragmented", "connected", "intelligent", "human"];

export default function VisionSection() {
  const ref = useReveal();
  const [stageRef, inView] = useInView(0.35);
  const reduced = usePrefersReducedMotion();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    const id = setInterval(() => setStage((s) => (s + 1) % STAGES.length), 2200);
    return () => clearInterval(id);
  }, [inView, reduced]);

  return (
    <SectionShell id="vision">
      <div ref={ref} className="rc-reveal">
        <SectionLabel>The Vision</SectionLabel>
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          <div>
            <DisplayHeading>
              Technology should make healthcare feel more{" "}
              <span style={{ color: T.teal }}>human</span>, not less.
            </DisplayHeading>
            <p className="mt-6 leading-relaxed" style={{ color: T.inkMid }}>
              RuralCare AI is not designed to replace doctors. It is designed to make every interaction with healthcare —
              whether with a doctor, a community health worker, or a hospital — more informed, more efficient, and more accessible.
            </p>
            <p className="mt-4 leading-relaxed" style={{ color: T.inkMid }}>
              When a patient can describe symptoms in Bhojpuri and receive guidance in Bhojpuri, when an ASHA worker knows
              which of her 80 patients needs a follow-up today, when a doctor arrives already knowing the history —
              healthcare becomes more human.
            </p>

            <div ref={stageRef} className="mt-10">
              <div className="flex flex-wrap gap-2 mb-4">
                {STAGES.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStage(i)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border transition-all duration-500"
                    style={{
                      borderColor: stage === i ? T.teal : T.border,
                      background: stage === i ? T.teal : "transparent",
                      color: stage === i ? "#fff" : T.inkLight,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div
                className="rounded-3xl border overflow-hidden transition-opacity duration-700"
                style={{
                  borderColor: T.border,
                  background: T.bgAlt,
                  opacity: 0.55 + stage * 0.15,
                }}
              >
                <HealthNetwork height={160} />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            {visionTransforms.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 py-4 border-b"
                style={{ borderColor: T.borderSoft }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: T.tealSoft }}
                >
                  <ArrowRight className="w-3.5 h-3.5" style={{ color: T.teal }} />
                </div>
                <div>
                  <p className="text-xs line-through" style={{ color: T.inkLight }}>{item.from}</p>
                  <p className="text-sm font-semibold mt-1" style={{ color: T.ink }}>{item.to}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
