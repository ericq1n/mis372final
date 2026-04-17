import axios from 'axios';
import { useAuthContext } from '@asgardeo/auth-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create default instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store token setter function
let getAccessTokenFn: (() => Promise<string>) | null = null;

// Set the token getter function (called from a component)
export function setTokenGetter(fn: () => Promise<string>) {
  getAccessTokenFn = fn;
}

// Request interceptor to add Bearer token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      if (getAccessTokenFn) {
        const token = await getAccessTokenFn();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
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

export function createAxiosInstance() {
  const { getAccessToken } = useAuthContext();

  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add Bearer token from Asgardeo
  instance.interceptors.request.use(
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

  return instance;
}

export default axiosInstance;
