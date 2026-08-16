import React, { useState, useEffect, useId } from "react";
import { Link } from "react-router-dom";
import { Heart, Menu, X } from "lucide-react";
import { T } from "../tokens";
import { navLinks } from "../data";
import { useScrolled } from "../hooks";

export default function LandingNav() {
  const scrolled = useScrolled(20);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const menuId = useId();

  useEffect(() => {
    const ids = navLinks.map((l) => l.href.slice(1));
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5] }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center px-3 pt-3 pointer-events-none">
      <nav
        className="pointer-events-auto w-full max-w-5xl rounded-full transition-all duration-500"
        style={{
          background: scrolled || open ? "rgba(251,250,247,0.88)" : "rgba(251,250,247,0.55)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: `1px solid ${scrolled || open ? T.border : "rgba(226,222,214,0.5)"}`,
          boxShadow: scrolled ? "0 8px 30px rgba(20,20,31,0.06)" : "none",
        }}
        aria-label="Primary"
      >
        <div className="flex items-center justify-between gap-3 px-4 h-12 md:h-14">
          <a href="#" className="flex items-center gap-2.5 shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: T.teal }}
            >
              <Heart className="w-3.5 h-3.5 text-white" aria-hidden="true" />
            </span>
            <span className="font-semibold text-sm tracking-tight" style={{ color: T.ink, fontFamily: "Syne, sans-serif" }}>
              RuralCare AI
            </span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => {
              const isActive = active === l.href.slice(1);
              return (
                <a
                  key={l.href}
                  href={l.href}
                  className="relative px-3 py-1.5 text-[13px] font-medium rounded-full transition-colors duration-300"
                  style={{ color: isActive ? T.teal : T.inkMid }}
                >
                  {l.label}
                  {isActive && (
                    <span
                      className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full"
                      style={{ background: T.teal }}
                    />
                  )}
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden sm:inline-flex text-[13px] font-medium px-3.5 py-1.5 rounded-full border transition-colors duration-300"
              style={{ borderColor: T.border, color: T.inkMid }}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-[13px] font-semibold px-3.5 py-1.5 rounded-full text-white transition-transform duration-300 hover:-translate-y-px"
              style={{ background: T.teal }}
            >
              Try Free
            </Link>
            <button
              type="button"
              className="md:hidden w-9 h-9 rounded-full flex items-center justify-center border"
              style={{ borderColor: T.border, color: T.ink }}
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {open && (
          <div
            id={menuId}
            className="md:hidden px-4 pb-4 pt-1 border-t"
            style={{ borderColor: T.borderSoft }}
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="px-3 py-2.5 text-sm font-medium rounded-xl"
                  style={{ color: T.ink }}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              ))}
              <Link
                to="/login"
                className="sm:hidden px-3 py-2.5 text-sm font-medium rounded-xl"
                style={{ color: T.inkMid }}
                onClick={() => setOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
