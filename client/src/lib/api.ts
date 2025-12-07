import axios from 'axios';

export const API_BASE_URL = "http://localhost:3000";

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

export const initializeApi = async () => {
  // Keep the logic if needed, but for now simple check might suffice or just rely on axios base url
  // If dynamic URL switching is needed, we can update api.defaults.baseURL
  const renderUrl = "https://ai-meeting-companion.onrender.com";
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(renderUrl, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      api.defaults.baseURL = renderUrl;
      console.log("Connected to Render Backend:", renderUrl);
    }
  } catch (error) {
    console.warn("Using localhost fallback.");
  }
};

export const getApiUrl = () => api.defaults.baseURL || API_BASE_URL;
