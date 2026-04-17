import { apiClient } from "@/shared/api/apiClient";
import type { ApiResponse } from "@/shared/types/api.types";
import type { CreateUserRequest, User } from "../types/user.types";

export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<ApiResponse<User[]>>("/users");
  return response.data.data;
};

export const createUser = async (payload: CreateUserRequest): Promise<User> => {
  const response = await apiClient.post<ApiResponse<User>>("/users", payload);
  return response.data.data;
};

export const getUsersByActive = async (active: boolean): Promise<User[]> => {
  const response = await apiClient.get<ApiResponse<User[]>>(`/users/active/${active}`);
  return response.data.data;
};