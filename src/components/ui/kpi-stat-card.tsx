import type { ReactNode } from 'react';

export type KpiStatCardProps = {
  label: string;
  value: string;
  sublabel?: string;
  trend?: ReactNode;
  /** Optional icon rendered in a tinted circle top-right */
  icon?: ReactNode;
  accent?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  /** Replace top border with a colored left-side accent bar */
  accentBar?: boolean;
};

const accentBorderTop: Record<NonNullable<KpiStatCardProps['accent']>, string> = {
  default: 'border-t-border',
  success: 'border-t-success/50',
  warning: 'border-t-warning/50',
  danger:  'border-t-danger/50',
  info:    'border-t-info/50',
};

const accentBarLeft: Record<NonNullable<KpiStatCardProps['accent']>, string> = {
  default: 'bg-border',
  success: 'bg-success',
  warning: 'bg-warning',
  danger:  'bg-danger',
  info:    'bg-info',
};

const accentIcon: Record<NonNullable<KpiStatCardProps['accent']>, string> = {
  default: 'bg-muted/10 text-muted',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger:  'bg-danger/10 text-danger',
  info:    'bg-info/10 text-info',
};

export function KpiStatCard({
  label,
  value,
  sublabel,
  trend,
  icon,
  accent = 'default',
  accentBar = false,
}: KpiStatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-border/70 bg-surface shadow-token-sm ${
        !accentBar ? `border-t-2 ${accentBorderTop[accent]}` : 'border-t-0'
      }`}
    >
      {/* Left accent bar (optional) */}
      {accentBar && (
        <span
          className={`absolute inset-y-0 start-0 w-[3px] rounded-s-xl ${accentBarLeft[accent]}`}
          aria-hidden
        />
      )}

      <div className={`p-4 ${accentBar ? 'ps-5' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <p className="font-[family-name:var(--font-ibm-plex)] text-[11px] font-semibold uppercase tracking-[0.07em] text-muted">
            {label}
          </p>
          {icon && (
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg [&>svg]:h-3.5 [&>svg]:w-3.5 ${accentIcon[accent]}`}>
              {icon}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-end justify-between gap-2">
          <p className="font-[family-name:var(--font-kpi-mono)] text-2xl font-semibold tabular-nums leading-none text-primary">
            {value}
          </p>
          {trend && <div className="text-xs text-secondary">{trend}</div>}
        </div>

        {sublabel && (
          <p className="mt-1.5 text-[11.5px] leading-snug text-secondary">{sublabel}</p>
        )}
      </div>
    </div>
  );
}
