import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { chatAPI } from "../../services/index";
import { Send, Bot, User, AlertCircle, FileText, Activity, Pill, Sparkles } from "lucide-react";
import useAnalytics from "../../hooks/useAnalytics";
import {
  PatientPage, Surface, SectionLabel, SoftChip, Disclaimer, T,
} from "../../components/patient/ui";

const LANG_GREETINGS = {
  hindi: "नमस्ते! मैं RuralCare AI हूँ। आप अपनी स्वास्थ्य समस्या बता सकते हैं।",
  english: "Hello! I am RuralCare AI. How can I help with your health today?",
  bhojpuri: "प्रणाम! हम RuralCare AI हईं। का समस्या बा?",
  awadhi: "नमस्कार! मैं RuralCare AI हौं। का तकलीफ है?",
  bengali: "নমস্কার! আমি RuralCare AI। আপনার কীভাবে সাহায্য করতে পারি?",
  marathi: "नमस्कार! मी RuralCare AI आहे। आपली समस्या सांगा.",
  tamil: "வணக்கம்! நான் RuralCare AI. உங்கள் பிரச்சனை என்ன?",
  telugu: "నమస్కారం! నేను RuralCare AI. మీకు ఏమి సహాయం చేయాలి?",
};

const QUICK = [
  "Mujhe bukhar hai",
  "Sir dard ho raha hai",
  "Pet mein dard",
  "Khansi aur nazla",
  "BP check karna hai",
];

export default function ChatPage() {
  const { user } = useAuth();
  const { track } = useAnalytics();
  const lang = user?.preferredLanguage || "hindi";
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", content: LANG_GREETINGS[lang] || LANG_GREETINGS.hindi, timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { id: Date.now(), role: "user", content: text.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await chatAPI.sendMessage({ message: text.trim(), sessionId });
      const { response, sessionId: sid } = res.data.data;
      if (!sessionId) setSessionId(sid);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: response, timestamp: new Date() },
      ]);
      track("chat_message", { language: lang });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "We couldn't reach the assistant right now. Please check your connection and try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const isEmergency = (text) =>
    /108|emergency|chest pain|unconscious|accident|ambulance|सीने|बेहोश/i.test(text || "");

  return (
    <PatientPage max="max-w-3xl">
      <Surface className="overflow-hidden flex flex-col" style={{ minHeight: "calc(100vh - 11rem)" }}>
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between gap-3 border-b"
          style={{ borderColor: T.borderSoft, background: `linear-gradient(135deg, ${T.tealSoft}, ${T.surfaceRaised})` }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 rc-pulse-soft"
              style={{ background: T.teal, color: "#fff" }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: T.ink, fontFamily: "Syne, sans-serif" }}>
                AI Health Assistant
              </p>
              <p className="text-[11px] mt-0.5 flex items-center gap-1.5" style={{ color: T.success }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.success }} />
                Online · {lang}
              </p>
            </div>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider hidden sm:block" style={{ color: T.inkLight }}>
            AI-supported guidance
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-5 py-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: msg.role === "assistant" ? T.tealSoft : T.bgAlt,
                  color: msg.role === "assistant" ? T.teal : T.inkMid,
                }}
              >
                {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`max-w-[82%] flex flex-col gap-1.5 ${msg.role === "user" ? "items-end" : ""}`}>
                <div
                  className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={{
                    background: msg.role === "assistant" ? T.surfaceRaised : T.teal,
                    color: msg.role === "assistant" ? T.ink : "#fff",
                    border: msg.role === "assistant" ? `1px solid ${T.border}` : "none",
                  }}
                >
                  {msg.content}
                </div>
                {msg.role === "assistant" && isEmergency(msg.content) && (
                  <a
                    href="tel:108"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border"
                    style={{ background: "#FEF2F2", borderColor: "#FECACA", color: T.danger }}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    Call 108 — Free Ambulance
                  </a>
                )}
                <p className="text-[10px]" style={{ color: T.inkLight }}>
                  {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  {msg.role === "assistant" ? " · AI-generated" : ""}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: T.tealSoft, color: T.teal }}>
                <Bot className="w-4 h-4" />
              </div>
              <div className="rounded-2xl border px-4 py-3" style={{ borderColor: T.border, background: T.surfaceRaised }}>
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: T.inkLight, animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick actions + prompts */}
        <div className="px-4 md:px-5 pb-2 space-y-3 border-t pt-3" style={{ borderColor: T.borderSoft }}>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { to: "/patient/reports", label: "📎 Upload report" },
              { to: "/patient/symptoms", label: "🩺 Check symptoms" },
              { to: "/patient/history", label: "💊 Medications" },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap"
                style={{ borderColor: T.border, background: T.surfaceRaised, color: T.inkMid }}
              >
                {a.label}
              </Link>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {QUICK.map((q) => (
              <SoftChip key={q} onClick={() => sendMessage(q)}>{q}</SoftChip>
            ))}
          </div>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              ref={inputRef}
              className="flex-1 rounded-full border px-5 py-3 text-sm outline-none"
              style={{ borderColor: T.border, background: T.bg, color: T.ink }}
              placeholder="Describe your symptoms or ask a health question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              aria-label="Message"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-white disabled:opacity-50"
              style={{ background: T.teal }}
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <Disclaimer />
        </div>
      </Surface>
    </PatientPage>
  );
}
