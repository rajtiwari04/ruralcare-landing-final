import React, { useEffect, useState } from "react";
import { T } from "../tokens";
import { usePrefersReducedMotion } from "../hooks";

/** Thin reading progress — transform only, passive scroll */
export default function ScrollProgress() {
  const [p, setP] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setP(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] pointer-events-none"
      style={{ background: "transparent" }}
      aria-hidden="true"
    >
      <div
        className="h-full origin-left"
        style={{
          background: `linear-gradient(90deg, ${T.teal}, ${T.tealMid})`,
          transform: `scaleX(${p})`,
          transition: "transform 80ms linear",
        }}
      />
    </div>
  );
}
