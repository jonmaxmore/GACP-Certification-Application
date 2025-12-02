import axios, { AxiosInstance } from 'axios';

export interface ApiClientConfig {
  baseURL?: string;
  authTokenKey: string;
  onUnauthorized?: () => void;
  additionalHeaders?: Record<string, string>;
}

export const createApiClient = (config: ApiClientConfig): AxiosInstance => {
  const api = axios.create({
    baseURL: config.baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api',
    headers: {
      'Content-Type': 'application/json',
      ...config.additionalHeaders,
    },
  });

  // Request Interceptor
  api.interceptors.request.use(
    (req) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem(config.authTokenKey);
        if (token) {
          req.headers['Authorization'] = `Bearer ${token}`;
        }
      }
      return req;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        if (typeof window !== 'undefined') {
          // Clear token
          localStorage.removeItem(config.authTokenKey);

          // Handle custom unauthorized logic or default redirect
          if (config.onUnauthorized) {
            config.onUnauthorized();
          } else if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
};

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}
