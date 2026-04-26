export type { DashboardSummary, AlertResponse, CollarResponse, CowResponse, LocationResponse } from '@/types';

export interface DashboardKpiItem {
  label: string;
  value: string;
  tone: 'default' | 'danger' | 'warning' | 'success' | 'info';
  helper: string;
}

export interface DashboardHealthItem {
  title: string;
  value: string;
  description: string;
  tone: 'success' | 'warning' | 'danger' | 'info';
}

export interface DashboardWatchItem {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  tone: 'success' | 'warning' | 'danger' | 'info';
}
