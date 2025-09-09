// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Create axios instance with base URL
import axios from 'axios';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
