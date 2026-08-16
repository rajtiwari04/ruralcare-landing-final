import React, { useState, useCallback, lazy, Suspense } from "react";
import { featureGroups } from "../data";
import { T } from "../tokens";
import { useReveal } from "../hooks";
import { SectionLabel, DisplayHeading, SectionShell, Badge } from "./ui";

const FeatureVisualizer = lazy(() => import("../visuals/FeatureVisualizer"));

export default function FeaturesSection() {
  const ref = useReveal();
  const [active, setActive] = useState("ai");
  const [fading, setFading] = useState(false);
  const group = featureGroups.find((g) => g.id === active);

  const switchFeature = useCallback((id) => {
    if (id === active) return;
    setFading(true);
    window.setTimeout(() => {
      setActive(id);
      setFading(false);
    }, 160);
  }, [active]);

  return (
    <SectionShell id="features">
      <div ref={ref} className="rc-reveal">
        <SectionLabel>Capabilities</SectionLabel>
        <DisplayHeading>Eight capability areas — built with honesty about status</DisplayHeading>
        <p className="mt-4 text-base max-w-xl" style={{ color: T.inkMid }}>
          Select a capability. See what is available, in development, or planned — no inflated claims.
        </p>

        <div className="mt-10 grid lg:grid-cols-[240px_1fr] gap-8 items-start">
          <div
            role="tablist"
            aria-label="Capability areas"
            className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 -mx-1 px-1"
          >
            {featureGroups.map((g) => {
              const Icon = g.icon;
              const isActive = active === g.id;
              return (
                <button
                  key={g.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  id={`feat-tab-${g.id}`}
                  onClick={() => switchFeature(g.id)}
                  className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-left whitespace-nowrap lg:whitespace-normal transition-all duration-400 shrink-0"
                  style={{
                    background: isActive ? T.tealSoft : "transparent",
                    color: isActive ? T.teal : T.inkMid,
                    boxShadow: isActive ? `inset 3px 0 0 ${T.teal}` : "none",
                  }}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-semibold">{g.title.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          {group && (
            <div
              role="tabpanel"
              aria-labelledby={`feat-tab-${group.id}`}
              className="grid md:grid-cols-[1fr_0.9fr] gap-6 transition-opacity duration-300"
              style={{ opacity: fading ? 0 : 1 }}
            >
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: group.color }}
                  >
                    <group.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg" style={{ color: T.ink, fontFamily: "Syne, sans-serif" }}>
                      {group.title}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: T.inkMid }}>{group.blurb}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  <Badge type="available" />
                  <Badge type="development" />
                  <Badge type="planned" />
                </div>

                <ul className="space-y-2">
                  {group.features.map((f) => (
                    <li
                      key={f.name}
                      className="flex items-center justify-between gap-3 py-2.5 border-b"
                      style={{ borderColor: T.borderSoft }}
                    >
                      <span className="text-sm" style={{ color: T.ink }}>{f.name}</span>
                      <Badge type={f.status} />
                    </li>
                  ))}
                </ul>
              </div>

              <Suspense fallback={<div className="min-h-[280px] rounded-3xl" style={{ background: T.tealSoft }} />}>
                <FeatureVisualizer featureId={active} />
              </Suspense>
            </div>
          )}
        </div>
      </div>
    </SectionShell>
  );
}
