type StatItem = {
  label: string;
  value: string | number;
  accent?: 'default' | 'danger' | 'warning' | 'success';
};

type StatsBarProps = {
  stats: StatItem[];
  className?: string;
};

/**
 * Compact horizontal strip of labelled stat pills.
 * Used in RFIs, Inspections, Team, and other list pages for at-a-glance KPIs.
 */
export function StatsBar({ stats, className = '' }: StatsBarProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {stats.map((s) => {
        const accentClass =
          s.accent === 'danger'
            ? 'border-danger/25 bg-danger/5 text-secondary'
            : s.accent === 'warning'
              ? 'border-warning/25 bg-warning/5 text-secondary'
              : s.accent === 'success'
                ? 'border-success/25 bg-success/5 text-secondary'
                : 'border-border bg-surface text-secondary';
        const valueClass =
          s.accent === 'danger'
            ? 'text-danger'
            : s.accent === 'warning'
              ? 'text-warning'
              : s.accent === 'success'
                ? 'text-success'
                : 'text-primary';
        return (
          <span
            key={s.label}
            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm ${accentClass}`}
          >
            <span className={`font-semibold tabular-nums ${valueClass}`}>{s.value}</span>
            <span>{s.label}</span>
          </span>
        );
      })}
    </div>
  );
}
