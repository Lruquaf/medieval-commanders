// Centralized API client with environment-aware logging
import axios from 'axios';

const getApiBaseUrl = () => {
  let baseUrl;

  if (import.meta.env.VITE_API_URL) {
    baseUrl = import.meta.env.VITE_API_URL;
  } else if (import.meta.env.DEV) {
    const isBrowser = typeof window !== 'undefined' && window.location;
    const devHost = isBrowser ? window.location.hostname : 'localhost';
    const devProtocol = isBrowser ? window.location.protocol : 'http:';
    const preferHttps = devProtocol === 'https:';
    baseUrl = `${preferHttps ? 'https' : 'http'}://${devHost}:5001`;
  } else {
    baseUrl = 'https://medieval-commanders-production.up.railway.app';
  }

  return String(baseUrl || '').replace(/\/$/, '');
};

export const API_BASE_URL = getApiBaseUrl();

// Allow verbose logs in dev only if explicitly enabled
const DEV_VERBOSE = Boolean(import.meta.env.DEV) && String(import.meta.env.VITE_DEBUG_API || '').toLowerCase() === 'true';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 100000,
  headers: { 'Content-Type': 'application/json' }
});

export const uploadClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: { 'Content-Type': 'multipart/form-data' }
});

const responseInterceptor = (response) => {
  if (DEV_VERBOSE) {
    // Only log minimal info in dev when enabled
    // Avoid dumping entire response data objects to keep console readable
    // eslint-disable-next-line no-console
    console.log('API Response', {
      url: response?.config?.url,
      method: response?.config?.method,
      status: response?.status,
    });
  }
  return response;
};

const errorInterceptor = (error) => {
  // Always keep a concise error log; avoid PII
  if (DEV_VERBOSE || import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.error('API Error', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      code: error.code,
      timeout: error.code === 'ECONNABORTED'
    });
  }
  return Promise.reject(error);
};

const requestInterceptor = (config) => {
  if (DEV_VERBOSE) {
    // eslint-disable-next-line no-console
    console.log('API Request', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      timeout: config.timeout,
    });
  }
  return config;
};

const requestErrorInterceptor = (error) => Promise.reject(error);

apiClient.interceptors.response.use(responseInterceptor, errorInterceptor);
uploadClient.interceptors.response.use(responseInterceptor, errorInterceptor);
apiClient.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
uploadClient.interceptors.request.use(requestInterceptor, requestErrorInterceptor);

export default apiClient;


