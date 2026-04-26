import type { DashboardSummary } from '@/types';

export const buildReportsStatus = (summary: DashboardSummary | null) => {
  if (!summary) return 'Sin datos';
  return summary.pendingAlerts > 0 ? 'Requiere seguimiento' : 'Estable';
};
