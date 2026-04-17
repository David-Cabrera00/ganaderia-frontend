export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  error?: string;
  details?: Record<string, string[] | string>;
  timestamp?: string;
}