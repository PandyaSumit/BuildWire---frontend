import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Badge } from "@/components/ui/badge";
import { KpiStatCard } from "@/components/ui/kpi-stat-card";
import { ModulePageShell } from "@/components/project";
import { DUMMY_SCHEDULE_PHASES } from "@/services/project/projectDummyData";

type Tab = "timeline" | "milestones" | "workload" | "lookahead";

// ── Rich schedule data ────────────────────────────────────────────────────────
const SCHEDULE_PHASES_EXTENDED = [
  {
    name: "Foundation",
    milestone: "Pour complete — Tower A",
    progress: 100,
    owner: "Ananya",
    planned: { start: 0, dur: 8 },
    actual: { start: 0, dur: 8 },
    float: 0,
    critical: false,
    status: "done" as const,
    children: ["Excavation", "PCC", "Raft", "Columns G+2"],
  },
  {
    name: "Superstructure",
    milestone: "Slab L12 complete",
    progress: 72,
    owner: "Raj",
    planned: { start: 7, dur: 14 },
    actual: { start: 7, dur: 18 },
    float: 0,
    critical: true,
    status: "delayed" as const,
    children: ["L3–L6", "L7–L10", "L11–L12"],
  },
  {
    name: "MEP Rough-in",
    milestone: "Rough-in sign-off",
    progress: 45,
    owner: "Vikram",
    planned: { start: 14, dur: 12 },
    actual: { start: 16, dur: 12 },
    float: 2,
    critical: false,
    status: "in_progress" as const,
    children: ["Electrical", "Plumbing", "HVAC"],
  },
  {
    name: "Finishing",
    milestone: "Sample flat approval",
    progress: 18,
    owner: "Priya",
    planned: { start: 22, dur: 10 },
    actual: { start: 24, dur: 10 },
    float: 3,
    critical: false,
    status: "in_progress" as const,
    children: ["Flooring", "Paint", "Joinery"],
  },
  {
    name: "External Works",
    milestone: "Landscape handover",
    progress: 5,
    owner: "Amit",
    planned: { start: 28, dur: 6 },
    actual: { start: 28, dur: 6 },
    float: 5,
    critical: false,
    status: "not_started" as const,
    children: ["Drainage", "Landscaping", "Parking"],
  },
];

const TOTAL_WEEKS = 34;
const TODAY_WEEK = 22;

const MILESTONES = [
  { name: "Foundation complete", week: 8, done: true, critical: false },
  { name: "Superstructure L12", week: 21, done: false, critical: true, daysLate: 4 },
  { name: "MEP sign-off", week: 26, done: false, critical: false },
  { name: "Sample flat ready", week: 30, done: false, critical: false },
  { name: "Practical completion", week: 34, done: false, critical: false },
];

const WORKLOAD = [
  { name: "Ananya Mehta", role: "PM", tasks: 12, hours: 52 },
  { name: "Raj Kumar", role: "Supervisor", tasks: 8, hours: 48 },
  { name: "Vikram Sinha", role: "MEP Lead", tasks: 11, hours: 44 },
  { name: "Priya Shah", role: "Supervisor", tasks: 6, hours: 40 },
  { name: "Amit Verma", role: "Worker", tasks: 4, hours: 36 },
  { name: "Neha Desai", role: "Architect", tasks: 3, hours: 24 },
];

const LOOKAHEAD_TASKS = [
  { id: "T-048", name: "Pour slab L11 — Zone A", phase: "Superstructure", assignee: "Raj", due: "Apr 1", days: 2, status: "ready" as const },
  { id: "T-049", name: "Install conduit tray — L9", phase: "MEP", assignee: "Vikram", due: "Apr 2", days: 3, status: "ready" as const },
  { id: "T-050", name: "Brick infill — L8 N-elevation", phase: "Superstructure", assignee: "Amit", due: "Apr 3", days: 4, status: "at_risk" as const },
  { id: "T-051", name: "HVAC shaft — L7–L9", phase: "MEP", assignee: "Vikram", due: "Apr 4", days: 5, status: "blocked" as const },
  { id: "T-052", name: "Scaffold strike — L5", phase: "Finishing", assignee: "Raj", due: "Apr 6", days: 7, status: "ready" as const },
  { id: "T-053", name: "Sample flat fit-out", phase: "Finishing", assignee: "Priya", due: "Apr 8", days: 9, status: "at_risk" as const },
  { id: "T-054", name: "Fire stopping — L6", phase: "MEP", assignee: "Vikram", due: "Apr 10", days: 11, status: "ready" as const },
];

const statusColor: Record<string, string> = {
  done: "bg-success",
  delayed: "bg-danger",
  in_progress: "bg-brand",
  not_started: "bg-muted/40",
};

const lookaheadColor: Record<string, string> = {
  ready: "text-success",
  at_risk: "text-warning",
  blocked: "text-danger",
};

const lookaheadBg: Record<string, string> = {
  ready: "border-success/20 bg-success/[0.05]",
  at_risk: "border-warning/25 bg-warning/[0.06]",
  blocked: "border-danger/20 bg-danger/[0.05]",
};

// ── SVG Gantt chart ───────────────────────────────────────────────────────────
function GanttChart() {
  const ROW_H = 38;
  const LABEL_W = 130;
  const todayPct = (TODAY_WEEK / TOTAL_WEEKS) * 100;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        {/* Week header */}
        <div className="flex" style={{ paddingLeft: LABEL_W }}>
          {[0, 8, 16, 24, 32].map((w) => (
            <div
              key={w}
              className="flex-1 border-l border-border/40 px-1 pb-1 text-[10px] text-muted"
            >
              Wk {w}
            </div>
          ))}
          <div className="border-l border-border/40 px-1 pb-1 text-[10px] text-muted">
            Wk {TOTAL_WEEKS}
          </div>
        </div>

        {/* Rows */}
        <div className="relative">
          {SCHEDULE_PHASES_EXTENDED.map((ph) => {
            const plannedLeft = (ph.planned.start / TOTAL_WEEKS) * 100;
            const plannedW = (ph.planned.dur / TOTAL_WEEKS) * 100;
            const actualLeft = (ph.actual.start / TOTAL_WEEKS) * 100;
            const actualW = (ph.actual.dur / TOTAL_WEEKS) * 100;

            return (
              <div
                key={ph.name}
                className="flex items-center border-t border-border/30"
                style={{ height: ROW_H }}
              >
                {/* Label */}
                <div
                  className="flex shrink-0 items-center gap-1.5 pr-2"
                  style={{ width: LABEL_W }}
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${statusColor[ph.status]}`}
                  />
                  <span className="truncate text-[12px] font-medium text-primary">
                    {ph.name}
                  </span>
                  {ph.critical && (
                    <span className="shrink-0 text-[9px] font-bold uppercase text-danger">
                      CP
                    </span>
                  )}
                </div>

                {/* Track */}
                <div className="relative flex-1 self-stretch">
                  {/* Grid lines */}
                  {[8, 16, 24, 32].map((w) => (
                    <div
                      key={w}
                      className="absolute bottom-0 top-0 border-l border-border/20"
                      style={{ left: `${(w / TOTAL_WEEKS) * 100}%` }}
                    />
                  ))}

                  {/* Today line */}
                  <div
                    className="absolute bottom-0 top-0 z-10 border-l-2 border-brand/70"
                    style={{ left: `${todayPct}%` }}
                  />

                  {/* Planned bar (lighter) */}
                  <div
                    className="absolute top-[9px] h-[8px] rounded-sm bg-muted/25"
                    style={{
                      left: `${plannedLeft}%`,
                      width: `${plannedW}%`,
                    }}
                  />

                  {/* Actual bar */}
                  <div
                    className={`absolute top-[20px] h-[8px] rounded-sm ${statusColor[ph.status]} opacity-90`}
                    style={{
                      left: `${actualLeft}%`,
                      width: `${(Math.min(ph.progress / 100, 1) * actualW)}%`,
                    }}
                  />

                  {/* Progress % */}
                  <span
                    className="absolute right-1 text-[10px] tabular-nums text-muted"
                    style={{ top: "50%", transform: "translateY(-50%)" }}
                  >
                    {ph.progress}%
                  </span>
                </div>
              </div>
            );
          })}

          {/* Today label */}
          <div
            className="pointer-events-none absolute bottom-0 top-0 z-20"
            style={{ left: `calc(${LABEL_W}px + ${todayPct}% * (100% - ${LABEL_W}px) / 100)` }}
          >
            <span className="absolute -top-0.5 -translate-x-1/2 rounded bg-brand px-1 py-0.5 text-[9px] font-bold text-white">
              Today
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-5 rounded-sm bg-muted/25" /> Planned
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-5 rounded-sm bg-brand" /> Actual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-0.5 bg-brand/70" /> Today (Wk {TODAY_WEEK})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="font-bold text-danger">CP</span> Critical path
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Milestones view ───────────────────────────────────────────────────────────
function MilestonesView() {
  return (
    <div className="space-y-3">
      {MILESTONES.map((m) => (
        <div
          key={m.name}
          className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${
            m.critical && !m.done
              ? "border-danger/25 bg-danger/[0.04]"
              : "border-border/60 bg-surface"
          }`}
        >
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
              m.done
                ? "bg-success/15 text-success"
                : m.critical
                  ? "bg-danger/15 text-danger"
                  : "bg-muted/15 text-muted"
            }`}
          >
            {m.done ? "✓" : m.critical ? "!" : "○"}
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-primary">{m.name}</p>
            <p className="mt-0.5 text-[11px] text-muted">
              Week {m.week} of {TOTAL_WEEKS}
            </p>
          </div>
          <div className="text-right">
            {m.done ? (
              <Badge variant="success" size="sm">Done</Badge>
            ) : m.daysLate ? (
              <Badge variant="danger" size="sm">{m.daysLate}d late</Badge>
            ) : (
              <Badge variant="secondary" size="sm">
                Wk {m.week - TODAY_WEEK} away
              </Badge>
            )}
          </div>
          <div className="text-right">
            <ProgressBar
              value={m.done ? 100 : Math.max(0, Math.round(((TODAY_WEEK) / m.week) * 100))}
              max={100}
              size="sm"
              className="w-20"
              variant={m.done ? "success" : m.critical ? "danger" : "default"}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Workload view ─────────────────────────────────────────────────────────────
function WorkloadView() {
  const maxHours = Math.max(...WORKLOAD.map((w) => w.hours));
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          This week's load (hrs)
        </p>
        <p className="text-[11px] text-muted">Capacity: 48 hrs/wk</p>
      </div>
      {WORKLOAD.map((w) => {
        const overCapacity = w.hours > 48;
        return (
          <div key={w.name} className="flex items-center gap-3">
            <div className="w-28 shrink-0">
              <p className="text-[12px] font-medium text-primary">{w.name}</p>
              <p className="text-[10px] text-muted">{w.role}</p>
            </div>
            <ProgressBar
              value={w.hours}
              max={maxHours}
              size="md"
              className="flex-1"
              variant={overCapacity ? "danger" : w.hours > 40 ? "warning" : "success"}
            />
            <div className="w-20 text-right">
              <span
                className={`text-[12px] font-semibold tabular-nums ${overCapacity ? "text-danger" : "text-secondary"}`}
              >
                {w.hours}h
              </span>
              <span className="ml-1 text-[10px] text-muted">/ {w.tasks}t</span>
            </div>
          </div>
        );
      })}
      <div className="mt-2 rounded-lg border border-warning/25 bg-warning/[0.05] px-3 py-2 text-[12px] text-secondary">
        <span className="font-medium text-warning">Overloaded:</span> No members exceed 48h capacity this week.
      </div>
    </div>
  );
}

// ── Look-ahead view ───────────────────────────────────────────────────────────
function LookaheadView() {
  const grouped = useMemo(() => {
    const map: Record<string, typeof LOOKAHEAD_TASKS> = {};
    LOOKAHEAD_TASKS.forEach((t) => {
      if (!map[t.phase]) map[t.phase] = [];
      map[t.phase].push(t);
    });
    return map;
  }, []);

  return (
    <div className="space-y-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        2-week look-ahead · Apr 1–14
      </p>
      {Object.entries(grouped).map(([phase, tasks]) => (
        <div key={phase}>
          <p className="mb-2 text-[12px] font-semibold text-secondary">{phase}</p>
          <div className="space-y-1.5">
            {tasks.map((t) => (
              <div
                key={t.id}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${lookaheadBg[t.status]}`}
              >
                <span className="font-mono text-[11px] font-semibold text-brand">
                  {t.id}
                </span>
                <p className="flex-1 text-[13px] text-primary">{t.name}</p>
                <span className="text-[11px] text-muted">
                  {t.assignee}
                </span>
                <span className="text-[11px] text-muted">Due {t.due}</span>
                <span
                  className={`text-[11px] font-semibold capitalize ${lookaheadColor[t.status]}`}
                >
                  {t.status === "at_risk" ? "At risk" : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SchedulePage() {
  const [tab, setTab] = useState<Tab>("timeline");

  return (
    <ModulePageShell>
      <PageHeader
        title="Schedule"
        description="Gantt, milestones, 2-week look-ahead, and workload."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-border/60 px-3 py-2 text-sm text-secondary hover:bg-muted/10 hover:text-primary"
            >
              Baseline
            </button>
            <button
              type="button"
              className="rounded-lg border border-border/60 px-3 py-2 text-sm text-secondary hover:bg-muted/10 hover:text-primary"
            >
              Export PDF
            </button>
          </div>
        }
        toolbar={
          <SegmentedControl
            value={tab}
            onChange={setTab}
            options={[
              { value: "timeline", label: "Timeline" },
              { value: "milestones", label: "Milestones" },
              { value: "lookahead", label: "Look-ahead" },
              { value: "workload", label: "Workload" },
            ]}
          />
        }
      />

      {/* Schedule health KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiStatCard
          label="Overall progress"
          value="58%"
          sublabel="vs 63% planned"
          accent="warning"
        />
        <KpiStatCard
          label="Schedule variance"
          value="-4d"
          sublabel="Superstructure behind baseline"
          accent="danger"
        />
        <KpiStatCard
          label="Milestones on-time"
          value="1 / 5"
          sublabel="4 upcoming · 1 at risk"
          accent="warning"
        />
        <KpiStatCard
          label="Critical path float"
          value="0d"
          sublabel="Superstructure is critical"
          accent="danger"
        />
      </div>

      {/* Main content panel */}
      <div className="rounded-2xl border border-border/60 bg-surface p-5">
        {tab === "timeline" && (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Phase sidebar */}
            <div className="lg:col-span-3">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Phases
              </p>
              <ul className="space-y-2.5">
                {DUMMY_SCHEDULE_PHASES.map((ph) => (
                  <li
                    key={ph.name}
                    className="rounded-xl border border-border/50 bg-bg p-3 transition-colors hover:border-brand/30"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-semibold text-primary">
                        {ph.name}
                      </p>
                      <span className="text-[12px] tabular-nums text-secondary">
                        {ph.progress}%
                      </span>
                    </div>
                    <ProgressBar
                      value={ph.progress}
                      max={100}
                      size="sm"
                      className="mt-2"
                      variant={
                        ph.progress === 100
                          ? "success"
                          : ph.progress >= 70
                            ? "default"
                            : "warning"
                      }
                    />
                    <p className="mt-1.5 text-[11px] text-muted">
                      {ph.milestone}
                    </p>
                    <p className="text-[11px] text-muted">Owner: {ph.owner}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Gantt */}
            <div className="lg:col-span-9">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Gantt — planned vs actual
              </p>
              <GanttChart />
            </div>
          </div>
        )}

        {tab === "milestones" && <MilestonesView />}
        {tab === "lookahead" && <LookaheadView />}
        {tab === "workload" && <WorkloadView />}
      </div>
    </ModulePageShell>
  );
}
