import React, { useState } from "react";
import { chatAPI } from "../../services/index";
import { Activity, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import useAnalytics from "../../hooks/useAnalytics";
import {
  PatientPage, PageHeader, Surface, SectionLabel, SoftChip,
  FieldLabel, FieldTextarea, PatientBtn, EmptyState, Disclaimer, StatusBadge, T,
} from "../../components/patient/ui";

const QUICK_SYMPTOMS = [
  "Fever / बुखार",
  "Headache / सिर दर्द",
  "Cough / खांसी",
  "Body ache / बदन दर्द",
  "Cold / जुकाम",
  "Stomach pain / पेट दर्द",
  "Diarrhea / दस्त",
  "Vomiting / उल्टी",
  "Chest pain / सीने में दर्द",
  "Breathlessness / सांस की तकलीफ",
];

export default function SymptomsPage() {
  const { track } = useAnalytics();
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!symptoms.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await chatAPI.analyzeSymptoms({ symptoms: symptoms.trim() });
      const analysis = res?.data?.data?.analysis;
      if (!analysis) throw new Error("Invalid analysis response");
      setResult(analysis);
      track("symptom_reported", { riskLevel: analysis.riskLevel });
    } catch {
      setError("We couldn't analyze your symptoms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const riskStatus =
    result?.riskLevel === "emergency" || result?.riskLevel === "high"
      ? "danger"
      : result?.riskLevel === "medium"
        ? "warn"
        : "success";

  return (
    <PatientPage>
      <PageHeader
        title="Symptom checker"
        subtitle="Describe how you feel in any language — RuralCare AI will help you understand next steps."
      />

      <Surface className="p-5 space-y-4">
        <SectionLabel>Your symptoms</SectionLabel>
        <div>
          <FieldLabel>Describe in your words</FieldLabel>
          <FieldTextarea
            rows={4}
            placeholder="Example: Mujhe 2 din se bukhaar hai aur sar dard ho raha hai"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </div>

        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: T.inkLight }}>Quick select</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SYMPTOMS.map((s) => (
              <SoftChip
                key={s}
                onClick={() => setSymptoms((prev) => (prev ? `${prev}, ${s}` : s))}
              >
                {s}
              </SoftChip>
            ))}
          </div>
        </div>

        <PatientBtn onClick={analyze} disabled={!symptoms.trim() || loading} className="w-full">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
          ) : (
            <><Activity className="w-4 h-4" /> Analyze symptoms</>
          )}
        </PatientBtn>
      </Surface>

      {error && (
        <Surface className="p-4" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
          <p className="text-sm" style={{ color: T.danger }}>{error}</p>
        </Surface>
      )}

      {result && (
        <Surface className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <SectionLabel>AI analysis</SectionLabel>
              <p className="text-lg font-semibold -mt-1" style={{ fontFamily: "Syne, sans-serif", color: T.ink }}>
                Assessment ready
              </p>
            </div>
            <StatusBadge status={riskStatus}>{result.riskLevel || "low"}</StatusBadge>
          </div>

          {result.isEmergency && (
            <div className="rounded-2xl p-4 text-center text-white" style={{ background: T.danger }}>
              <p className="font-bold text-base">This may need urgent care</p>
              <p className="text-sm mt-1 opacity-90">Contact a doctor immediately or call 108.</p>
              <a
                href="tel:108"
                className="inline-flex items-center gap-1.5 mt-3 px-5 py-2 rounded-full text-sm font-bold"
                style={{ background: "#fff", color: T.danger }}
              >
                <AlertCircle className="w-4 h-4" /> Call 108
              </a>
            </div>
          )}

          {result.aiSummary && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.inkLight }}>
                AI-generated summary
              </p>
              <p className="text-sm leading-relaxed" style={{ color: T.inkMid }}>{result.aiSummary}</p>
            </div>
          )}

          {result.extractedSymptoms?.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: T.inkLight }}>
                Detected symptoms
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.extractedSymptoms.map((s, i) => (
                  <span
                    key={`${s}-${i}`}
                    className="text-xs px-2.5 py-1 rounded-full border"
                    style={{ borderColor: T.border, color: T.inkMid, background: T.bg }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.homeRemedies?.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: T.inkLight }}>
                Supportive care ideas
              </p>
              <ul className="space-y-1.5">
                {result.homeRemedies.map((r, i) => (
                  <li key={i} className="text-sm flex gap-2" style={{ color: T.inkMid }}>
                    <span style={{ color: T.teal }}>•</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.recommendedActions?.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: T.inkLight }}>
                Recommended next steps
              </p>
              <ul className="space-y-1.5">
                {result.recommendedActions.map((a, i) => (
                  <li key={i} className="text-sm flex gap-2" style={{ color: T.inkMid }}>
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: T.success }} />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Disclaimer />
        </Surface>
      )}

      {!result && !loading && !error && (
        <EmptyState
          title="Ready when you are"
          description="Share your symptoms above to receive an AI-supported assessment."
        />
      )}
    </PatientPage>
  );
}
