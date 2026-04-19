import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token getter is supplied from a component inside the AuthProvider tree.
// Kept as a module-level reference so every call through axiosInstance
// automatically attaches a fresh bearer token.
let getAccessTokenFn: (() => Promise<string>) | null = null;

export function setTokenGetter(fn: () => Promise<string>) {
  getAccessTokenFn = fn;
}

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

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
