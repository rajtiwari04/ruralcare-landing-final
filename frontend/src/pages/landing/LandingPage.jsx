import React from "react";
import { T } from "./tokens";
import LandingNav from "./components/LandingNav";
import HeroSection from "./components/HeroSection";
import ProblemSection from "./components/ProblemSection";
import VisionSection from "./components/VisionSection";
import HowItWorksSection from "./components/HowItWorksSection";
import FeaturesSection from "./components/FeaturesSection";
import JourneysSection from "./components/JourneysSection";
import CommunitySection from "./components/CommunitySection";
import TechSection from "./components/TechSection";
import SafetySection from "./components/SafetySection";
import RoadmapSection from "./components/RoadmapSection";
import CTASection, { LandingFooter } from "./components/CTASection";
import ScrollProgress from "./components/ScrollProgress";

/**
 * RuralCare AI public landing experience.
 * Preserves product story, status honesty, and auth CTAs (/login, /register).
 */
export default function LandingPage() {
  return (
    <div
      className="min-h-screen rc-landing"
      style={{ background: T.bg, color: T.ink }}
    >
      <ScrollProgress />
      <LandingNav />
      <main>
        <HeroSection />
        <ProblemSection />
        <VisionSection />
        <HowItWorksSection />
        <FeaturesSection />
        <JourneysSection />
        <CommunitySection />
        <TechSection />
        <SafetySection />
        <RoadmapSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
