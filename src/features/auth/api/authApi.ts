import { apiClient } from "../../../shared/api/apiClient";
import type { ApiResponse } from "../../../shared/types/api.types";
import type { AuthUser, LoginRequest, LoginResponseData } from "../types/auth.types";

export const login = async (payload: LoginRequest): Promise<LoginResponseData> => {
  const response = await apiClient.post<ApiResponse<LoginResponseData>>("/auth/login", payload);
  return response.data.data;
};

export const getCurrentUser = async (): Promise<AuthUser> => {
  const response = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");
  return response.data.data;
};