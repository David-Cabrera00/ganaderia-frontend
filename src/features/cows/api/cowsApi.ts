import { apiClient } from "../../../shared/api/apiClient";
import type { ApiResponse } from "../../../shared/types/api.types";
import type { Cow, CreateCowRequest, UpdateCowRequest, CowStatus } from "../types/cow.types";

export const getCows = async (): Promise<Cow[]> => {
  const response = await apiClient.get<ApiResponse<Cow[]>>("/cows");
  return response.data.data;
};

export const getCowById = async (id: number): Promise<Cow> => {
  const response = await apiClient.get<ApiResponse<Cow>>(`/cows/${id}`);
  return response.data.data;
};

export const getCowsByStatus = async (status: CowStatus): Promise<Cow[]> => {
  const response = await apiClient.get<ApiResponse<Cow[]>>(`/cows/status/${status}`);
  return response.data.data;
};

export const createCow = async (payload: CreateCowRequest): Promise<Cow> => {
  const response = await apiClient.post<ApiResponse<Cow>>("/cows", payload);
  return response.data.data;
};

export const updateCow = async (id: number, payload: UpdateCowRequest): Promise<Cow> => {
  const response = await apiClient.put<ApiResponse<Cow>>(`/cows/${id}`, payload);
  return response.data.data;
};