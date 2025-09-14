// API configuration
import axios from 'axios';

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  let baseUrl;
  
  // If VITE_API_URL is set, use it (for Netlify deployment)
  if (import.meta.env.VITE_API_URL) {
    baseUrl = import.meta.env.VITE_API_URL;
  }
  // In development, use localhost
  else if (import.meta.env.DEV) {
    baseUrl = 'http://localhost:5001';
  }
  // In production, use Railway backend URL
  // This will be overridden by VITE_API_URL in Netlify
  else {
    baseUrl = 'https://medieval-commanders-production.up.railway.app';
  }
  
  // Ensure no trailing slash to prevent double slashes
  return baseUrl.replace(/\/$/, '');
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('Backend server is not reachable. Please check if the backend is running.');
    }
    
    // Handle CORS errors
    if (error.message.includes('CORS')) {
      console.error('CORS error. Please check backend CORS configuration.');
    }
    
    return Promise.reject(error);
  }
);

// Add request interceptor to log requests
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;
