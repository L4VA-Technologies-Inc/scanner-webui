import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useAuth } from '../context/AuthContext'; // Adjust path if needed

// Assume the API base URL is http://localhost:3000
// TODO: Make this configurable, perhaps via environment variables
const API_BASE_URL = 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to add the Authorization header dynamically
apiClient.interceptors.request.use(
  (config) => {
    // IMPORTANT: Cannot call hooks like useAuth() directly inside interceptors.
    // Instead, we get the key directly from localStorage for the interceptor.
    // The AuthContext hook should still be the source of truth in components.
    const apiKey = localStorage.getItem('scannerApiKey');

    if (apiKey) {
      config.headers.Authorization = `Bearer ${apiKey}`;
    }
    // Ensure Content-Type is set if not already present (good practice)
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
