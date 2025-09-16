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
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      code: error.code,
      data: error.response?.data,
      timeout: error.code === 'ECONNABORTED'
    });
    return Promise.reject(error);
  }
);

// Add request interceptor to log requests
apiClient.interceptors.request.use(
  (config) => {
    console.log('🌐 API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;
