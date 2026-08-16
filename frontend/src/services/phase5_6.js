import api from "./api";

// ─── Analytics & Insights ─────────────────────────────────────────────────────
export const analyticsAPI = {
  track:              (eventType, properties) =>
    api.post("/analytics/track", { eventType, properties }),
  getSystemMetrics:   (days = 30) =>
    api.get("/analytics/system", { params: { days } }),
  getDistrictMetrics: (district, days = 14) =>
    api.get("/analytics/district", { params: { district, days } }),
  getTopSymptoms:     (days = 14, district) =>
    api.get("/analytics/top-symptoms", { params: { days, district } }),

  getMyInsights:      ()     => api.get("/analytics/insights"),
  generateInsights:   (id)   => api.post(`/analytics/insights/generate${id ? "/" + id : ""}`),
  markInsightRead:    (id)   => api.put(`/analytics/insights/${id}/read`),

  submitFeedback:     (type, refId, rating, comment) =>
    api.post("/analytics/feedback", { feedbackType: type, referenceId: refId, rating, comment }),
  getFeedbackStats:   (days = 30) =>
    api.get("/analytics/feedback/stats", { params: { days } }),
};

// ─── Offline Sync ─────────────────────────────────────────────────────────────
export const syncAPI = {
  queueActions:  (actions)  => api.post("/sync/queue", { actions }),
  processQueue:  ()         => api.post("/sync/process"),
  getStatus:     ()         => api.get("/sync/status"),
};

// ─── WhatsApp Status ──────────────────────────────────────────────────────────
export const whatsappAPI = {
  getStatus: () => api.get("/whatsapp/status"),
};
