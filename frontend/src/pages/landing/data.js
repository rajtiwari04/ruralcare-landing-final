import {
  Heart, Mic, FileText, Users, Shield, Brain, Map, Bell,
  AlertTriangle, Globe, Stethoscope, UserCheck, BarChart2, MessageCircle, Phone,
} from "lucide-react";
import { T } from "./tokens";

export const problems = [
  { icon: Stethoscope, title: "Doctor scarcity", desc: "Rural areas have 1 doctor per 10,000+ people in many districts.", metric: "1:10k+" },
  { icon: Globe, title: "Language barriers", desc: "Most medical information is available only in English or urban languages.", metric: "8 langs" },
  { icon: FileText, title: "Unreadable reports", desc: "Patients receive blood reports and prescriptions they cannot understand.", metric: "OCR" },
  { icon: Shield, title: "Fragmented records", desc: "Health history exists on paper across multiple facilities.", metric: "Paper" },
  { icon: Bell, title: "Medication dropout", desc: "Chronic disease patients stop medications without continuous follow-up.", metric: "Remind" },
  { icon: AlertTriangle, title: "Late outbreak detection", desc: "Disease clusters in villages go unnoticed until they become emergencies.", metric: "Early" },
  { icon: Map, title: "Distance to care", desc: "Patients travel hours for consultations that could be triaged remotely.", metric: "Hours" },
  { icon: Brain, title: "Low health literacy", desc: "Medical jargon prevents patients from understanding their own conditions.", metric: "Plain" },
];

export const featureGroups = [
  {
    id: "ai",
    icon: Brain,
    title: "AI Healthcare Assistant",
    color: T.teal,
    blurb: "Clinical understanding across languages — triage, risk, and safe guidance.",
    features: [
      { name: "Symptom analysis & risk assessment", status: "available" },
      { name: "Emergency symptom detection", status: "available" },
      { name: "Multilingual responses (8 languages)", status: "available" },
      { name: "Safe home-care guidance", status: "available" },
      { name: "Follow-up questions & health history", status: "available" },
      { name: "Contextual conversation memory", status: "available" },
    ],
  },
  {
    id: "voice",
    icon: Mic,
    title: "Voice Healthcare",
    color: "#5B4BB7",
    blurb: "Speak symptoms naturally — speech-to-text that meets rural reality.",
    features: [
      { name: "Voice message support on Telegram", status: "available" },
      { name: "Multilingual speech-to-text", status: "available" },
      { name: "Automatic language detection", status: "available" },
      { name: "Voice IVR for non-smartphone users", status: "available" },
      { name: "Real-time voice transcription", status: "development" },
    ],
  },
  {
    id: "reports",
    icon: FileText,
    title: "Medical Report Intelligence",
    color: T.accent,
    blurb: "Upload a report photo — get values explained in plain language.",
    features: [
      { name: "Blood report OCR", status: "available" },
      { name: "AI report summarization", status: "available" },
      { name: "Abnormal value identification", status: "available" },
      { name: "Plain-language explanations", status: "available" },
      { name: "Historical report comparison", status: "planned" },
      { name: "Lab-test ordering by doctors", status: "available" },
    ],
  },
  {
    id: "personal",
    icon: Heart,
    title: "Personal Health",
    color: "#B42318",
    blurb: "A continuous health timeline with reminders and telemedicine access.",
    features: [
      { name: "Digital health timeline", status: "available" },
      { name: "Chronic disease monitoring", status: "available" },
      { name: "Automated medication reminders", status: "available" },
      { name: "Medication adherence tracking", status: "available" },
      { name: "Health score & grade", status: "available" },
      { name: "Telemedicine video calls", status: "available" },
      { name: "Wearable device integration", status: "planned" },
    ],
  },
  {
    id: "doctor",
    icon: Stethoscope,
    title: "Doctor Intelligence",
    color: "#0B6E99",
    blurb: "Arrive prepared — AI summaries, scribe notes, and digital prescriptions.",
    features: [
      { name: "AI-generated patient summaries", status: "available" },
      { name: "Report summaries before consultation", status: "available" },
      { name: "AI medical scribe (SOAP notes)", status: "available" },
      { name: "Prescription PDF generation", status: "available" },
      { name: "Appointment management", status: "available" },
      { name: "EHR integration", status: "planned" },
    ],
  },
  {
    id: "worker",
    icon: UserCheck,
    title: "Healthcare Worker (ASHA/ANM)",
    color: "#1B6B3A",
    blurb: "Village-level priorities — high-risk patients, maternal care, alerts.",
    features: [
      { name: "Auto-assignment by village/district", status: "available" },
      { name: "High-risk patient identification", status: "available" },
      { name: "Telegram new-patient alerts", status: "available" },
      { name: "Maternal & child health tracking", status: "available" },
      { name: "Vaccination schedule management", status: "available" },
      { name: "Village health leaderboard", status: "available" },
    ],
  },
  {
    id: "community",
    icon: Map,
    title: "Community Health Intelligence",
    color: "#7A4B1E",
    blurb: "District signals that surface clusters before they become emergencies.",
    features: [
      { name: "Symptom cluster detection", status: "available" },
      { name: "District-level disease heatmap", status: "available" },
      { name: "AI epidemic prediction (14-day)", status: "available" },
      { name: "Outbreak Telegram alerts", status: "available" },
      { name: "Weekly district health reports", status: "available" },
      { name: "NGO/government data integration", status: "planned" },
    ],
  },
  {
    id: "telegram",
    icon: MessageCircle,
    title: "Telegram Healthcare Channel",
    color: "#0B7EA4",
    blurb: "Healthcare where people already are — chat, voice, reports, reminders.",
    features: [
      { name: "AI chat via Telegram", status: "available" },
      { name: "Voice messages to AI response", status: "available" },
      { name: "Report upload & analysis", status: "available" },
      { name: "Medication reminder push notifications", status: "available" },
      { name: "Outbreak & health alerts", status: "available" },
      { name: "OTP-based account linking", status: "available" },
    ],
  },
];

export const techStack = [
  { name: "React + Tailwind CSS", role: "Patient, Doctor, Worker & Admin interfaces", layer: "Interface" },
  { name: "Node.js + Express", role: "REST API with modular route services", layer: "API" },
  { name: "MongoDB Atlas", role: "Patient records, analytics & notifications", layer: "Data" },
  { name: "Clinical AI / LLM", role: "Chat understanding, analysis & summaries", layer: "Intelligence" },
  { name: "Speech-to-text", role: "Multilingual voice input processing", layer: "Intelligence" },
  { name: "OCR Engine", role: "Blood report & prescription image reading", layer: "Intelligence" },
  { name: "WebRTC + Socket.IO", role: "Real-time telemedicine video sessions", layer: "Care" },
  { name: "Telegram Bot", role: "Notifications, voice messages, reports", layer: "Access" },
  { name: "PDF & cloud storage", role: "Prescription generation & secure storage", layer: "Data" },
];

export const roadmap = [
  { phase: "Phase 1–2", label: "Core + Telegram", done: true, items: ["AI chat (8 languages)", "Voice speech-to-text", "Medical report OCR", "Telegram bot", "Medication reminders", "ASHA auto-assignment"] },
  { phase: "Phase 3–4", label: "Intelligence", done: true, items: ["WebRTC telemedicine", "Prescription PDFs", "Lab test ordering", "Disease heatmap", "Village leaderboard", "Voice IVR"] },
  { phase: "Phase 5–6", label: "Analytics + WhatsApp", done: true, items: ["Analytics dashboard", "AI insights (nightly)", "WhatsApp bot", "PWA offline mode", "Feedback system", "Sync queue"] },
  { phase: "Phase 7", label: "Predictive Health", done: false, items: ["Chronic disease prediction", "Maternal risk AI", "Wearable integration", "Offline-first kiosk mode", "Broader language support"] },
  { phase: "Phase 8", label: "Ecosystem Integration", done: false, items: ["Government scheme auto-enroll", "Hospital resource finder", "NGO data pipelines", "Advanced public health analytics", "Multi-district admin console"] },
];

export const userJourneys = [
  {
    id: "patient",
    role: "Patient",
    icon: Phone,
    color: T.teal,
    bg: T.tealSoft,
    preview: {
      title: "Patient home",
      lines: [
        { k: "Today", v: "Medication reminder · 8:00 PM" },
        { k: "Chat", v: "Fever + cough · risk: medium" },
        { k: "Report", v: "CBC explained in Hindi" },
        { k: "Care", v: "Teleconsult available" },
      ],
    },
    steps: [
      "Registers with phone number, village, district & language preference",
      "Sends symptoms via text or voice in Hindi, Bhojpuri, or 6 other languages",
      "Uploads blood report photo — AI explains values in plain language",
      "Receives medication reminders on Telegram every day",
      "Joins a video telemedicine session with their doctor",
    ],
  },
  {
    id: "worker",
    role: "ASHA / ANM Worker",
    icon: UserCheck,
    color: "#1B6B3A",
    bg: "#EDF7EF",
    preview: {
      title: "Worker dashboard",
      lines: [
        { k: "High risk", v: "4 patients need follow-up" },
        { k: "Village", v: "New registration alert" },
        { k: "ANC", v: "2 visits due this week" },
        { k: "Alert", v: "Fever cluster nearby" },
      ],
    },
    steps: [
      "Receives Telegram alert when a patient from her village registers",
      "Dashboard shows all assigned patients sorted by risk level",
      "Views pending follow-ups, vaccination due dates, and ANC reminders",
      "Checks village health leaderboard score and improvement tips",
      "Receives outbreak alert if a disease cluster is detected nearby",
    ],
  },
  {
    id: "doctor",
    role: "Doctor",
    icon: Stethoscope,
    color: "#0B6E99",
    bg: "#EDF4FB",
    preview: {
      title: "Clinical briefing",
      lines: [
        { k: "Summary", v: "AI patient brief ready" },
        { k: "Labs", v: "Abnormals highlighted" },
        { k: "Rx", v: "Prescription PDF" },
        { k: "Notes", v: "SOAP scribe available" },
      ],
    },
    steps: [
      "Reviews AI-generated patient summary before the consultation",
      "Views uploaded reports with AI interpretation already available",
      "Creates a digital prescription — PDF generated and sent to patient",
      "Starts a telemedicine session from the browser",
      "AI Medical Scribe generates SOAP notes from the transcript",
    ],
  },
  {
    id: "admin",
    role: "Administrator",
    icon: BarChart2,
    color: T.ink,
    bg: "#F0F0F5",
    preview: {
      title: "District console",
      lines: [
        { k: "Heatmap", v: "2 districts elevated" },
        { k: "Users", v: "Role & assignment control" },
        { k: "Weekly", v: "AI district health report" },
        { k: "Signals", v: "Community intelligence" },
      ],
    },
    steps: [
      "Views platform analytics — consultations, languages, risk distribution",
      "Monitors district-level disease heatmap for emerging clusters",
      "Reviews weekly AI-generated district health reports",
      "Manages users, roles, and health worker assignments",
      "Tracks community leaderboard scores by village and district",
    ],
  },
];

export const visionTransforms = [
  { from: "Patient waits weeks for a consultation", to: "AI triage in under 2 minutes" },
  { from: "Blood report is a mystery", to: "Explained in patient's language" },
  { from: "ASHA worker tracks 80 families on paper", to: "Dashboard with risk-sorted priorities" },
  { from: "Disease cluster noticed too late", to: "Surveillance alert sent proactively" },
  { from: "Doctor reviews paper files", to: "AI summary before appointment" },
];

export const safetyPrinciples = [
  {
    icon: Shield,
    title: "Not a replacement",
    desc: "RuralCare AI explicitly recommends professional care when symptoms indicate it. It never claims to diagnose.",
    color: T.teal,
    bg: T.tealSoft,
  },
  {
    icon: UserCheck,
    title: "Role-based access",
    desc: "JWT authentication with strict RBAC. Patients, doctors, workers, and admins see only their relevant data.",
    color: "#0B6E99",
    bg: "#EDF4FB",
  },
  {
    icon: Map,
    title: "Anonymized community data",
    desc: "Disease surveillance uses aggregated, anonymized patterns — never individual patient identifiers.",
    color: "#1B6B3A",
    bg: "#EDF7EF",
  },
  {
    icon: AlertTriangle,
    title: "Uncertainty first",
    desc: "AI responses use qualified language: 'This could indicate...' not 'You have...'. Uncertainty is communicated clearly.",
    color: T.accent,
    bg: T.accentSoft,
  },
];

export const navLinks = [
  { href: "#problem", label: "Problem" },
  { href: "#vision", label: "Vision" },
  { href: "#features", label: "Features" },
  { href: "#technology", label: "Technology" },
  { href: "#roadmap", label: "Roadmap" },
];

export const ecosystemSteps = [
  { icon: Phone, label: "Patient", sub: "Web, Telegram, or IVR" },
  { icon: Mic, label: "Any Input", sub: "Text · Voice · Report" },
  { icon: Brain, label: "AI Understanding", sub: "Clinical analysis" },
  { icon: FileText, label: "Health Insight", sub: "Summarized & translated" },
  { icon: Users, label: "Care Team", sub: "Doctor · ASHA worker" },
  { icon: BarChart2, label: "Community Care", sub: "Disease surveillance" },
];
