import axios from 'axios';
import { useAuthContext } from '@asgardeo/auth-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function createAxiosInstance() {
  const { getAccessToken } = useAuthContext();

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add Bearer token from Asgardeo
  axiosInstance.interceptors.request.use(
    async (config) => {
      try {
        const token = await getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting access token:', error);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor to handle 401 errors
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        window.location.href = '/';
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
}

// Create a default instance for module-level exports
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
