import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  DAILY_REPORT_CALENDAR_LEGEND,
  DAILY_REPORT_STATUS_BADGE,
  WEEKDAY_LABELS,
} from "@/config/pm/daily-reports";
import { ModulePageShell } from "@/features/project-ui/components";
import {
  DUMMY_DAILY_REPORTS,
  DUMMY_MARCH_2026_DAYS,
  type CalendarDot,
  type DailyReportRow,
} from "@/features/project-ui/projectDummyData";

/** Calendar month shown in the UI (demo). */
const CAL_YEAR = 2026;
const CAL_MONTH_INDEX = 2; // March — 0-based

/** Fixed row height — avoids `aspect-square` growing with column width on wide monitors. */
const calCellH = "h-9 w-full min-w-0 sm:h-10";

function buildMonthGrid(
  year: number,
  monthIndex: number,
  dayDots: { day: number; dot: CalendarDot }[],
): ({ kind: "pad" } | { kind: "day"; day: number; dot: CalendarDot; weekend: boolean })[] {
  const dotByDay = new Map(dayDots.map((d) => [d.day, d.dot]));
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startWeekday = new Date(year, monthIndex, 1).getDay();
  const cells: (
    | { kind: "pad" }
    | { kind: "day"; day: number; dot: CalendarDot; weekend: boolean }
  )[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ kind: "pad" });
  for (let day = 1; day <= daysInMonth; day++) {
    const dot = dotByDay.get(day) ?? "missing";
    const wd = new Date(year, monthIndex, day).getDay();
    cells.push({ kind: "day", day, dot, weekend: wd === 0 || wd === 6 });
  }
  while (cells.length % 7 !== 0) cells.push({ kind: "pad" });
  return cells;
}

const LIST_COLUMNS: DataTableColumn<DailyReportRow>[] = [
  {
    id: "date",
    header: "Date",
    headerClassName: "pl-4 pr-3",
    cellClassName: "pl-4 pr-3 whitespace-nowrap",
    sortValue: (r) => r.date,
    cell: (r) => (
      <span className="font-mono text-[13px] text-primary">{r.date}</span>
    ),
  },
  {
    id: "submittedBy",
    header: "Submitted by",
    headerClassName: "px-3",
    cellClassName: "px-3",
    sortValue: (r) => r.submittedBy,
    cell: (r) => (
      <span className="text-[13px] font-medium text-primary">{r.submittedBy}</span>
    ),
  },
  {
    id: "crew",
    header: "Crew",
    headerClassName: "px-3",
    cellClassName: "px-3",
    align: "right",
    sortValue: (r) => r.crew,
    cell: (r) => (
      <span className="text-[13px] tabular-nums text-secondary">{r.crew}</span>
    ),
  },
  {
    id: "weather",
    header: "Weather",
    headerClassName: "px-3",
    cellClassName: "px-3",
    sortValue: (r) => r.weather,
    cell: (r) => (
      <span className="text-[13px] text-secondary">{r.weather}</span>
    ),
  },
  {
    id: "status",
    header: "Status",
    headerClassName: "px-3 pr-4",
    cellClassName: "px-3 pr-4",
    sortValue: (r) => r.status,
    cell: (r) => (
      <Badge variant={DAILY_REPORT_STATUS_BADGE[r.status]} size="sm">
        {r.status}
      </Badge>
    ),
  },
];

export default function ProjectDailyReportsPage() {
  const [mode, setMode] = useState<"calendar" | "list">("calendar");

  const calendarCells = useMemo(
    () => buildMonthGrid(CAL_YEAR, CAL_MONTH_INDEX, DUMMY_MARCH_2026_DAYS),
    [],
  );

  return (
    <ModulePageShell>
      <PageHeader
        title="Daily Reports"
        description="Field narrative, crew, weather, and photos — fast to submit."
        actions={
          <>
            <SegmentedControl
              value={mode}
              onChange={setMode}
              options={[
                { value: "calendar", label: "Calendar" },
                { value: "list", label: "List" },
              ]}
            />
            <Button size="sm">+ New report</Button>
          </>
        }
      />

      <div className="flex w-full min-w-0 flex-col gap-3 rounded-md border border-warning/25 bg-warning/[0.06] px-4 py-3 text-sm sm:flex-row sm:items-center">
        <span className="font-medium text-warning">Missing report</span>
        <span className="text-secondary">
          Today is a working day — submit before 6 PM.
        </span>
        <button
          type="button"
          className="rounded-lg border border-warning/35 bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning hover:bg-warning/15 sm:ms-auto"
        >
          Submit now
        </button>
      </div>

      {mode === "calendar" ? (
        <div className="w-full min-w-0 rounded-md border border-border/60 bg-surface p-3 sm:p-5">
          <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <p className="text-sm font-semibold text-primary sm:text-base">March 2026</p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden flex-wrap items-center gap-3 text-xs text-muted sm:flex">
                {(Object.entries(DAILY_REPORT_CALENDAR_LEGEND) as [
                  CalendarDot,
                  { className: string; label: string },
                ][]).map(([key, v]) => (
                  <span key={key} className="inline-flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${v.className}`} />
                    {v.label}
                  </span>
                ))}
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="rounded-lg border border-border/60 px-2.5 py-1 text-xs text-secondary hover:bg-muted/10 hover:text-primary"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-border/60 px-2.5 py-1 text-xs text-secondary hover:bg-muted/10 hover:text-primary"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted sm:hidden">
            {(Object.entries(DAILY_REPORT_CALENDAR_LEGEND) as [
              CalendarDot,
              { className: string; label: string },
            ][]).map(([key, v]) => (
              <span key={key} className="inline-flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${v.className}`} />
                {v.label}
              </span>
            ))}
          </div>

          <div className="mb-0.5 grid w-full min-w-0 grid-cols-7 gap-px sm:mb-1 sm:gap-1">
            {WEEKDAY_LABELS.map((d) => (
              <div
                key={d}
                className="px-0.5 py-1 text-center text-[9px] font-semibold uppercase leading-tight tracking-wide text-muted sm:py-1.5 sm:text-[11px]"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid w-full min-w-0 grid-cols-7 gap-px sm:gap-1">
            {calendarCells.map((cell, idx) => {
              if (cell.kind === "pad") {
                return (
                  <div
                    key={`pad-${idx}`}
                    className={`${calCellH} rounded-md bg-muted/[0.04]`}
                    aria-hidden
                  />
                );
              }
              const { className: dotCls } = DAILY_REPORT_CALENDAR_LEGEND[cell.dot];
              return (
                <button
                  key={cell.day}
                  type="button"
                  disabled={cell.weekend}
                  className={`flex ${calCellH} touch-manipulation flex-row items-center justify-center gap-0.5 rounded-md px-0.5 text-[11px] transition-colors sm:gap-1 sm:text-xs ${
                    cell.weekend
                      ? "cursor-default opacity-50"
                      : "hover:bg-muted/10 hover:text-primary active:bg-muted/15"
                  } text-primary`}
                >
                  <span className="shrink-0 tabular-nums font-medium leading-none">
                    {cell.day}
                  </span>
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotCls}`}
                    aria-hidden
                  />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {mode === "list" ? (
        <DataTable<DailyReportRow>
          variant="card"
          columns={LIST_COLUMNS}
          data={DUMMY_DAILY_REPORTS}
          rowKey={(r) => r.date}
          tableMinWidthClassName="min-w-0 sm:min-w-full"
          minWidthTableLayout="fixed"
          maxHeightClassName="max-h-none"
          className="w-full min-w-0"
          emptyFallback={
            <EmptyState
              title="No daily reports yet"
              description="Submit your first daily report to start tracking field progress."
              action={{ label: "+ New report" }}
            />
          }
        />
      ) : null}
    </ModulePageShell>
  );
}
