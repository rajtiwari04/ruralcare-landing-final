import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 30000,
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem("rc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("rc_token");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
export const authAPI = {
  register:       (data)      => api.post("/auth/register", data),
  login:          (data)      => api.post("/auth/login", data),
  getMe:          ()          => api.get("/auth/me"),
  requestOTP:     ()          => api.post("/auth/request-otp"),
  verifyOTP:      (otp)       => api.post("/auth/verify-otp", { otp }),
  linkTelegramOTP:(data)      => api.post("/auth/link-telegram-otp", data),
};
