import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  DUMMY_DAILY_REPORTS,
  DUMMY_MARCH_2026_DAYS,
  type CalendarDot,
  type DailyReportRow,
} from "@/features/project-ui/projectDummyData";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const DOT_CONFIG: Record<CalendarDot, { cls: string; label: string }> = {
  approved: { cls: "bg-success", label: "Approved" },
  pending: { cls: "bg-blue-500", label: "Pending" },
  draft: { cls: "bg-warning", label: "Draft" },
  missing: { cls: "bg-danger", label: "Missing" },
  weekend: { cls: "bg-muted/40", label: "Weekend" },
};

const STATUS_VARIANT: Record<
  DailyReportRow["status"],
  "success" | "warning" | "danger" | "secondary"
> = {
  Approved: "success",
  Pending: "warning",
  Rejected: "danger",
  Draft: "secondary",
};

const LIST_COLUMNS: DataTableColumn<DailyReportRow>[] = [
  {
    id: "date",
    header: "Date",
    headerClassName: "pl-4 pr-3",
    cellClassName: "pl-4 pr-3 whitespace-nowrap",
    cell: (r) => (
      <span className="font-mono text-[13px] text-primary">{r.date}</span>
    ),
  },
  {
    id: "submittedBy",
    header: "Submitted by",
    headerClassName: "px-3",
    cellClassName: "px-3",
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
    cell: (r) => (
      <span className="text-[13px] tabular-nums text-secondary">{r.crew}</span>
    ),
  },
  {
    id: "weather",
    header: "Weather",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => (
      <span className="text-[13px] text-secondary">{r.weather}</span>
    ),
  },
  {
    id: "status",
    header: "Status",
    headerClassName: "px-3 pr-4",
    cellClassName: "px-3 pr-4",
    cell: (r) => (
      <Badge variant={STATUS_VARIANT[r.status]} size="sm">
        {r.status}
      </Badge>
    ),
  },
];

export default function ProjectDailyReportsPage() {
  const [mode, setMode] = useState<"calendar" | "list">("calendar");

  return (
    <div className="flex min-h-full flex-col gap-5 p-6">
      <PageHeader
        title="Daily Reports"
        description="Field narrative, crew, weather, and photos — under 5 minutes."
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

      {/* Missing report banner */}
      <div className="flex items-center gap-3 rounded-xl border border-warning/35 bg-warning/8 px-4 py-2.5 text-sm">
        <span className="text-warning">⚠</span>
        <span className="text-primary">
          <span className="font-semibold">Missing report:</span> today is a
          working day — submit before 6 PM.
        </span>
        <button
          type="button"
          className="ml-auto shrink-0 rounded-lg border border-warning/40 bg-warning/10 px-3 py-1 text-xs font-medium text-warning hover:bg-warning/15"
        >
          Submit now
        </button>
      </div>

      {mode === "calendar" && (
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          {/* Calendar header */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-base font-semibold text-primary">March 2026</p>
            <div className="flex items-center gap-2">
              {/* Legend */}
              <div className="hidden items-center gap-3 text-xs text-muted sm:flex">
                {(
                  Object.entries(DOT_CONFIG) as [
                    CalendarDot,
                    { cls: string; label: string },
                  ][]
                ).map(([key, v]) => (
                  <span key={key} className="inline-flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${v.cls}`} />
                    {v.label}
                  </span>
                ))}
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="rounded-lg border border-border px-2.5 py-1 text-xs text-secondary hover:bg-muted/10 hover:text-primary"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-border px-2.5 py-1 text-xs text-secondary hover:bg-muted/10 hover:text-primary"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* Mobile legend */}
          <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted sm:hidden">
            {(
              Object.entries(DOT_CONFIG) as [
                CalendarDot,
                { cls: string; label: string },
              ][]
            ).map(([key, v]) => (
              <span key={key} className="inline-flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${v.cls}`} />
                {v.label}
              </span>
            ))}
          </div>

          {/* Weekday headers */}
          <div className="mb-1 grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {DUMMY_MARCH_2026_DAYS.map(({ day, dot }) => {
              const { cls } = DOT_CONFIG[dot];
              const isWeekend = dot === "weekend";
              return (
                <button
                  key={day}
                  type="button"
                  disabled={isWeekend}
                  className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-colors ${
                    isWeekend
                      ? "cursor-default opacity-50"
                      : "hover:bg-muted/10 hover:text-primary"
                  } text-primary`}
                >
                  <span className="tabular-nums leading-none">{day}</span>
                  <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${cls}`} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {mode === "list" && (
        <DataTable<DailyReportRow>
          variant="card"
          columns={LIST_COLUMNS}
          data={DUMMY_DAILY_REPORTS}
          rowKey={(r) => r.date}
          maxHeightClassName="max-h-none"
          onRowClick={() => {}}
          emptyFallback={
            <EmptyState
              title="No daily reports yet"
              description="Submit your first daily report to start tracking field progress."
              action={{ label: "+ New report" }}
            />
          }
        />
      )}
    </div>
  );
}
