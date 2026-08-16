# RuralCare AI — WhatsApp Bot

Free WhatsApp integration using Meta Cloud API.

## Setup (15 minutes, free)

### Step 1 — Create Meta App
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create App → Business type
3. Add product → WhatsApp

### Step 2 — Configure Webhook
1. Go to WhatsApp → Configuration → Webhook
2. Set Callback URL: `https://your-domain.ngrok.io/webhook`
3. Set Verify token: `ruralcare_verify_2024`
4. Subscribe to: `messages`

### Step 3 — Get credentials
Copy from WhatsApp → API Setup:
- Phone Number ID → `WHATSAPP_PHONE_NUMBER_ID`
- Temporary Access Token → `WHATSAPP_TOKEN`

### Step 4 — Run locally with ngrok
```bash
# Terminal 1
ngrok http 3001

# Terminal 2
cp .env.example .env   # fill in your credentials
npm install
npm run dev
```

## User Commands

Users send these in WhatsApp:
```
LINK 9876543210 mypassword   → Link account + get OTP
HELP                          → Show all commands
SYMPTOM                       → Report symptoms
HISTORY                       → View recent records
```

Or just type symptoms in any language — AI responds automatically.

## Features
- Text chat → AI health responses (8 languages)
- Voice notes → STT → AI analysis
- Photo/PDF → OCR → AI report summary
- Daily health tips (9 AM broadcast)
- Emergency keyword detection → 108 routing
