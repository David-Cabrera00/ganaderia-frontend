import { Badge } from '@/shared/components/ui/Badge';
import type { DashboardHealthItem } from '@/features/dashboard/types/dashboard.types';

interface DashboardHealthCardProps {
  item: DashboardHealthItem;
}

export function DashboardHealthCard({ item }: DashboardHealthCardProps) {
  const variant = item.tone === 'danger' ? 'red' : item.tone === 'warning' ? 'yellow' : item.tone === 'success' ? 'green' : 'blue';

  return (
    <article className={`dashboard-health-card ${item.tone}`}>
      <div className="dashboard-health-card-top">
        <span className="dashboard-health-title">{item.title}</span>
        <Badge variant={variant}>{item.value}</Badge>
      </div>
      <p className="dashboard-health-description">{item.description}</p>
    </article>
  );
}
