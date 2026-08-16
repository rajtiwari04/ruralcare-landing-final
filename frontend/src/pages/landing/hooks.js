import { useState, useEffect, useRef } from "react";

export function useReveal(options = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("rc-visible");
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("rc-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px", ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [threshold]);
  return scrolled;
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return mobile;
}

/** Subtle pointer parallax — disabled on touch / reduced motion */
export function useParallax(enabled = true) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const active = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setOffset({ x: 0, y: 0 });
      current.current = { x: 0, y: 0 };
      target.current = { x: 0, y: 0 };
      return;
    }

    const tick = () => {
      const nx = current.current.x + (target.current.x - current.current.x) * 0.08;
      const ny = current.current.y + (target.current.y - current.current.y) * 0.08;
      current.current = { x: nx, y: ny };
      setOffset({ x: nx, y: ny });
      const settled =
        Math.abs(target.current.x - nx) < 0.001 &&
        Math.abs(target.current.y - ny) < 0.001;
      if (settled) {
        active.current = false;
        raf.current = 0;
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };

    const kick = () => {
      if (active.current) return;
      active.current = true;
      raf.current = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      target.current = {
        x: ((e.clientX - cx) / cx) * 1,
        y: ((e.clientY - cy) / cy) * 1,
      };
      kick();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
      active.current = false;
    };
  }, [enabled]);

  return offset;
}

export function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}
