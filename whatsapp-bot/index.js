/**
 * RuralCare AI WhatsApp Bot
 * ──────────────────────────
 * Lightweight Express server that:
 * 1. Receives Meta webhook POSTs
 * 2. Forwards to the main backend /api/whatsapp/webhook
 * 3. Or handles directly if running standalone
 *
 * Setup (free):
 *   1. Go to developers.facebook.com
 *   2. Create App → Add WhatsApp product
 *   3. Get Phone Number ID + Temporary Token
 *   4. Set webhook URL: https://your-domain.com/webhook
 *   5. Verify token: ruralcare_verify_2024
 *   6. Subscribe to: messages
 *
 * For local testing use: ngrok http 3001
 */

require("dotenv").config();
const express = require("express");
const axios   = require("axios");

const app          = express();
const PORT         = process.env.PORT || 3001;
const BACKEND_URL  = process.env.BACKEND_API_URL || "http://localhost:5000/api";
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "ruralcare_verify_2024";

app.use(express.json());

// ── Webhook verification (GET) ────────────────────────────────────────────────
app.get("/webhook", (req, res) => {
  const mode      = req.query["hub.mode"];
  const token     = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ WhatsApp webhook verified");
    return res.status(200).send(challenge);
  }
  console.log("❌ Webhook verification failed. Token mismatch.");
  res.sendStatus(403);
});

// ── Incoming messages (POST) ──────────────────────────────────────────────────
app.post("/webhook", async (req, res) => {
  // Must respond immediately
  res.sendStatus(200);

  try {
    // Forward to main backend
    await axios.post(`${BACKEND_URL}/whatsapp/webhook`, req.body, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });
  } catch (err) {
    console.error("Failed to forward to backend:", err.message);
  }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "RuralCare WhatsApp Bot", port: PORT });
});

app.listen(PORT, () => {
  console.log(`📱 RuralCare WhatsApp Bot listening on port ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`For production: use ngrok or deploy to Render`);
});
