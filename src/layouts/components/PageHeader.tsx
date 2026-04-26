import type { ReactNode } from 'react';
import { Badge } from '@/shared/components/ui/Badge';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  badge?: string;
  eyebrow?: string;
}

export function PageHeader({ title, subtitle, actions, badge, eyebrow }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header-content">
        <div>
          {eyebrow ? <span className="page-eyebrow">{eyebrow}</span> : null}
          <div className="page-title-row">
            <h1 className="page-title">{title}</h1>
            {badge ? <Badge variant="green">{badge}</Badge> : null}
          </div>
          {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="page-header-actions">{actions}</div> : null}
      </div>
    </div>
  );
}
