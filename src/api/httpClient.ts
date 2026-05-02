import axios, { AxiosError } from 'axios';


const API_URL =
  import.meta.env.VITE_API_URL?.trim() || 'http://localhost:8080';
  console.log('API_URL FRONTEND:', API_URL);
  
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
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config) => {
  const raw = localStorage.getItem('ganaderia_session');

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.session?.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      
    }
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(AppError.from(error)),
);