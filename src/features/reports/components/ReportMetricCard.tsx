import type { ReactNode } from 'react';

type ReportMetricTone = 'default' | 'success' | 'warning' | 'danger';

interface ReportMetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  tone?: ReportMetricTone;
}

const toneStyles: Record<ReportMetricTone, { borderTop: string; iconBg: string; iconColor: string; valueColor: string }> = {
  default: { borderTop: '3px solid rgba(91, 140, 255, 0.35)', iconBg: 'rgba(91, 140, 255, 0.08)', iconColor: 'var(--blue)', valueColor: 'var(--text-primary)' },
  success: { borderTop: '3px solid rgba(91, 140, 255, 0.35)', iconBg: 'rgba(91, 140, 255, 0.08)', iconColor: 'var(--blue)', valueColor: 'var(--blue)' },
  warning: { borderTop: '3px solid rgba(214, 179, 106, 0.45)', iconBg: 'rgba(214, 179, 106, 0.10)', iconColor: 'var(--accent)', valueColor: 'var(--accent)' },
  danger: { borderTop: '3px solid rgba(239, 107, 99, 0.45)', iconBg: 'rgba(239, 107, 99, 0.10)', iconColor: 'var(--red)', valueColor: 'var(--red)' },
};

export function ReportMetricCard({ title, value, description, icon, tone = 'default' }: ReportMetricCardProps) {
  const palette = toneStyles[tone];
  return (
    <article className="card" style={{ borderTop: palette.borderTop, minHeight: 170 }}>
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 18, height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{title}</span>
            <strong style={{ fontSize: '2.4rem', lineHeight: 1, fontWeight: 800, color: palette.valueColor }}>{value}</strong>
          </div>
          <div style={{ width: 58, height: 58, borderRadius: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: palette.iconBg, color: palette.iconColor, flexShrink: 0, opacity: 0.95 }}>{icon}</div>
        </div>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>{description}</p>
      </div>
    </article>
  );
}
