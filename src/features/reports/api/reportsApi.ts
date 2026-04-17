import { apiClient } from "../../../shared/api/apiClient";
import type { ApiResponse } from "../../../shared/types/api.types";
import type {
  ExportReportRequest,
  ReportRow,
} from "../types/report.types";

export const getReports = async (): Promise<ReportRow[]> => {
  const response = await apiClient.get<ApiResponse<ReportRow[]>>("/reports");
  return response.data.data;
};

export const exportReports = async (
  payload: ExportReportRequest,
): Promise<Blob> => {
  const response = await apiClient.post("/reports/export", payload, {
    responseType: "blob",
  });

  return response.data;
};