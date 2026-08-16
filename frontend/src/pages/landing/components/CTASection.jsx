import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart } from "lucide-react";
import { T } from "../tokens";
import { useReveal } from "../hooks";

function HeartbeatLine() {
  return (
    <svg viewBox="0 0 320 48" fill="none" className="w-full max-w-xs mx-auto" aria-hidden="true">
      <path
        d="M0 24 L60 24 L75 8 L90 40 L105 4 L120 44 L135 24 L320 24"
        stroke={T.teal}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.45"
        className="rc-heartbeat-line"
      />
    </svg>
  );
}

export default function CTASection() {
  const ref = useReveal();

  return (
    <section className="rc-section" style={{ background: T.bg }}>
      <div className="rc-container max-w-2xl text-center">
        <div ref={ref} className="rc-reveal">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-8 rc-pulse-soft"
            style={{ background: T.tealSoft }}
          >
            <Heart className="w-6 h-6" style={{ color: T.teal }} />
          </div>

          <h2
            className="text-3xl md:text-4xl font-semibold leading-snug"
            style={{
              fontFamily: "Syne, sans-serif",
              color: T.ink,
              lineHeight: 1.25,
            }}
          >
            Healthcare should not depend on where you live, which language you speak, or how easily you can reach a doctor.
          </h2>

          <div className="my-8">
            <HeartbeatLine />
          </div>

          <p className="text-base mb-10 max-w-lg mx-auto leading-relaxed" style={{ color: T.inkMid }}>
            RuralCare AI connects patients, AI, doctors, healthcare workers, and communities into a proactive healthcare ecosystem —
            accessible to everyone, in every language, on any device.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register" className="rc-btn-primary">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#vision" className="rc-btn-ghost">
              Read the Vision
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t py-10" style={{ borderColor: T.border, background: T.bgAlt }}>
      <div className="rc-container flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: T.teal }}>
            <Heart className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-semibold" style={{ color: T.ink, fontFamily: "Syne, sans-serif" }}>
            RuralCare AI
          </span>
          <span className="text-xs" style={{ color: T.inkLight }}>© 2026. All rights reserved.</span>
        </div>
        <p className="text-xs" style={{ color: T.inkMid, fontFamily: "Syne, sans-serif" }}>
          Made by Anshuman for the community.
        </p>
      </div>
    </footer>
  );
}
