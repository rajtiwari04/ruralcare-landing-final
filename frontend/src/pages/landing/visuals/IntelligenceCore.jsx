import React, { useEffect, useRef } from "react";
import { useInView, useIsMobile, usePrefersReducedMotion, useParallax } from "../hooks";
import { T } from "../tokens";

/**
 * Lightweight procedural “AI Healthcare Intelligence Core”
 * Canvas-based — no Three.js. Pauses when off-screen / reduced motion.
 */
export default function IntelligenceCore({ className = "", parallax: parallaxProp }) {
  const canvasRef = useRef(null);
  const [wrapRef, inView] = useInView(0.15);
  const mobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const localParallax = useParallax(!parallaxProp && !mobile && !reduced);
  const parallax = parallaxProp || localParallax;
  const parallaxRef = useRef(parallax);
  parallaxRef.current = parallax;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let t0 = performance.now();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const nodes = [
      { label: "Patient", angle: -Math.PI * 0.72, r: 0.38 },
      { label: "Voice", angle: -Math.PI * 0.35, r: 0.42 },
      { label: "AI", angle: 0, r: 0.28 },
      { label: "Report", angle: Math.PI * 0.38, r: 0.4 },
      { label: "Doctor", angle: Math.PI * 0.72, r: 0.36 },
      { label: "ASHA", angle: Math.PI * 1.1, r: 0.4 },
      { label: "Community", angle: Math.PI * 1.45, r: 0.37 },
    ];

    const particleCount = mobile ? 18 : 36;
    const particles = Array.from({ length: particleCount }, (_, i) => ({
      a: (i / particleCount) * Math.PI * 2,
      r: 0.18 + (i % 5) * 0.05,
      speed: 0.00025 + (i % 7) * 0.00005,
      size: 1 + (i % 3) * 0.4,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const drawStatic = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.42;
      ctx.clearRect(0, 0, w, h);

      const g = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.2);
      g.addColorStop(0, "rgba(13,92,80,0.16)");
      g.addColorStop(0.45, "rgba(13,92,80,0.06)");
      g.addColorStop(1, "rgba(13,92,80,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(13,92,80,0.28)";
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.55, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = T.teal;
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();

      nodes.forEach((n) => {
        const x = cx + Math.cos(n.angle) * R * n.r * 1.55;
        const y = cy + Math.sin(n.angle) * R * n.r * 1.55;
        ctx.strokeStyle = "rgba(13,92,80,0.18)";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = T.teal;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    };

    const draw = (now) => {
      if (!running) return;
      if (!inView || reduced) {
        drawStatic();
        return;
      }

      const t = (now - t0) / 1000;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const pxOff = parallaxRef.current;
      const cx = w / 2 + pxOff.x * (mobile ? 0 : 4);
      const cy = h / 2 + pxOff.y * (mobile ? 0 : 3);
      const R = Math.min(w, h) * 0.42;

      ctx.clearRect(0, 0, w, h);

      // Soft volumetric glow
      const glow = ctx.createRadialGradient(cx, cy, R * 0.05, cx, cy, R * 1.25);
      glow.addColorStop(0, "rgba(23,128,110,0.22)");
      glow.addColorStop(0.35, "rgba(13,92,80,0.08)");
      glow.addColorStop(1, "rgba(13,92,80,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Outer breathing ring
      const breathe = 1 + Math.sin(t * 0.7) * 0.018;
      ctx.strokeStyle = "rgba(13,92,80,0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.92 * breathe, 0, Math.PI * 2);
      ctx.stroke();

      // Inner core rings
      for (let i = 0; i < 3; i++) {
        const rr = R * (0.28 + i * 0.12);
        ctx.strokeStyle = `rgba(13,92,80,${0.35 - i * 0.08})`;
        ctx.lineWidth = i === 0 ? 1.6 : 1;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Connection arcs between adjacent nodes
      const positions = nodes.map((n) => {
        const ang = n.angle + t * 0.05;
        return {
          ...n,
          x: cx + Math.cos(ang) * R * n.r * 1.55,
          y: cy + Math.sin(ang) * R * n.r * 1.55,
          ang,
        };
      });

      positions.forEach((n, i) => {
        const next = positions[(i + 1) % positions.length];
        ctx.strokeStyle = "rgba(13,92,80,0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        const mx = (n.x + next.x) / 2 + Math.sin(t + i) * 6;
        const my = (n.y + next.y) / 2 + Math.cos(t + i) * 4;
        ctx.quadraticCurveTo(mx, my, next.x, next.y);
        ctx.stroke();

        // Spoke to core
        ctx.strokeStyle = "rgba(13,92,80,0.16)";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(n.x, n.y);
        ctx.stroke();
      });

      // Traveling pulse on spokes
      const pulseIdx = Math.floor(t * 0.55) % positions.length;
      const pulseT = (t * 0.55) % 1;
      const pn = positions[pulseIdx];
      const px = cx + (pn.x - cx) * pulseT;
      const py = cy + (pn.y - cy) * pulseT;
      ctx.fillStyle = T.tealMid;
      ctx.beginPath();
      ctx.arc(px, py, 2.4, 0, Math.PI * 2);
      ctx.fill();

      // Orbiting data particles
      particles.forEach((p) => {
        const a = p.a + t * p.speed * 60;
        const x = cx + Math.cos(a) * R * p.r * 1.35;
        const y = cy + Math.sin(a) * R * p.r * 1.35;
        ctx.fillStyle = `rgba(13,92,80,${0.35 + (p.size % 2) * 0.2})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Nodes
      positions.forEach((n, i) => {
        const active = i === pulseIdx;
        if (active) {
          ctx.fillStyle = "rgba(13,92,80,0.12)";
          ctx.beginPath();
          ctx.arc(n.x, n.y, 14, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = T.teal;
        ctx.lineWidth = active ? 2.2 : 1.4;
        ctx.beginPath();
        ctx.arc(n.x, n.y, active ? 6 : 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (!mobile) {
          ctx.fillStyle = "rgba(20,20,31,0.72)";
          ctx.font = "600 10px Manrope, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(n.label, n.x, n.y + 18);
        }
      });

      // Core nucleus
      const coreG = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, 16);
      coreG.addColorStop(0, "#2A9B88");
      coreG.addColorStop(1, T.teal);
      ctx.fillStyle = coreG;
      ctx.beginPath();
      ctx.arc(cx, cy, 10 + Math.sin(t * 1.4) * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Heartbeat cross-hair accent (subtle)
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy);
      ctx.lineTo(cx + 4, cy);
      ctx.moveTo(cx, cy - 4);
      ctx.lineTo(cx, cy + 4);
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    };

    if (reduced || !inView) {
      drawStatic();
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [inView, mobile, reduced]);

  return (
    <div
      ref={wrapRef}
      className={`relative w-full aspect-square max-w-[520px] mx-auto ${className}`}
      aria-hidden="true"
    >
      {/* Soft atmospheric layers */}
      <div
        className="absolute inset-[8%] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), transparent 55%), radial-gradient(circle at 70% 70%, ${T.tealGlow}, transparent 50%)`,
          transform: `translate3d(${parallax.x * 3}px, ${parallax.y * 2}px, 0)`,
          transition: "transform 80ms linear",
        }}
      />
      <canvas
        ref={canvasRef}
        className="relative w-full h-full"
        style={{
          transform: `translate3d(${parallax.x * 5}px, ${parallax.y * 4}px, 0)`,
          transition: "transform 80ms linear",
        }}
      />
      <p className="sr-only">
        Abstract visualization of RuralCare AI connecting patients, voice, reports, doctors, ASHA workers, and communities.
      </p>
    </div>
  );
}
