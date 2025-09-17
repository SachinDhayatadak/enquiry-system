import axios from "axios";

// Base URL from .env (fallback to localhost if missing)
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({ baseURL });

// Request Interceptor → Add token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor → Handle errors (401, etc.)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // Auto-redirect
    }
    return Promise.reject(error);
  }
);

export default API;
