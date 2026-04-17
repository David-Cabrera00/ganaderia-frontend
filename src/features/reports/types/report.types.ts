export interface ReportRow {
  id: number;
  title: string;
  category: string;
  createdAt?: string;
  description?: string;
}

export interface ReportFilterValues {
  category?: string;
  startDate?: string;
  endDate?: string;
}

export interface ExportReportRequest {
  category?: string;
  startDate?: string;
  endDate?: string;
}