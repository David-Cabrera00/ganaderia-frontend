import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import type { ApiError } from '@/types';

let interceptorsConfigured = false;

export const setupHttpInterceptors = (client: AxiosInstance) => {
  if (interceptorsConfigured) return client;
  interceptorsConfigured = true;

  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const { session } = useAuthStore.getState();
      if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
      return config;
    },
    async (error) => Promise.reject(error),
  );

  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: { response?: { status?: number; data?: ApiError } }) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().clearSession();
        window.location.replace('/login');
      }
      return Promise.reject(error);
    },
  );

  return client;
};
