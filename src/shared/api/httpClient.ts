import axios from 'axios';
import { setupHttpInterceptors } from '@/shared/api/interceptors';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const httpClient = setupHttpInterceptors(
  axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  }),
);
