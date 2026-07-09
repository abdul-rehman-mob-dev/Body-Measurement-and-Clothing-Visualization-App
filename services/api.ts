import axios from 'axios';
import { auth } from './firebase';
import { Platform } from 'react-native';

// Android physical device ke liye computer ka IP address
const getBaseUrl = () => {
  const customUrl = process.env.EXPO_PUBLIC_API_URL;
  if (customUrl) return customUrl;

  if (Platform.OS === 'android') {
    return 'http://192.168.100.27:3000';
  }
  return 'http://localhost:3000';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach Firebase token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try refreshing
      const user = auth.currentUser;
      if (user) {
        try {
          const newToken = await user.getIdToken(true);
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return api(error.config);
        } catch {
          // Refresh failed, user needs to re-authenticate
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
