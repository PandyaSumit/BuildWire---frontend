import type { ReactNode } from 'react';

export type KpiStatCardProps = {
  label: string;
  value: string;
  sublabel?: string;
  trend?: ReactNode;
  accent?: 'default' | 'success' | 'warning' | 'danger';
};

const accentBorder: Record<NonNullable<KpiStatCardProps['accent']>, string> = {
  default: 'border-border',
  success: 'border-success/40',
  warning: 'border-warning/50',
  danger: 'border-danger/50',
};

export function KpiStatCard({ label, value, sublabel, trend, accent = 'default' }: KpiStatCardProps) {
  return (
    <div
      className={`rounded-xl border bg-surface p-4 shadow-sm ${accentBorder[accent]}`}
    >
      <p className="font-[family-name:var(--font-ibm-plex)] text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="font-[family-name:var(--font-kpi-mono)] text-2xl font-semibold tabular-nums text-primary">{value}</p>
        {trend && <div className="text-xs text-secondary">{trend}</div>}
      </div>
      {sublabel && <p className="mt-1 text-xs text-secondary">{sublabel}</p>}
    </div>
  );
}
