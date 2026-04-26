import axios, { AxiosError } from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL?.trim() || 'http://localhost:8080';

export class AppError extends Error {
  serverMessage: string;
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.serverMessage = message;
    this.status = status;
    this.details = details;
  }

  static from(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      const status = axiosError.response?.status;
      const data = axiosError.response?.data;

      const serverMessage =
        data?.message ||
        data?.error ||
        (typeof data === 'string' ? data : null) ||
        axiosError.message ||
        'Ocurrió un error inesperado.';

      return new AppError(serverMessage, status, data);
    }

    if (error instanceof Error) {
      return new AppError(error.message);
    }

    return new AppError('Ocurrió un error inesperado.');
  }
}

export const httpClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config) => {
  const authKeys = [
    'auth-storage',
    'ganaderia_local_session',
    'ganaderia_session',
    'user',
  ];

  let token: string | null = null;

  for (const key of authKeys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);

      token =
        parsed?.state?.session?.token ||
        parsed?.session?.token ||
        parsed?.token ||
        null;

      if (token) break;
    } catch {
      continue;
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(AppError.from(error)),
);