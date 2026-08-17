import { u as L, a as Q, b as U, c as X, j as M, T as m } from "./index-CZZZc5ZW.js";
import { r as v } from "./react-galjbLIo.js";
import "./ui-b9d5g1mJ.js";

function et({ className: N = "", parallax: w }) {
  const R = v.useRef(null);

  const [F, P] = L(0.15);
  const b = Q();
  const y = U();

  const normalizePosition = (value) => {
    if (!value || typeof value !== "object") {
      return { x: 0, y: 0 };
    }

    const x = Number(value.x);
    const y = Number(value.y);

    return {
      x: Number.isFinite(x) ? x : 0,
      y: Number.isFinite(y) ? y : 0,
    };
  };

  const V = X(!w && !b && !y);

  const rawParallax = w || V;
  const u = normalizePosition(rawParallax);

  const C = v.useRef(u);

  v.useEffect(() => {
    C.current = normalizePosition(u);
  }, [u.x, u.y]);

  v.useEffect(() => {
    const c = R.current;

    if (!c) return;

    const t = c.getContext("2d", {
      alpha: true,
    });

    if (!t) return;

    let S = 0;
    let T = true;
    const B = performance.now();

    const p = Math.min(window.devicePixelRatio || 1, 2);

    const A = [
      { label: "Patient", angle: -Math.PI * 0.72, r: 0.38 },
      { label: "Voice", angle: -Math.PI * 0.35, r: 0.42 },
      { label: "AI", angle: 0, r: 0.28 },
      { label: "Report", angle: Math.PI * 0.38, r: 0.4 },
      { label: "Doctor", angle: Math.PI * 0.72, r: 0.36 },
      { label: "ASHA", angle: Math.PI * 1.1, r: 0.4 },
      { label: "Community", angle: Math.PI * 1.45, r: 0.37 },
    ];

    const W = b ? 18 : 36;

    const O = Array.from({ length: W }, (_, l) => ({
      a: (l / W) * Math.PI * 2,
      r: 0.18 + (l % 5) * 0.05,
      speed: 25e-5 + (l % 7) * 5e-5,
      size: 1 + (l % 3) * 0.4,
    }));

    const resizeCanvas = () => {
      const f = c.getBoundingClientRect();

      c.width = Math.max(1, Math.floor(f.width * p));
      c.height = Math.max(1, Math.floor(f.height * p));

      t.setTransform(p, 0, 0, p, 0, 0);
    };

    resizeCanvas();

    const E = new ResizeObserver(resizeCanvas);
    E.observe(c);

    const drawStatic = () => {
      const f = c.clientWidth;
      const l = c.clientHeight;

      const s = f / 2;
      const i = l / 2;

      const d = Math.min(f, l) * 0.42;

      t.clearRect(0, 0, f, l);

      const a = t.createRadialGradient(
        s,
        i,
        d * 0.1,
        s,
        i,
        d * 1.2
      );

      a.addColorStop(0, "rgba(13,92,80,0.16)");
      a.addColorStop(0.45, "rgba(13,92,80,0.06)");
      a.addColorStop(1, "rgba(13,92,80,0)");

      t.fillStyle = a;

      t.beginPath();
      t.arc(s, i, d * 1.15, 0, Math.PI * 2);
      t.fill();

      t.strokeStyle = "rgba(13,92,80,0.28)";
      t.lineWidth = 1.25;

      t.beginPath();
      t.arc(s, i, d * 0.55, 0, Math.PI * 2);
      t.stroke();

      t.fillStyle = m.teal;

      t.beginPath();
      t.arc(s, i, 8, 0, Math.PI * 2);
      t.fill();

      A.forEach((r) => {
        const n =
          s + Math.cos(r.angle) * d * r.r * 1.55;

        const g =
          i + Math.sin(r.angle) * d * r.r * 1.55;

        t.strokeStyle = "rgba(13,92,80,0.18)";

        t.beginPath();
        t.moveTo(s, i);
        t.lineTo(n, g);
        t.stroke();

        t.fillStyle = "#fff";
        t.strokeStyle = m.teal;
        t.lineWidth = 1.5;

        t.beginPath();
        t.arc(n, g, 5, 0, Math.PI * 2);
        t.fill();
        t.stroke();
      });
    };

    const animate = (f) => {
      if (!T) return;

      if (!P || y) {
        drawStatic();
        return;
      }

      const l = (f - B) / 1000;

      const s = c.clientWidth;
      const i = c.clientHeight;

      const position = normalizePosition(C.current);

      const d = position;

      const a =
        s / 2 + d.x * (b ? 0 : 4);

      const r =
        i / 2 + d.y * (b ? 0 : 3);

      const n = Math.min(s, i) * 0.42;

      t.clearRect(0, 0, s, i);

      const g = t.createRadialGradient(
        a,
        r,
        n * 0.05,
        a,
        r,
        n * 1.25
      );

      g.addColorStop(
        0,
        "rgba(23,128,110,0.22)"
      );

      g.addColorStop(
        0.35,
        "rgba(13,92,80,0.08)"
      );

      g.addColorStop(
        1,
        "rgba(13,92,80,0)"
      );

      t.fillStyle = g;

      t.beginPath();
      t.arc(a, r, n * 1.2, 0, Math.PI * 2);
      t.fill();

      const D = 1 + Math.sin(l * 0.7) * 0.018;

      t.strokeStyle = "rgba(13,92,80,0.22)";
      t.lineWidth = 1;

      t.beginPath();
      t.arc(a, r, n * 0.92 * D, 0, Math.PI * 2);
      t.stroke();

      for (let e = 0; e < 3; e++) {
        const o = n * (0.28 + e * 0.12);

        t.strokeStyle = `rgba(13,92,80,${0.35 - e * 0.08})`;
        t.lineWidth = e === 0 ? 1.6 : 1;

        t.beginPath();
        t.arc(a, r, o, 0, Math.PI * 2);
        t.stroke();
      }

      const x = A.map((e) => {
        const o = e.angle + l * 0.05;

        return {
          ...e,
          x: a + Math.cos(o) * n * e.r * 1.55,
          y: r + Math.sin(o) * n * e.r * 1.55,
          ang: o,
        };
      });

      x.forEach((e, o) => {
        const h = x[(o + 1) % x.length];

        t.strokeStyle = "rgba(13,92,80,0.12)";
        t.lineWidth = 1;

        t.beginPath();
        t.moveTo(e.x, e.y);

        const k =
          (e.x + h.x) / 2 +
          Math.sin(l + o) * 6;

        const K =
          (e.y + h.y) / 2 +
          Math.cos(l + o) * 4;

        t.quadraticCurveTo(
          k,
          K,
          h.x,
          h.y
        );

        t.stroke();

        t.strokeStyle =
          "rgba(13,92,80,0.16)";

        t.beginPath();
        t.moveTo(a, r);
        t.lineTo(e.x, e.y);
        t.stroke();
      });

      const G =
        Math.floor(l * 0.55) % x.length;

      const q =
        (l * 0.55) % 1;

      const H = x[G];

      const _ =
        a + (H.x - a) * q;

      const J =
        r + (H.y - r) * q;

      t.fillStyle = m.tealMid;

      t.beginPath();
      t.arc(_, J, 2.4, 0, Math.PI * 2);
      t.fill();

      O.forEach((e) => {
        const o =
          e.a + l * e.speed * 60;

        const h =
          a +
          Math.cos(o) *
            n *
            e.r *
            1.35;

        const k =
          r +
          Math.sin(o) *
            n *
            e.r *
            1.35;

        t.fillStyle = `rgba(13,92,80,${
          0.35 + (e.size % 2) * 0.2
        })`;

        t.beginPath();
        t.arc(h, k, e.size, 0, Math.PI * 2);
        t.fill();
      });

      x.forEach((e, o) => {
        const h = o === G;

        if (h) {
          t.fillStyle =
            "rgba(13,92,80,0.12)";

          t.beginPath();

          t.arc(
            e.x,
            e.y,
            14,
            0,
            Math.PI * 2
          );

          t.fill();
        }

        t.fillStyle = "#fff";
        t.strokeStyle = m.teal;
        t.lineWidth = h ? 2.2 : 1.4;

        t.beginPath();

        t.arc(
          e.x,
          e.y,
          h ? 6 : 5,
          0,
          Math.PI * 2
        );

        t.fill();
        t.stroke();

        if (!b) {
          t.fillStyle =
            "rgba(20,20,31,0.72)";

          t.font =
            "600 10px Manrope, sans-serif";

          t.textAlign = "center";

          t.fillText(
            e.label,
            e.x,
            e.y + 18
          );
        }
      });

      const I = t.createRadialGradient(
        a - 4,
        r - 4,
        2,
        a,
        r,
        16
      );

      I.addColorStop(0, "#2A9B88");
      I.addColorStop(1, m.teal);

      t.fillStyle = I;

      t.beginPath();

      t.arc(
        a,
        r,
        10 + Math.sin(l * 1.4) * 0.8,
        0,
        Math.PI * 2
      );

      t.fill();

      t.strokeStyle =
        "rgba(255,255,255,0.55)";

      t.lineWidth = 1;

      t.beginPath();

      t.moveTo(a - 4, r);
      t.lineTo(a + 4, r);

      t.moveTo(a, r - 4);
      t.lineTo(a, r + 4);

      t.stroke();

      S = requestAnimationFrame(animate);
    };

    if (y || !P) {
      drawStatic();
    } else {
      S = requestAnimationFrame(animate);
    }

    return () => {
      T = false;

      if (S) {
        cancelAnimationFrame(S);
      }

      E.disconnect();
    };
  }, [P, b, y]);

  return M.jsxs(
    "div",
    {
      ref: F,
      className: `relative w-full aspect-square max-w-[520px] mx-auto ${N}`,
      "aria-hidden": "true",

      children: [
        M.jsx("div", {
          className:
            "absolute inset-[8%] rounded-full pointer-events-none",

          style: {
            background: `
              radial-gradient(
                circle at 35% 30%,
                rgba(255,255,255,0.9),
                transparent 55%
              ),
              radial-gradient(
                circle at 70% 70%,
                ${m.tealGlow},
                transparent 50%
              )
            `,

            transform: `translate3d(
              ${u.x * 3}px,
              ${u.y * 2}px,
              0
            )`,

            transition:
              "transform 80ms linear",
          },
        }),

        M.jsx("canvas", {
          ref: R,

          className:
            "relative w-full h-full",

          style: {
            transform: `translate3d(
              ${u.x * 5}px,
              ${u.y * 4}px,
              0
            )`,

            transition:
              "transform 80ms linear",
          },
        }),

        M.jsx("p", {
          className: "sr-only",

          children:
            "Abstract visualization of RuralCare AI connecting patients, voice, reports, doctors, ASHA workers, and communities.",
        }),
      ],
    }
  );
}

export { et as default };
