import axios, { type AxiosError } from 'axios';
import type { ApiError } from '@/types';

export class AppError extends Error {
  public status: number;
  public code: string;
  public serverMessage: string;

  constructor(error: AxiosError<ApiError>) {
    const data = error.response?.data;
    const message = data?.message ?? 'Error de conexión con el servidor';
    super(message);
    this.name = 'AppError';
    this.status = error.response?.status ?? 0;
    this.code = data?.code ?? 'INTERNAL_ERROR';
    this.serverMessage = message;
  }

  static from(error: unknown): AppError {
    if (error instanceof AppError) return error;
    if (axios.isAxiosError(error)) return new AppError(error as AxiosError<ApiError>);
    if (error instanceof Error) {
      const custom = new AppError({ response: undefined } as AxiosError<ApiError>);
      custom.message = error.message;
      custom.serverMessage = error.message;
      return custom;
    }
    return new AppError({ response: undefined } as AxiosError<ApiError>);
  }

  get isConflict() {
    return this.status === 409;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isValidation() {
    return this.code === 'VALIDATION_ERROR';
  }
}
