// utils/api.js - UPDATED
import axios from "axios";

const getBaseURL = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || "https://pump-backend-xn6u.onrender.com";
  }
  // In development, use empty string - let proxy handle /api prefix
  return ""; 
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
      console.log("🔐 Token added to:", config.url);
    }
    
    console.log("🔄 API Call:", {
      method: config.method?.toUpperCase(),
      url: config.baseURL + config.url,
      proxyTarget: "http://localhost:5002/api" + config.url
    });
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;