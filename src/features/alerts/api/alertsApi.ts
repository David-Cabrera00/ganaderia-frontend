import { apiClient } from "../../../shared/api/apiClient";
import type { ApiResponse } from "../../../shared/types/api.types";
import type {
  Alert,
  AlertStatus,
  CreateAlertRequest,
  ResolveAlertRequest,
} from "../types/alert.types";

export const getAlerts = async (): Promise<Alert[]> => {
  const response = await apiClient.get<ApiResponse<Alert[]>>("/alerts");
  return response.data.data;
};

export const getAlertById = async (id: number): Promise<Alert> => {
  const response = await apiClient.get<ApiResponse<Alert>>(`/alerts/${id}`);
  return response.data.data;
};

export const getAlertsByStatus = async (status: AlertStatus): Promise<Alert[]> => {
  const response = await apiClient.get<ApiResponse<Alert[]>>(`/alerts/status/${status}`);
  return response.data.data;
};

export const createAlert = async (payload: CreateAlertRequest): Promise<Alert> => {
  const response = await apiClient.post<ApiResponse<Alert>>("/alerts", payload);
  return response.data.data;
};

export const resolveAlert = async (
  id: number,
  payload: ResolveAlertRequest,
): Promise<Alert> => {
  const response = await apiClient.patch<ApiResponse<Alert>>(
    `/alerts/${id}/resolve`,
    payload,
  );
  return response.data.data;
};