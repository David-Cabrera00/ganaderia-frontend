import { apiClient } from "../../../shared/api/apiClient";
import type { ApiResponse } from "../../../shared/types/api.types";
import type {
  CriticalAlert,
  DashboardSummary,
  OfflineCollar,
  RecentLocation,
} from "../types/dashboard.types";

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await apiClient.get<ApiResponse<DashboardSummary>>("/dashboard/summary");
  return response.data.data;
};

export const getCriticalAlerts = async (): Promise<CriticalAlert[]> => {
  const response = await apiClient.get<ApiResponse<CriticalAlert[]>>("/dashboard/critical-alerts");
  return response.data.data;
};

export const getOfflineCollars = async (): Promise<OfflineCollar[]> => {
  const response = await apiClient.get<ApiResponse<OfflineCollar[]>>("/dashboard/collars-offline");
  return response.data.data;
};

export const getRecentLocations = async (): Promise<RecentLocation[]> => {
  const response = await apiClient.get<ApiResponse<RecentLocation[]>>("/dashboard/recent-locations");
  return response.data.data;
};