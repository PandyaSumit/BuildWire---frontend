type StatItem = {
  label: string;
  value: string | number;
  accent?: "default" | "danger" | "warning" | "success" | "info";
  onClick?: () => void;
  title?: string;
};

type StatsBarProps = {
  stats: StatItem[];
  className?: string;
};

/**
 * Compact horizontal strip of labelled stat pills.
 * Used in RFIs, Inspections, Team, and other list pages for at-a-glance KPIs.
 */
export function StatsBar({ stats, className = "" }: StatsBarProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {stats.map((s) => {
        const container =
          s.accent === "danger"
            ? "border-danger/20 bg-danger/[0.05] text-secondary"
            : s.accent === "warning"
              ? "border-warning/20 bg-warning/[0.05] text-secondary"
              : s.accent === "success"
                ? "border-success/20 bg-success/[0.05] text-secondary"
                : s.accent === "info"
                  ? "border-info/20 bg-info/[0.05] text-secondary"
                  : "border-border/70 bg-surface text-secondary";

        const valueColor =
          s.accent === "danger"
            ? "text-danger"
            : s.accent === "warning"
              ? "text-warning"
              : s.accent === "success"
                ? "text-success"
                : s.accent === "info"
                  ? "text-info"
                  : "text-primary";

        const inner = (
          <>
            <span className={`font-semibold tabular-nums ${valueColor}`}>{s.value}</span>
            <span className="text-secondary">{s.label}</span>
          </>
        );

        const base = `inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12.5px] shadow-token-xs ${container}`;

        if (s.onClick) {
          return (
            <button
              key={s.label}
              type="button"
              title={s.title}
              onClick={s.onClick}
              className={`${base} cursor-pointer transition-colors duration-150 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35`}
            >
              {inner}
            </button>
          );
        }
        return (
          <span key={s.label} className={base} title={s.title}>
            {inner}
          </span>
        );
      })}
    </div>
  );
}
