import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/me"),
};

export const meetingAPI = {
  create: (data) => api.post("/meetings", data),
  getAll: () => api.get("/meetings"),
  getById: (id) => api.get(`/meetings/${id}`),
  updateStatus: (id, status) => api.put(`/meetings/${id}`, { status }),
  cancel: (id) => api.delete(`/meetings/${id}`),
};

export const waitingRoomAPI = {
  join: (meetingId) => api.post("/waiting-room/join", { meetingId }),
  getList: (meetingId) => api.get(`/waiting-room/list/${meetingId}`),
  admit: (waitingRoomId) => api.put(`/waiting-room/admit/${waitingRoomId}`),
};

export default api;
