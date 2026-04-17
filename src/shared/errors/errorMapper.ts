import { ApiError } from "./ApiError";

interface UnknownApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      details?: Record<string, string[] | string>;
    };
  };
  message?: string;
}

export const mapApiError = (error: unknown): ApiError => {
  const typedError = error as UnknownApiError;

  const status = typedError.response?.status;
  const message =
    typedError.response?.data?.message ||
    typedError.message ||
    "Ha ocurrido un error inesperado.";

  const details = typedError.response?.data?.details;

  return new ApiError(message, status, details);
};