import React, { useState, useEffect, useCallback } from "react";
import { patientAPI } from "../../services/index";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  PatientPage, PageHeader, Surface, SectionLabel, SoftChip, StatusBadge,
  EmptyState, Skeleton, ErrorState, RefreshButton, Disclaimer, PatientBtn, T,
} from "../../components/patient/ui";
import { formatShortDate, formatTime } from "../../design/tokens";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "emergency", label: "Emergency" },
];

function riskTone(level) {
  if (level === "emergency" || level === "high") return "danger";
  if (level === "medium") return "warn";
  return "success";
}

export default function HealthHistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await patientAPI.getHealthHistory({ limit: 12, page: p });
      const data = res.data?.data || {};
      const list = data.records || [];
      setRecords(p === 1 ? list : (prev) => [...prev, ...list]);
      setTotal(data.total || list.length);
      setPage(p);
    } catch {
      if (p === 1) {
        setError("We couldn't load your health timeline.");
        setRecords([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1); }, [load]);

  const visible = filter === "all" ? records : records.filter((r) => r.riskLevel === filter);

  return (
    <PatientPage>
      <PageHeader
        title="Health timeline"
        subtitle="Your symptom checks and AI consultations, in one calm journey."
        action={<RefreshButton onClick={() => load(1)} loading={loading} />}
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <SoftChip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </SoftChip>
        ))}
      </div>

      {error && <ErrorState message={error} onRetry={() => load(1)} />}

      {loading && records.length === 0 && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {!loading && visible.length === 0 && !error && (
        <Surface>
          <EmptyState
            title="No timeline events yet"
            description="Report symptoms or chat with AI to start building your health history."
          />
        </Surface>
      )}

      <div className="relative space-y-0">
        {visible.map((r, i) => {
          const open = expanded === r._id;
          return (
            <div key={r._id} className="flex gap-3">
              <div className="flex flex-col items-center w-4 shrink-0">
                <span
                  className="w-2.5 h-2.5 rounded-full mt-5"
                  style={{ background: i === 0 ? T.teal : T.border }}
                />
                {i < visible.length - 1 && (
                  <span className="w-px flex-1 my-1" style={{ background: T.borderSoft }} />
                )}
              </div>

              <Surface className="flex-1 mb-3 overflow-hidden">
                <button
                  type="button"
                  className="w-full text-left p-4 flex items-start justify-between gap-3"
                  onClick={() => setExpanded(open ? null : r._id)}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <StatusBadge status={riskTone(r.riskLevel)}>{r.riskLevel || "record"}</StatusBadge>
                      <span className="text-[11px]" style={{ color: T.inkLight }}>
                        {formatShortDate(r.createdAt)} · {formatTime(r.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2" style={{ color: T.inkMid }}>
                      {r.symptoms || "Health activity recorded"}
                    </p>
                  </div>
                  {open
                    ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: T.inkLight }} />
                    : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: T.inkLight }} />}
                </button>

                {open && (
                  <div className="px-4 pb-4 space-y-3 border-t pt-3" style={{ borderColor: T.borderSoft }}>
                    {r.aiSummary && (
                      <div>
                        <SectionLabel>AI-generated summary</SectionLabel>
                        <p className="text-sm leading-relaxed" style={{ color: T.inkMid }}>{r.aiSummary}</p>
                      </div>
                    )}
                    {r.homeRemedies?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: T.inkLight }}>Supportive care</p>
                        <ul className="space-y-1">
                          {r.homeRemedies.map((h, idx) => (
                            <li key={idx} className="text-xs" style={{ color: T.inkMid }}>• {h}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {r.recommendedActions?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: T.inkLight }}>Actions</p>
                        <ul className="space-y-1">
                          {r.recommendedActions.map((a, idx) => (
                            <li key={idx} className="text-xs" style={{ color: T.inkMid }}>• {a}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Disclaimer />
                  </div>
                )}
              </Surface>
            </div>
          );
        })}
      </div>

      {records.length < total && (
        <PatientBtn variant="ghost" onClick={() => load(page + 1)} disabled={loading} className="w-full">
          {loading ? "Loading…" : "Load more"}
        </PatientBtn>
      )}
    </PatientPage>
  );
}
