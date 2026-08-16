import React, { useEffect, useRef } from "react";
import { useInView, usePrefersReducedMotion } from "../hooks";
import { T } from "../tokens";

const NODES = [
  { id: "Patient", x: 12, y: 48 },
  { id: "Voice", x: 28, y: 28 },
  { id: "AI", x: 50, y: 42 },
  { id: "Report", x: 48, y: 72 },
  { id: "Doctor", x: 72, y: 30 },
  { id: "ASHA", x: 78, y: 62 },
  { id: "Community", x: 92, y: 48 },
];

const EDGES = [
  [0, 1], [1, 2], [0, 2], [2, 3], [2, 4], [3, 5], [4, 6], [5, 6], [2, 5],
];

/** Single SVG living health network — one animation loop, paused off-screen */
export default function HealthNetwork({ className = "", height = 180 }) {
  const [ref, inView] = useInView(0.2);
  const reduced = usePrefersReducedMotion();
  const dotRef = useRef(null);
  const raf = useRef(0);

  useEffect(() => {
    if (reduced || !inView) return;
    let t0 = performance.now();
    const pathLens = EDGES.length;

    const tick = (now) => {
      const t = ((now - t0) / 3200) % pathLens;
      const ei = Math.floor(t);
      const f = t - ei;
      const [a, b] = EDGES[ei];
      const n1 = NODES[a];
      const n2 = NODES[b];
      const x = n1.x + (n2.x - n1.x) * f;
      const y = n1.y + (n2.y - n1.y) * f;
      if (dotRef.current) {
        dotRef.current.setAttribute("cx", String(x));
        dotRef.current.setAttribute("cy", String(y));
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [inView, reduced]);

  return (
    <div ref={ref} className={className} aria-hidden="true">
      <svg viewBox="0 0 100 100" className="w-full" style={{ height }} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="rcNetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={T.teal} stopOpacity="0.15" />
            <stop offset="50%" stopColor={T.teal} stopOpacity="0.45" />
            <stop offset="100%" stopColor={T.teal} stopOpacity="0.15" />
          </linearGradient>
        </defs>
        {EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
            stroke="url(#rcNetGrad)"
            strokeWidth="0.35"
          />
        ))}
        {NODES.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={n.id === "AI" ? 2.2 : 1.4} fill={T.teal} opacity={n.id === "AI" ? 0.9 : 0.55} />
            <text
              x={n.x}
              y={n.y - 3.2}
              textAnchor="middle"
              fontSize="2.6"
              fill={T.inkMid}
              fontFamily="Manrope, sans-serif"
              fontWeight="600"
            >
              {n.id}
            </text>
          </g>
        ))}
        <circle ref={dotRef} r="1.1" fill={T.tealMid} opacity="0.95" />
      </svg>
    </div>
  );
}
