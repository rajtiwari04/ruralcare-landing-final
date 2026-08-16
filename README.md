# 🏥 RuralCare AI

> Multilingual AI-powered healthcare platform for rural and underserved communities in India.
> **6 Phases · 130+ files · 8 languages · 4 user roles · 0 monthly cost**

---

## 📦 Tech Stack

| Layer            | Technology                                                        |
|------------------|-------------------------------------------------------------------|
| Frontend         | React 18, Tailwind CSS, React Router, PWA (Service Workers)       |
| Backend          | Node.js, Express.js                                               |
| Database         | MongoDB Atlas (M0 free)                                           |
| AI               | DeepSeek via OpenRouter                                           |
| STT              | Groq Whisper API (free) + Faster-Whisper local fallback           |
| OCR              | Tesseract.js (images) + pdf-parse (PDFs)                          |
| Telegram Bot     | Telegraf                                                          |
| WhatsApp Bot     | Meta Cloud API (free)                                             |
| Video Calls      | WebRTC + Socket.IO                                                |
| PDF Generation   | pdf-lib                                                           |
| IVR Phone        | Twilio TwiML                                                      |
| File Storage     | Cloudinary (free tier)                                            |
| Scheduling       | node-cron (8 automated jobs)                                      |
| Deployment       | Vercel (frontend) + Render (backend + bots)                       |

---

## 🗂 Project Structure

```
ruralcare-ai/
├── backend/                    # Node.js + Express API (Phase 1–6)
│   ├── config/                 # DB, Cloudinary, OpenRouter
│   ├── controllers/            # 12 controllers
│   ├── services/               # 11 services (AI, OCR, STT, Analytics...)
│   ├── models/                 # 16 MongoDB schemas
│   ├── routes/                 # 10 route files
│   ├── middleware/             # Auth, upload, RBAC
│   └── jobs/                   # 8 cron jobs
│
├── frontend/                   # React + Tailwind
│   └── src/
│       ├── pages/              # 25+ pages across all roles
│       ├── layouts/            # DashboardLayout (sidebar nav)
│       ├── hooks/              # useOfflineSync, useAnalytics
│       ├── services/           # API layers (index.js, phase3_4.js, phase5_6.js)
│       └── context/            # AuthContext
│
├── telegram-bot/               # Telegraf bot (Phase 2)
├── whatsapp-bot/               # Meta Cloud API bot (Phase 6)
└── stt_server.py               # Faster-Whisper local STT (optional)
```

---

## 🚀 Quick Start

```bash
# 1. Backend
cd backend && npm install && cp .env.example .env
# Fill in .env (MongoDB, OpenRouter, Cloudinary, Telegram)
npm run dev

# 2. Frontend
cd frontend && npm install && npm run dev

# 3. Telegram Bot
cd telegram-bot && npm install && node index.js

# 4. WhatsApp Bot (optional)
cd whatsapp-bot && npm install && node index.js

# 5. STT Sidecar (optional — for local voice without Groq)
pip install faster-whisper flask requests
python stt_server.py
```

---

## 👥 User Roles & Access

| Role         | Key Features                                                         |
|--------------|----------------------------------------------------------------------|
| Patient      | AI chat, symptoms, reports, appointments, insights, nutrition, schemes |
| Doctor       | Patient list, appointments, prescriptions, lab orders, telemedicine  |
| Health Worker| Assigned patients, high-risk alerts, leaderboard, daily summaries    |
| Admin        | System analytics, disease alerts, heatmap, user management           |

---

## 📱 Access Channels (Phase 6)

| Channel       | How                          | Users Reached              |
|---------------|------------------------------|----------------------------|
| Web App       | localhost:5173 or Vercel URL | Smartphone users           |
| Telegram Bot  | @GramSwasthya_ai_bot         | 500M+ Telegram users       |
| WhatsApp Bot  | WhatsApp Business number     | 400M+ WhatsApp India users |
| Voice IVR     | Twilio phone number          | Non-smartphone users       |
| PWA           | "Add to Home Screen"         | Offline-capable            |

---

## ⚙️ Automated Jobs (8 cron tasks)

| Schedule          | Task                                          |
|-------------------|-----------------------------------------------|
| Every minute      | Medication reminder check                     |
| Daily 7 AM        | Health worker daily summary                   |
| Daily 8 AM        | Maternal health / ANC reminders               |
| Daily 9 AM        | WhatsApp health tip broadcast                 |
| Daily 10 AM       | Vaccination due reminders                     |
| Daily 6 PM        | Epidemic prediction scan                      |
| Midnight daily    | Disease surveillance                          |
| Sunday 11 PM      | Village leaderboard scoring                   |
| Sunday 10 PM      | Weekly district health reports                |
| Monday 9 AM       | Pending lab test reminders                    |
| Nightly 2 AM      | AI diagnostic insights generation             |
| Every 5 minutes   | Offline PWA sync queue processing             |

---

## 🌐 Environment Variables

See `backend/.env.example` for the full list. Minimum required:

```env
MONGODB_URI=...
JWT_SECRET=...
OPENROUTER_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
TELEGRAM_BOT_TOKEN=...
GROQ_API_KEY=...          # free at console.groq.com
```

Optional (for Phase 4+):
```env
TWILIO_ACCOUNT_SID=...
WHATSAPP_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
```

---

## 📊 Phase Summary

| Phase | Features                                                        | Status |
|-------|-----------------------------------------------------------------|--------|
| 1     | Auth, AI Chat, Symptoms, Reports (OCR), Health History         | ✅ Done |
| 2     | Telegram Bot, Medication Reminders, Appointments               | ✅ Done |
| 3     | Telemedicine (WebRTC), AI Scribe, Prescriptions (PDF), Lab Tests | ✅ Done |
| 4     | Disease Heatmap, Voice IVR, Govt Schemes, Leaderboard, Nutrition | ✅ Done |
| 5     | Analytics Dashboard, AI Insights, Feedback System             | ✅ Done |
| 6     | WhatsApp Bot, PWA Offline Mode, Offline Sync Engine           | ✅ Done |

---

## 🏗 Seed Test Users

```bash
cd backend && node scripts/seed-users.js
```

| Role          | Phone        | Password    | URL               |
|---------------|--------------|-------------|-------------------|
| Patient       | 9000000004   | patient123  | /patient          |
| Doctor        | 9000000001   | doctor123   | /doctor           |
| Health Worker | 9000000003   | worker123   | /health-worker    |
| Admin         | 9000000002   | admin123    | /admin            |
