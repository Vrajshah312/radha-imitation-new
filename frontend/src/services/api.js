import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/api",
});

// Attach the auth token and the active data mode (demo | live) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("radha_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["X-Data-Mode"] = localStorage.getItem("radha_data_mode") || "demo";
  return config;
});

export default api;
