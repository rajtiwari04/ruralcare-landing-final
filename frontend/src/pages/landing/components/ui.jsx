import React from "react";
import { T } from "../tokens";

export function SectionLabel({ children }) {
  return (
    <p className="rc-label mb-5">
      {children}
    </p>
  );
}

export function Badge({ type = "available" }) {
  const config = {
    available: { label: "Available", bg: "#EDFAF5", color: "#0D5C50", border: "#B6E8D8" },
    development: { label: "In Development", bg: "#FEF9EC", color: "#A05C00", border: "#F5DFA3" },
    planned: { label: "Planned", bg: "#F3F3F6", color: "#7A7A96", border: "#DEDEE8" },
  };
  const c = config[type] || config.planned;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap"
      style={{ background: c.bg, color: c.color, borderColor: c.border }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: c.color, opacity: type === "planned" ? 0.4 : type === "development" ? 0.7 : 1 }}
        aria-hidden="true"
      />
      {c.label}
    </span>
  );
}

export function SectionShell({ id, alt, children, className = "" }) {
  return (
    <section
      id={id}
      className={`rc-section ${className}`}
      style={{ background: alt ? T.bgAlt : T.bg, scrollMarginTop: 72 }}
    >
      <div className="rc-container">{children}</div>
    </section>
  );
}

export function DisplayHeading({ children, className = "", as: Tag = "h2" }) {
  return (
    <Tag className={`rc-display ${className}`}>
      {children}
    </Tag>
  );
}
