import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  helper: string;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export function MetricCard({ icon, label, value, helper, tone = 'default' }: MetricCardProps) {
  return (
    <article className={cn('overview-card', tone !== 'default' && `overview-card-${tone}`)}>
      <div className="overview-card-icon">{icon}</div>
      <div className="overview-card-copy">
        <span className="overview-card-label">{label}</span>
        <strong className="overview-card-value">{value}</strong>
        <small className="overview-card-helper">{helper}</small>
      </div>
    </article>
  );
}
