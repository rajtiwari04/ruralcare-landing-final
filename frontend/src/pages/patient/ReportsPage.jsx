import React, { useState, useEffect, useRef, useCallback } from "react";
import { reportAPI } from "../../services/index";
import { Upload, FileText, Loader2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import useAnalytics from "../../hooks/useAnalytics";
import {
  PatientPage, PageHeader, Surface, SectionLabel, SoftChip, StatusBadge,
  EmptyState, Skeleton, ErrorState, PatientBtn, Disclaimer, RefreshButton, T,
} from "../../components/patient/ui";
import { formatShortDate } from "../../design/tokens";

const REPORT_TYPES = [
  { value: "blood_report", label: "Blood report" },
  { value: "prescription", label: "Prescription" },
  { value: "xray", label: "X-Ray / Scan" },
  { value: "other", label: "Other" },
];

function statusTone(status) {
  if (status === "completed") return "success";
  if (status === "failed") return "danger";
  if (status === "processing" || status === "pending") return "warn";
  return "muted";
}

export default function ReportsPage() {
  const { track } = useAnalytics();
  const fileRef = useRef();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [type, setType] = useState("blood_report");
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await reportAPI.getAll();
      setReports(res.data?.data?.reports || []);
    } catch {
      setError("We couldn't load your reports.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const processing = reports.some((r) => r.status === "processing" || r.status === "pending");
    if (!processing) return;
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [reports, load]);

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const form = new FormData();
      form.append("report", file);
      form.append("reportType", type);
      await reportAPI.upload(form);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      track("report_uploaded", { reportType: type });
      setTimeout(load, 800);
    } catch (err) {
      setUploadError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this report?")) return;
    await reportAPI.delete(id).catch(() => {});
    setReports((prev) => prev.filter((r) => r._id !== id));
  };

  return (
    <PatientPage>
      <PageHeader
        title="Medical reports"
        subtitle="Upload a report photo or PDF — RuralCare AI can help explain it in plain language."
        action={<RefreshButton onClick={load} loading={loading} />}
      />

      <Surface className="p-5 space-y-4">
        <SectionLabel>Upload new report</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {REPORT_TYPES.map((t) => (
            <SoftChip key={t.value} active={type === t.value} onClick={() => setType(t.value)}>
              {t.label}
            </SoftChip>
          ))}
        </div>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-2xl border border-dashed p-8 text-center transition-colors"
          style={{ borderColor: T.border, background: T.bg }}
        >
          {file ? (
            <div>
              <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: T.teal }} />
              <p className="text-sm font-semibold" style={{ color: T.ink }}>{file.name}</p>
              <p className="text-xs mt-1" style={{ color: T.inkLight }}>{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: T.inkLight }} />
              <p className="text-sm" style={{ color: T.inkMid }}>Tap to choose a file</p>
              <p className="text-xs mt-1" style={{ color: T.inkLight }}>JPG, PNG, or PDF · Max 10MB</p>
            </div>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        {uploadError && <p className="text-sm" style={{ color: T.danger }}>{uploadError}</p>}

        <PatientBtn onClick={upload} disabled={!file || uploading} className="w-full">
          {uploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Uploading & analyzing…</>
          ) : (
            <><Upload className="w-4 h-4" /> Upload report</>
          )}
        </PatientBtn>
      </Surface>

      {error && <ErrorState message={error} onRetry={load} />}

      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>Your reports</SectionLabel>
          <span className="text-xs" style={{ color: T.inkLight }}>{reports.length}</span>
        </div>

        {loading && reports.length === 0 && (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {!loading && reports.length === 0 && !error && (
          <Surface>
            <EmptyState
              title="No reports yet"
              description="Upload a medical report and RuralCare AI can help explain it."
            />
          </Surface>
        )}

        <div className="space-y-2">
          {reports.map((r) => {
            const open = expanded === r._id;
            return (
              <Surface key={r._id} className="overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center gap-3 p-4 text-left"
                  onClick={() => setExpanded(open ? null : r._id)}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: T.tealSoft, color: T.teal }}
                  >
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate capitalize" style={{ color: T.ink }}>
                      {(r.reportTitle || r.reportType || "report").replace(/_/g, " ")}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: T.inkLight }}>
                      Uploaded {formatShortDate(r.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={statusTone(r.status)}>{r.status || "pending"}</StatusBadge>
                  <button
                    type="button"
                    aria-label="Delete report"
                    onClick={(e) => { e.stopPropagation(); del(r._id); }}
                    className="p-1.5 rounded-lg"
                    style={{ color: T.inkLight }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {open ? <ChevronUp className="w-4 h-4" style={{ color: T.inkLight }} /> : <ChevronDown className="w-4 h-4" style={{ color: T.inkLight }} />}
                </button>

                {open && (
                  <div className="px-4 pb-4 space-y-3 border-t pt-3" style={{ borderColor: T.borderSoft }}>
                    {r.status === "failed" && (
                      <div className="rounded-xl p-3" style={{ background: "#FEF2F2" }}>
                        <p className="text-xs font-semibold mb-1" style={{ color: T.danger }}>Could not analyze</p>
                        <p className="text-xs" style={{ color: T.inkMid }}>{r.aiSummary || "Try a clearer photo with readable text."}</p>
                      </div>
                    )}
                    {r.status === "completed" && (
                      <>
                        {r.aiSummary && (
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: T.inkLight }}>
                              AI-generated summary
                            </p>
                            <p className="text-sm leading-relaxed" style={{ color: T.inkMid }}>{r.aiSummary}</p>
                          </div>
                        )}
                        {r.keyFindings?.length > 0 && (
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: T.inkLight }}>Key findings</p>
                            <ul className="space-y-1">
                              {r.keyFindings.map((f, i) => (
                                <li key={i} className="text-xs" style={{ color: T.inkMid }}>• {f}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {r.abnormalValues?.length > 0 && (
                          <div className="rounded-xl p-3" style={{ background: T.accentSoft }}>
                            <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: T.accent }}>
                              May need discussion
                            </p>
                            <ul className="space-y-1">
                              {r.abnormalValues.map((v, i) => (
                                <li key={i} className="text-xs" style={{ color: T.inkMid }}>• {v}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {r.recommendations?.length > 0 && (
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: T.inkLight }}>Suggestions</p>
                            <ul className="space-y-1">
                              {r.recommendations.map((rec, i) => (
                                <li key={i} className="text-xs" style={{ color: T.inkMid }}>• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {r.fileUrl && (
                          <a
                            href={r.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold"
                            style={{ color: T.teal }}
                          >
                            <FileText className="w-3.5 h-3.5" /> View original file
                          </a>
                        )}
                        <Disclaimer />
                      </>
                    )}
                    {(r.status === "processing" || r.status === "pending") && (
                      <p className="text-sm flex items-center gap-2" style={{ color: T.inkMid }}>
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: T.teal }} />
                        Analyzing your report…
                      </p>
                    )}
                  </div>
                )}
              </Surface>
            );
          })}
        </div>
      </div>
    </PatientPage>
  );
}
