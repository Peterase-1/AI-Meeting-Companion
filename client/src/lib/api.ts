import axios from 'axios';

export const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:7000"
  : ""; // In production (Nginx), we use relative paths. The proxy handles /api -> server:7000

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getApiUrl = () => api.defaults.baseURL || API_BASE_URL;

// Update 2025-12-22 12:43:00: chore(ci): update build timeout
