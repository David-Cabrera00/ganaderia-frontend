import { apiClient } from "../../../shared/api/apiClient";
import type { ApiResponse } from "../../../shared/types/api.types";
import type {
  Collar,
  CreateCollarRequest,
  UpdateCollarRequest,
} from "../types/collar.types";

export const getCollars = async (): Promise<Collar[]> => {
  const response = await apiClient.get<ApiResponse<Collar[]>>("/collars");
  return response.data.data;
};

export const getCollarById = async (id: number): Promise<Collar> => {
  const response = await apiClient.get<ApiResponse<Collar>>(`/collars/${id}`);
  return response.data.data;
};

export const createCollar = async (
  payload: CreateCollarRequest,
): Promise<Collar> => {
  const response = await apiClient.post<ApiResponse<Collar>>("/collars", payload);
  return response.data.data;
};

export const updateCollar = async (
  id: number,
  payload: UpdateCollarRequest,
): Promise<Collar> => {
  const response = await apiClient.put<ApiResponse<Collar>>(
    `/collars/${id}`,
    payload,
  );
  return response.data.data;
};

export const enableCollar = async (id: number): Promise<Collar> => {
  const response = await apiClient.patch<ApiResponse<Collar>>(
    `/collars/${id}/enable`,
  );
  return response.data.data;
};

export const disableCollar = async (id: number): Promise<Collar> => {
  const response = await apiClient.patch<ApiResponse<Collar>>(
    `/collars/${id}/disable`,
  );
  return response.data.data;
};

export const assignCollarToCow = async (
  id: number,
  cowId: number,
): Promise<Collar> => {
  const response = await apiClient.patch<ApiResponse<Collar>>(
    `/collars/${id}/assign/${cowId}`,
  );
  return response.data.data;
};