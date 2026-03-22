import { Link } from "react-router-dom";
import {
  DUMMY_INSPECTION_STATS,
  DUMMY_RFIS_STATS,
  DUMMY_SCHEDULE_PHASES,
} from "@/features/project-ui/projectDummyData";

/** Sample rollup — replace with API fields later. */
const SCHEDULE_VARIANCE_DAYS = -4;

function MiniProgress({
  value,
  max,
  tone,
}: {
  value: number;
  max: number;
  tone: "default" | "success" | "warning" | "danger";
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const fill =
    tone === "success"
      ? "bg-success"
      : tone === "warning"
        ? "bg-warning"
        : tone === "danger"
          ? "bg-danger"
          : "bg-brand/60";
  return (
    <div className="h-2 overflow-hidden rounded-full bg-muted/20">
      <div className={`h-full rounded-full ${fill}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function OverviewRollups({ projectId }: { projectId: string }) {
  const base = `/projects/${projectId}`;
  const slip = SCHEDULE_VARIANCE_DAYS;
  const slipAbs = Math.abs(slip);
  const slipTone =
    slip > 0 ? "success" : slip < 0 ? "danger" : "secondary";

  const upcomingPhases = [...DUMMY_SCHEDULE_PHASES]
    .filter((p) => p.progress < 100)
    .sort((a, b) => a.progress - b.progress)
    .slice(0, 2);

  const rfiOpenRatio = DUMMY_RFIS_STATS.open / DUMMY_RFIS_STATS.total;
  const rfiTone: "default" | "warning" | "danger" =
    rfiOpenRatio > 0.65 ? "danger" : rfiOpenRatio > 0.45 ? "warning" : "default";

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h2 className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-primary">
            Schedule
          </h2>
          <Link
            to={`${base}/schedule`}
            className="shrink-0 text-xs font-medium text-brand hover:underline"
          >
            Open
          </Link>
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`font-[family-name:var(--font-kpi-mono)] text-3xl font-semibold tabular-nums ${
              slipTone === "danger"
                ? "text-danger"
                : slipTone === "success"
                  ? "text-success"
                  : "text-primary"
            }`}
          >
            {slip < 0 ? `−${slipAbs}d` : slip > 0 ? `+${slip}d` : "0d"}
          </span>
          <span className="text-xs text-secondary">vs baseline</span>
        </div>
        <p className="mt-1 text-xs text-muted">
          {slip < 0
            ? "Behind planned dates — review the critical path in Schedule."
            : slip > 0
              ? "Ahead of baseline."
              : "On baseline."}
        </p>
        <ul className="mt-4 space-y-2 border-t border-border/60 pt-3">
          {upcomingPhases.map((p) => (
            <li key={p.name} className="text-sm">
              <p className="font-medium text-primary">{p.milestone}</p>
              <p className="text-xs text-muted">
                {p.name} · {p.progress}% complete
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h2 className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-primary">
            RFIs
          </h2>
          <Link
            to={`${base}/rfis`}
            className="shrink-0 text-xs font-medium text-brand hover:underline"
          >
            Open
          </Link>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <p className="text-xs text-muted">Open</p>
            <p className="font-[family-name:var(--font-kpi-mono)] text-xl font-semibold tabular-nums text-primary">
              {DUMMY_RFIS_STATS.open}
              <span className="text-sm font-normal text-muted">
                {" "}
                / {DUMMY_RFIS_STATS.total}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Overdue</p>
            <p className="font-[family-name:var(--font-kpi-mono)] text-xl font-semibold tabular-nums text-danger">
              {DUMMY_RFIS_STATS.overdue}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Avg response</p>
            <p className="font-[family-name:var(--font-kpi-mono)] text-xl font-semibold tabular-nums text-primary">
              {DUMMY_RFIS_STATS.avgResponseDays}d
            </p>
          </div>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[11px] text-muted">
            <span>Open share</span>
            <span className="tabular-nums">
              {Math.round(rfiOpenRatio * 100)}%
            </span>
          </div>
          <MiniProgress
            value={DUMMY_RFIS_STATS.open}
            max={DUMMY_RFIS_STATS.total}
            tone={rfiTone === "danger" ? "danger" : rfiTone === "warning" ? "warning" : "default"}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h2 className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-primary">
            Inspections
          </h2>
          <Link
            to={`${base}/inspections`}
            className="shrink-0 text-xs font-medium text-brand hover:underline"
          >
            Open
          </Link>
        </div>
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-xs text-muted">Pass rate</p>
            <p className="font-[family-name:var(--font-kpi-mono)] text-3xl font-semibold tabular-nums text-success">
              {DUMMY_INSPECTION_STATS.passRate}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Scheduled</p>
            <p className="font-[family-name:var(--font-kpi-mono)] text-3xl font-semibold tabular-nums text-primary">
              {DUMMY_INSPECTION_STATS.scheduled}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-[11px] text-muted">
            <span>Pass rate</span>
            <span>{DUMMY_INSPECTION_STATS.passRate}%</span>
          </div>
          <MiniProgress
            value={DUMMY_INSPECTION_STATS.passRate}
            max={100}
            tone="success"
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          {DUMMY_INSPECTION_STATS.total} total inspections on record.
        </p>
      </div>
    </section>
  );
}
