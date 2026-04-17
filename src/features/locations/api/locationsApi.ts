import { apiClient } from "../../../shared/api/apiClient";
import type { ApiResponse } from "../../../shared/types/api.types";
import type {
  CreateLocationRequest,
  Location,
} from "../types/location.types";

export const getLocations = async (): Promise<Location[]> => {
  const response = await apiClient.get<ApiResponse<Location[]>>("/locations");
  return response.data.data;
};

export const getLocationById = async (id: number): Promise<Location> => {
  const response = await apiClient.get<ApiResponse<Location>>(`/locations/${id}`);
  return response.data.data;
};

export const createLocation = async (
  payload: CreateLocationRequest,
): Promise<Location> => {
  const response = await apiClient.post<ApiResponse<Location>>(
    "/locations",
    payload,
  );
  return response.data.data;
};