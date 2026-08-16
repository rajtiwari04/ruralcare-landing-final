import React, { useState } from "react";
import { Star, Send, CheckCircle } from "lucide-react";
import { analyticsAPI } from "../../services/phase5_6";
import {
  PatientPage, PageHeader, Surface, SectionLabel, SoftChip,
  FieldLabel, FieldTextarea, PatientBtn, T,
} from "../../components/patient/ui";

const FEEDBACK_TYPES = [
  { value: "ai_response", label: "AI chat response", desc: "Quality of AI health responses" },
  { value: "report_analysis", label: "Report analysis", desc: "OCR and report explanation quality" },
  { value: "app_general", label: "App experience", desc: "Overall RuralCare AI experience" },
];

const LABELS = ["", "Very poor", "Poor", "Average", "Good", "Excellent"];

export default function FeedbackPage() {
  const [type, setType] = useState("ai_response");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await analyticsAPI.submitFeedback(type, null, rating, comment);
      setSubmitted(true);
    } catch {
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <PatientPage max="max-w-lg">
        <Surface className="p-10 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: T.success }} />
          <h2 className="text-xl font-semibold" style={{ fontFamily: "Syne, sans-serif", color: T.ink }}>
            Thank you
          </h2>
          <p className="text-sm mt-2" style={{ color: T.inkMid }}>
            Your feedback helps us improve RuralCare AI for every community.
          </p>
          <PatientBtn
            className="mt-6"
            variant="ghost"
            onClick={() => { setSubmitted(false); setRating(0); setComment(""); }}
          >
            Share more feedback
          </PatientBtn>
        </Surface>
      </PatientPage>
    );
  }

  return (
    <PatientPage max="max-w-lg">
      <PageHeader
        title="Share feedback"
        subtitle="Help us improve RuralCare AI with a short, honest rating."
      />

      <Surface className="p-5 space-y-5">
        <div>
          <SectionLabel>What are you rating?</SectionLabel>
          <div className="space-y-2 mt-1">
            {FEEDBACK_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className="w-full text-left p-3.5 rounded-2xl border transition-all duration-300"
                style={{
                  borderColor: type === t.value ? T.teal : T.border,
                  background: type === t.value ? T.tealSoft : T.surfaceRaised,
                }}
              >
                <p className="text-sm font-semibold" style={{ color: T.ink }}>{t.label}</p>
                <p className="text-xs mt-0.5" style={{ color: T.inkLight }}>{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Rating</FieldLabel>
          <div className="flex gap-1.5" role="group" aria-label="Star rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                onClick={() => setRating(n)}
              >
                <Star
                  className="w-8 h-8 transition-colors"
                  style={{
                    color: n <= rating ? T.warn : T.border,
                    fill: n <= rating ? T.warn : "transparent",
                  }}
                />
              </button>
            ))}
          </div>
          <p className="text-xs mt-1.5" style={{ color: T.inkLight }}>
            {rating === 0 ? "Tap to rate" : LABELS[rating]}
          </p>
        </div>

        <div>
          <FieldLabel>Comment (optional)</FieldLabel>
          <FieldTextarea
            rows={3}
            placeholder="What worked well? What can we improve?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {error && <p className="text-sm" style={{ color: T.danger }}>{error}</p>}

        <PatientBtn onClick={handleSubmit} disabled={submitting || rating === 0} className="w-full">
          <Send className="w-4 h-4" />
          {submitting ? "Submitting…" : "Submit feedback"}
        </PatientBtn>
      </Surface>
    </PatientPage>
  );
}
