import axios from "axios";

const getBaseURL = () => {
  if (import.meta.env.PROD) {
    // In production, use your deployed backend URL
    return import.meta.env.VITE_API_URL || "https://pump-backend-xn6u.onrender.com/api";
  }
  // In development, use proxy
  return "/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
