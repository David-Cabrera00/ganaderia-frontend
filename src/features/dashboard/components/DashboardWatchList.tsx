import { Badge } from '@/shared/components/ui/Badge';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import type { DashboardWatchItem } from '@/features/dashboard/types/dashboard.types';

interface DashboardWatchListProps {
  title: string;
  items: DashboardWatchItem[];
  emptyTitle: string;
  emptyDescription: string;
}

export function DashboardWatchList({
  title,
  items,
  emptyTitle,
  emptyDescription,
}: DashboardWatchListProps) {
  return (
    <section className="card">
      <div className="card-header">
        <span className="card-title">{title}</span>
        <Badge variant={items.length > 0 ? 'yellow' : 'green'}>{items.length}</Badge>
      </div>
      <div className="card-body">
        {items.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          <div className="dashboard-watch-list">
            {items.map((item) => (
              <article key={item.id} className={`dashboard-watch-item ${item.tone}`}>
                <div className="dashboard-watch-dot" />
                <div className="dashboard-watch-copy">
                  <strong>{item.title}</strong>
                  <span>{item.subtitle}</span>
                  <small>{item.meta}</small>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
