import React from "react";
import { Link } from "react-router-dom";
import { RefreshCw, AlertCircle } from "lucide-react";
import { T } from "../../design/tokens";

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 md:mb-8">
      <div>
        <h1
          className="text-2xl md:text-[1.75rem] font-semibold tracking-tight"
          style={{ fontFamily: "Syne, sans-serif", color: T.ink }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-1.5 max-w-xl leading-relaxed" style={{ color: T.inkMid }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <p
      className="text-[11px] font-bold uppercase tracking-[0.18em] mb-3"
      style={{ color: T.teal }}
    >
      {children}
    </p>
  );
}

export function Surface({ children, className = "", style = {}, as: Tag = "div", ...rest }) {
  return (
    <Tag
      className={`rounded-2xl border ${className}`}
      style={{
        background: T.surfaceRaised,
        borderColor: T.border,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function MetricTile({ label, value, hint, icon: Icon, to, tone = "default" }) {
  const tones = {
    default: { value: T.ink, icon: T.teal, bg: T.tealSoft },
    warn: { value: T.warn, icon: T.warn, bg: T.accentSoft },
    danger: { value: T.danger, icon: T.danger, bg: "#FEF2F2" },
    muted: { value: T.inkMid, icon: T.inkLight, bg: T.bgAlt },
  };
  const t = tones[tone] || tones.default;
  const inner = (
    <>
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: T.inkLight }}>
          {label}
        </span>
        {Icon && (
          <span
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: t.bg, color: t.icon }}
          >
            <Icon className="w-4 h-4" />
          </span>
        )}
      </div>
      <p
        className="text-2xl font-semibold tabular-nums leading-none"
        style={{ color: t.value, fontFamily: "Syne, sans-serif" }}
      >
        {value ?? "—"}
      </p>
      {hint && (
        <p className="text-xs mt-2" style={{ color: T.inkLight }}>
          {hint}
        </p>
      )}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="block rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5"
        style={{ background: T.surfaceRaised, borderColor: T.border }}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="rounded-2xl border p-4" style={{ background: T.surfaceRaised, borderColor: T.border }}>
      {inner}
    </div>
  );
}

export function StatusBadge({ status = "info", children }) {
  const map = {
    info: { bg: T.tealSoft, color: T.teal },
    success: { bg: "#ECFDF5", color: T.success },
    warn: { bg: T.accentSoft, color: T.warn },
    danger: { bg: "#FEF2F2", color: T.danger },
    muted: { bg: T.bgAlt, color: T.inkLight },
  };
  const s = map[status] || map.info;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize"
      style={{ background: s.bg, color: s.color }}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="text-center py-10 px-4">
      <p className="text-sm font-semibold" style={{ color: T.ink }}>{title}</p>
      {description && (
        <p className="text-sm mt-1.5 max-w-sm mx-auto leading-relaxed" style={{ color: T.inkLight }}>
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className}`}
      style={{ background: T.bgAlt }}
      aria-hidden="true"
    />
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div
      className="rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4"
      style={{ background: "#FEF2F2", borderColor: "#FECACA" }}
    >
      <div className="flex items-start gap-3 flex-1">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: T.danger }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: T.ink }}>Something went wrong</p>
          <p className="text-sm mt-1" style={{ color: T.inkMid }}>
            {message || "We couldn't load this information. Check your connection and try again."}
          </p>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border"
          style={{ borderColor: T.border, color: T.ink, background: T.surfaceRaised }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}

export function RefreshButton({ onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Refresh"
      className="p-2.5 rounded-full border transition-colors"
      style={{ borderColor: T.border, color: T.inkMid, background: T.surfaceRaised }}
    >
      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} style={{ color: loading ? T.teal : undefined }} />
    </button>
  );
}

export function QuickAction({ to, icon: Icon, label, desc }) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-3 rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: T.surfaceRaised, borderColor: T.border }}
    >
      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{ background: T.tealSoft, color: T.teal }}
      >
        <Icon className="w-5 h-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold" style={{ color: T.ink }}>{label}</span>
        {desc && <span className="block text-xs mt-0.5" style={{ color: T.inkLight }}>{desc}</span>}
      </span>
    </Link>
  );
}
