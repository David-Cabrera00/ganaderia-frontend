import type { ReactNode } from 'react';
import { Badge } from '@/shared/components/ui/Badge';

interface DashboardMetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
  tone?: 'default' | 'danger' | 'warning' | 'success' | 'info';
}

export function DashboardMetricCard({
  icon,
  label,
  value,
  helper,
  tone = 'default',
}: DashboardMetricCardProps) {
  const badgeVariant = tone === 'danger' ? 'red' : tone === 'warning' ? 'yellow' : tone === 'success' ? 'green' : tone === 'info' ? 'blue' : 'gray';

  return (
    <article className={`dashboard-kpi-card ${tone !== 'default' ? tone : ''}`}>
      <div className="dashboard-kpi-icon">{icon}</div>
      <div className="dashboard-kpi-copy">
        <span className="dashboard-kpi-label">{label}</span>
        <strong className="dashboard-kpi-value">{value}</strong>
        <span className="dashboard-kpi-helper">{helper}</span>
      </div>
      {tone !== 'default' ? <Badge variant={badgeVariant}>{tone === 'danger' ? 'Atención' : tone === 'warning' ? 'Seguimiento' : tone === 'success' ? 'Estable' : 'Monitoreo'}</Badge> : null}
    </article>
  );
}
