import api from "./api";
export { authAPI } from "./api";
export default api;

export const patientAPI = {
  getProfile:         ()           => api.get("/patient/profile"),
  getDashboard:       ()           => api.get("/patient/dashboard"),
  getHealthHistory:   (params)     => api.get("/patient/health-history", { params }),
  getHealthScore:     ()           => api.get("/patient/health-score"),
  updateProfile:      (data)       => api.put("/patient/profile", data),
  getReminders:       ()           => api.get("/patient/medication-reminders"),
  createReminder:     (data)       => api.post("/patient/medication-reminders", data),
  getChronicDiseases: ()           => api.get("/patient/chronic-diseases"),
};

export const chatAPI = {
  sendMessage:        (data)       => api.post("/chat/message", data),
  analyzeSymptoms:    (data)       => api.post("/chat/analyze-symptoms", data),
  getHistory:         (params)     => api.get("/chat/history", { params }),
};

export const reportAPI = {
  upload:  (formData) => api.post("/reports", formData, { headers:{"Content-Type":"multipart/form-data"}, timeout:120000 }),
  getAll:  (params)   => api.get("/reports", { params }),
  getOne:  (id)       => api.get(`/reports/${id}`),
  delete:  (id)       => api.delete(`/reports/${id}`),
};

export const appointmentAPI = {
  listDoctors:        (params)     => api.get("/appointments/doctors", { params }),
  book:               (data)       => api.post("/appointments", data),
  getMyList:          (params)     => api.get("/appointments", { params }),
  getDoctorList:      (params)     => api.get("/appointments/doctor", { params }),
  updateStatus:       (id, data)   => api.put(`/appointments/${id}/status`, data),
};

export const doctorAPI = {
  getDashboard:       ()           => api.get("/doctor/dashboard"),
  getPatients:        (params)     => api.get("/doctor/patients", { params }),
  getPatientDetail:   (id)         => api.get(`/doctor/patients/${id}`),
};

export const healthWorkerAPI = {
  getDashboard:       ()           => api.get("/health-worker/dashboard"),
  getPatients:        ()           => api.get("/health-worker/patients"),
  getHighRisk:        ()           => api.get("/health-worker/high-risk"),
};

export const adminAPI = {
  getDashboard:       ()           => api.get("/admin/dashboard"),
  getUsers:           (params)     => api.get("/admin/users", { params }),
  updateUserRole:     (id, role)   => api.put(`/admin/users/${id}/role`, { role }),
  getAlerts:          ()           => api.get("/admin/alerts"),
};

export const notificationAPI = {
  getAll:             (params)     => api.get("/notifications", { params }),
  markRead:           (id)         => api.put(`/notifications/${id}/read`),
  markAllRead:        ()           => api.put("/notifications/mark-all-read"),
};

export const prescriptionAPI = {
  create:        (data)       => api.post("/prescriptions", data),
  getDoctorList: ()           => api.get("/prescriptions/doctor"),
  getPatientList:()           => api.get("/prescriptions/patient"),
  getById:       (id)         => api.get(`/prescriptions/${id}`),
};

export const labAPI = {
  order:         (data)       => api.post("/lab/order", data),
  getDoctorList: ()           => api.get("/lab/doctor"),
  getPatientList:()           => api.get("/lab/patient"),
  uploadResult:  (id, form)   => api.post(`/lab/${id}/result`, form, { headers: { "Content-Type": "multipart/form-data" } }),
};

export const maternalAPI = {
  getRecord:     ()           => api.get("/maternal"),
  updateRecord:  (data)       => api.post("/maternal", data),
};

export const nutritionAPI = {
  getPlans:      ()           => api.get("/nutrition"),
  generatePlan:  (data)       => api.post("/nutrition/generate", data),
};

export const schemesAPI = {
  getAll:           ()         => api.get("/schemes"),
  checkEligibility: (data)     => api.post("/schemes/check-eligibility", data),
};

export const leaderboardAPI = {
  getLeaderboard:   (params)   => api.get("/leaderboard", { params }),
};

export const heatmapAPI = {
  getHeatmap:       ()         => api.get("/heatmap"),
};

export const teleconsultAPI = {
  start:            (data)     => api.post("/teleconsult/start", data),
  getMySessions:    ()         => api.get("/teleconsult/my-sessions"),
  generateSoapNotes:(id, data) => api.post(`/teleconsult/${id}/soap-notes`, data),
};
