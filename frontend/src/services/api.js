import axios from 'axios';

// Automatically detect whether running in local development or deployed production
const isLocalhost = Boolean(
  typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]'
  )
);

const defaultBaseUrl = isLocalhost
  ? 'http://127.0.0.1:8000'
  : 'https://vitaguard-ai-explainable-health.onrender.com';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultBaseUrl,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const getApiError = (err, defaultMsg = 'Something went wrong') => {
  return err.response?.data?.detail || defaultMsg;
};

export default API;
