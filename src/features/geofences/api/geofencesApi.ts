import { apiClient } from "../../../shared/api/apiClient";
import type { ApiResponse } from "../../../shared/types/api.types";
import type {
  CreateGeofenceRequest,
  Geofence,
  GeofenceStatus,
  UpdateGeofenceRequest,
} from "../types/geofence.types";

export const getGeofences = async (): Promise<Geofence[]> => {
  const response = await apiClient.get<ApiResponse<Geofence[]>>("/geofences");
  return response.data.data;
};

export const getGeofenceById = async (id: number): Promise<Geofence> => {
  const response = await apiClient.get<ApiResponse<Geofence>>(`/geofences/${id}`);
  return response.data.data;
};

export const getGeofencesByStatus = async (
  status: GeofenceStatus,
): Promise<Geofence[]> => {
  const response = await apiClient.get<ApiResponse<Geofence[]>>(
    `/geofences/status/${status}`,
  );
  return response.data.data;
};

export const createGeofence = async (
  payload: CreateGeofenceRequest,
): Promise<Geofence> => {
  const response = await apiClient.post<ApiResponse<Geofence>>(
    "/geofences",
    payload,
  );
  return response.data.data;
};

export const updateGeofence = async (
  id: number,
  payload: UpdateGeofenceRequest,
): Promise<Geofence> => {
  const response = await apiClient.put<ApiResponse<Geofence>>(
    `/geofences/${id}`,
    payload,
  );
  return response.data.data;
};