import React, { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { T } from "../tokens";
import { useReveal, useIsMobile, usePrefersReducedMotion, useParallax } from "../hooks";

const IntelligenceCore = lazy(() => import("../visuals/IntelligenceCore"));

export default function HeroSection() {
  const ref = useReveal();
  const mobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const parallax = useParallax(!mobile && !reduced);

  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 55% at 72% 18%, rgba(13,92,80,0.11), transparent 55%),
            radial-gradient(ellipse 45% 35% at 12% 78%, rgba(180,83,9,0.045), transparent 50%),
            linear-gradient(180deg, ${T.bg} 0%, ${T.surface} 48%, ${T.bgAlt} 100%)
          `,
          transform: `translate3d(${parallax.x * -2}px, ${parallax.y * -2}px, 0)`,
        }}
      />

      <div ref={ref} className="rc-reveal rc-container">
        <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-12 lg:gap-8 items-center">
          <div style={{ transform: `translate3d(${parallax.x * 2}px, ${parallax.y * 1.5}px, 0)` }}>
            <h1 className="rc-brand-mark">RuralCare AI</h1>
            <p className="rc-hero-title mt-4">
              Healthcare intelligence that reaches{" "}
              <em style={{ color: T.teal, fontStyle: "normal" }}>every community.</em>
            </p>
            <p className="mt-6 text-base md:text-[1.05rem] max-w-md leading-relaxed" style={{ color: T.inkMid }}>
              Multilingual AI care connecting patients, doctors, and ASHA workers — accessible in any language, on any device.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/register" className="rc-btn-primary">
                Try the Platform
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <a href="#features" className="rc-btn-ghost">
                Explore Features
              </a>
            </div>
          </div>

          <div className="relative">
            <Suspense
              fallback={
                <div
                  className="aspect-square max-w-[520px] mx-auto rounded-full animate-pulse"
                  style={{ background: T.tealSoft }}
                />
              }
            >
              <IntelligenceCore parallax={parallax} />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
