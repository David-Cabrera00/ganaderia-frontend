import type { ReactNode } from 'react';
import { TrendingUp } from 'lucide-react';

type ReportMetricTone = 'default' | 'success' | 'warning' | 'danger';

interface ReportMetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  tone?: ReportMetricTone;
}

const toneLabels: Record<ReportMetricTone, string> = {
  default: 'Monitoreo',
  success: 'Estable',
  warning: 'Preventivo',
  danger: 'Crítico',
};

function formatMetricValue(value: string | number) {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('es-CO').format(value);
  }

  return value;
}

export function ReportMetricCard({
  title,
  value,
  description,
  icon,
  tone = 'default',
}: ReportMetricCardProps) {
  return (
    <article className={`report-premium-card report-premium-card-${tone}`}>
      <div className="report-premium-card-glow" />

      <div className="report-premium-card-top">
        <div className="report-premium-icon">
          {icon}
        </div>

        <span className="report-premium-status">
          <TrendingUp size={13} />
          {toneLabels[tone]}
        </span>
      </div>

      <div className="report-premium-content">
        <span className="report-premium-title">{title}</span>

        <strong className="report-premium-value">
          {formatMetricValue(value)}
        </strong>

        <p className="report-premium-description">
          {description}
        </p>
      </div>
    </article>
  );
}