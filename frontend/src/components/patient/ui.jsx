import React from "react";
import { Link } from "react-router-dom";
import { T } from "../../design/tokens";
import {
  PageHeader, SectionLabel, Surface, StatusBadge,
  EmptyState, Skeleton, ErrorState, RefreshButton,
} from "../dashboard/ui";

export {
  PageHeader, SectionLabel, Surface, StatusBadge,
  EmptyState, Skeleton, ErrorState, RefreshButton,
};

export { MetricTile, QuickAction } from "../dashboard/ui";

/** Consistent patient page wrapper */
export function PatientPage({ children, max = "max-w-3xl" }) {
  return (
    <div className={`${max} mx-auto space-y-5 md:space-y-6 pb-4`}>
      {children}
    </div>
  );
}

export function PatientBtn({ children, variant = "primary", className = "", style = {}, ...rest }) {
  const base = "inline-flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  if (variant === "primary") {
    return (
      <button
        className={`${base} px-5 py-2.5 rounded-full text-white ${className}`}
        style={{ background: T.teal, ...style }}
        {...rest}
      >
        {children}
      </button>
    );
  }
  if (variant === "ghost") {
    return (
      <button
        className={`${base} px-5 py-2.5 rounded-full border ${className}`}
        style={{ borderColor: T.border, color: T.inkMid, background: T.surfaceRaised, ...style }}
        {...rest}
      >
        {children}
      </button>
    );
  }
  return (
    <button className={`${base} ${className}`} style={style} {...rest}>
      {children}
    </button>
  );
}

export function SoftChip({ active, children, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-300 whitespace-nowrap"
      style={{
        borderColor: active ? T.teal : T.border,
        background: active ? T.tealSoft : T.surfaceRaised,
        color: active ? T.teal : T.inkMid,
      }}
    >
      {children}
    </button>
  );
}

export function FieldLabel({ children }) {
  return (
    <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.inkLight }}>
      {children}
    </label>
  );
}

export function FieldInput({ className = "", style = {}, ...rest }) {
  return (
    <input
      className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors ${className}`}
      style={{
        borderColor: T.border,
        background: T.surfaceRaised,
        color: T.ink,
        ...style,
      }}
      {...rest}
    />
  );
}

export function FieldTextarea({ className = "", style = {}, ...rest }) {
  return (
    <textarea
      className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors resize-none ${className}`}
      style={{
        borderColor: T.border,
        background: T.surfaceRaised,
        color: T.ink,
        ...style,
      }}
      {...rest}
    />
  );
}

export function FieldSelect({ className = "", style = {}, children, ...rest }) {
  return (
    <select
      className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors ${className}`}
      style={{
        borderColor: T.border,
        background: T.surfaceRaised,
        color: T.ink,
        ...style,
      }}
      {...rest}
    >
      {children}
    </select>
  );
}

export function Disclaimer() {
  return (
    <p className="text-[11px] leading-relaxed pt-3 border-t" style={{ color: T.inkLight, borderColor: T.borderSoft }}>
      AI-generated information supports understanding — it does not replace professional medical care.
      If symptoms are severe or worsening, contact a doctor or call{" "}
      <a href="tel:108" className="font-semibold" style={{ color: T.danger }}>108</a>.
    </p>
  );
}

export function PageLink({ to, children }) {
  return (
    <Link to={to} className="text-xs font-semibold" style={{ color: T.teal }}>
      {children}
    </Link>
  );
}

export { T };
