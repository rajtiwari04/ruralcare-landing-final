module.exports = {
  apiKey:  process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  model:   process.env.OPENROUTER_MODEL    || "deepseek/deepseek-chat",
  headers: { "HTTP-Referer": "https://ruralcare.ai", "X-Title": "RuralCare AI" },
};
