import type { ReactNode } from 'react';
import { Badge } from '@/shared/components/ui/Badge';

interface DashboardMetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
  tone?: 'default' | 'danger' | 'warning' | 'success' | 'info';
}

const badgeLabelByTone = {
  danger: 'Atención',
  warning: 'Seguimiento',
  success: 'Estable',
  info: 'Monitoreo',
  default: 'Operativo',
};

export function DashboardMetricCard({
  icon,
  label,
  value,
  helper,
  tone = 'default',
}: DashboardMetricCardProps) {
  const badgeVariant =
    tone === 'danger'
      ? 'red'
      : tone === 'warning'
      ? 'yellow'
      : tone === 'success'
      ? 'green'
      : tone === 'info'
      ? 'blue'
      : 'gray';

  return (
    <article className={`dashboard-kpi-card dashboard-kpi-premium ${tone}`}>
      <div className="dashboard-kpi-glow" />

      <div className="dashboard-kpi-top">
        <div className="dashboard-kpi-icon">{icon}</div>

        <Badge variant={badgeVariant}>
          {badgeLabelByTone[tone]}
        </Badge>
      </div>

      <div className="dashboard-kpi-copy">
        <span className="dashboard-kpi-label">{label}</span>

        <strong className="dashboard-kpi-value">
          {value}
        </strong>

        <span className="dashboard-kpi-helper">
          {helper}
        </span>
      </div>
    </article>
  );
}