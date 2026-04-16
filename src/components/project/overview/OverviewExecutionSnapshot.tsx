import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { taskWorkflowTKey, type TaskColumn } from "@/features/tasks/fixtures";
import type { OverviewTaskStats } from "@/utils/project/overviewTaskStats";

const COL_INCOMPLETE: Record<
  Exclude<TaskColumn, "done" | "void">,
  string
> = {
  open: "bg-muted/55",
  in_progress: "bg-brand/55",
  in_review: "bg-warning/45",
  blocked: "bg-danger/50",
  awaiting_inspection: "bg-secondary/40",
};

const PRIORITY_ORDER = ["critical", "high", "medium", "low"] as const;

function CompletionRing({ pct }: { pct: number }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const dash = Math.min(1, Math.max(0, pct / 100)) * c;
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        role="img"
        aria-label={`Task completion ${pct} percent`}
      >
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          className="stroke-border"
          strokeWidth="10"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          className="stroke-success transition-[stroke-dasharray] duration-500"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-[family-name:var(--font-kpi-mono)] text-2xl font-semibold tabular-nums text-primary">
          {pct}%
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
          done
        </span>
      </div>
    </div>
  );
}

export function OverviewExecutionSnapshot({
  projectId,
  stats,
}: {
  projectId: string;
  stats: OverviewTaskStats;
}) {
  const { t } = useTranslation();
  const base = `/projects/${projectId}`;
  const p = stats.priorityIncomplete;
  const priMax = Math.max(1, p.critical + p.high + p.medium + p.low);

  const incSum = stats.incompleteByColumn.reduce((a, x) => a + x.count, 0) || 1;

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-primary">
            Execution snapshot
          </h2>
          <p className="mt-1 max-w-xl text-xs text-secondary">
            Visual summary from the current task sample — delays and incomplete work.
            Use{" "}
            <Link
              to={`${base}/tasks`}
              className="font-medium text-brand hover:underline"
            >
              Tasks
            </Link>{" "}
            for the full board and lists.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,220px)_1fr]">
        <div className="flex flex-col items-center gap-3 border-b border-border pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
          <CompletionRing pct={stats.completionPct} />
          <dl className="grid w-full gap-1 text-center text-xs sm:grid-cols-3 lg:grid-cols-1 lg:text-left">
            <div className="rounded-lg bg-bg/60 px-2 py-1.5">
              <dt className="text-muted">Total</dt>
              <dd className="font-semibold tabular-nums text-primary">
                {stats.total}
              </dd>
            </div>
            <div className="rounded-lg bg-bg/60 px-2 py-1.5">
              <dt className="text-muted">Complete</dt>
              <dd className="font-semibold tabular-nums text-success">
                {stats.completed}
              </dd>
            </div>
            <div className="rounded-lg bg-bg/60 px-2 py-1.5">
              <dt className="text-muted">Incomplete</dt>
              <dd className="font-semibold tabular-nums text-primary">
                {stats.incomplete}
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-6 min-w-0">
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Incomplete by stage
              </h3>
              <span className="text-xs text-muted">{stats.incomplete} open</span>
            </div>
            <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted/15">
              {stats.incompleteByColumn.map((row) => {
                const w = (row.count / incSum) * 100;
                if (w <= 0) return null;
                const stageLabel = t(taskWorkflowTKey(row.id));
                return (
                  <div
                    key={row.id}
                    title={`${stageLabel}: ${row.count}`}
                    className={`${COL_INCOMPLETE[row.id as Exclude<TaskColumn, "done" | "void">]} h-full min-w-[3px] transition-all`}
                    style={{ width: `${w}%` }}
                  />
                );
              })}
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-secondary">
              {stats.incompleteByColumn.map((row) => (
                <li key={row.id} className="inline-flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-sm ${COL_INCOMPLETE[row.id as Exclude<TaskColumn, "done" | "void">]}`}
                  />
                  {t(taskWorkflowTKey(row.id))}{" "}
                  <span className="tabular-nums font-medium text-primary">
                    {row.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Priority (incomplete only)
            </h3>
            <div className="space-y-2">
              {PRIORITY_ORDER.map((key) => {
                const n = p[key];
                const pct = Math.round((n / priMax) * 100);
                return (
                  <div key={key}>
                    <div className="mb-0.5 flex justify-between text-[11px] capitalize">
                      <span className="text-secondary">{key}</span>
                      <span className="tabular-nums text-muted">{n}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted/15">
                      <div
                        className={
                          key === "critical"
                            ? "h-full rounded-full bg-danger"
                            : key === "high"
                              ? "h-full rounded-full bg-warning"
                              : key === "medium"
                                ? "h-full rounded-full bg-brand/50"
                                : "h-full rounded-full bg-muted/50"
                        }
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-bg/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Delays & blockers
              </h3>
              <div className="flex gap-3 text-xs">
                <span>
                  <span className="text-muted">Overdue </span>
                  <span className="font-semibold text-danger tabular-nums">
                    {stats.overdueIncomplete}
                  </span>
                </span>
                <span>
                  <span className="text-muted">Blocked </span>
                  <span className="font-semibold tabular-nums text-primary">
                    {stats.blockedIncomplete}
                  </span>
                </span>
              </div>
            </div>
            {stats.overdueSamples.length > 0 ? (
              <ul className="mt-3 space-y-2 border-t border-border/50 pt-3">
                {stats.overdueSamples.map((t) => (
                  <li
                    key={t.number}
                    className="flex flex-wrap items-baseline justify-between gap-2 text-sm"
                  >
                    <span className="font-mono text-xs text-muted">{t.number}</span>
                    <span className="min-w-0 flex-1 truncate text-primary">
                      {t.title}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-danger">
                      {t.due}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-secondary">
                No overdue incomplete tasks in this sample.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
