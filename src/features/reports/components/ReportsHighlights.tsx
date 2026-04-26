import { Badge } from '@/shared/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/shared/components/ui/Card';

interface ReportsHighlightsProps {
  items: string[];
}

export function ReportsHighlights({ items }: ReportsHighlightsProps) {
  return (
    <Card>
      <CardHeader title="Hallazgos locales" actions={<Badge variant="blue">{items.length} insights</Badge>} />
      <CardBody>
        <div className="insights-list">
          {items.map((item) => (
            <div key={item} className="insight-item">
              <span className="insight-dot" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
