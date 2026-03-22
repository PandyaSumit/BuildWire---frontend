import { useState } from "react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Badge } from "@/components/ui/badge";
import {
  DUMMY_DAILY_REPORTS,
  DUMMY_MARCH_2026_DAYS,
  type CalendarDot,
} from "@/features/project-ui/projectDummyData";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dotClass(dot: CalendarDot): string {
  switch (dot) {
    case "approved":
      return "bg-success";
    case "pending":
      return "bg-blue-500";
    case "draft":
      return "bg-warning";
    case "missing":
      return "bg-danger";
    case "weekend":
    default:
      return "bg-muted/50";
  }
}

export default function ProjectDailyReportsPage() {
  const [mode, setMode] = useState<"calendar" | "list">("calendar");

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-dm-sans)] text-xl font-bold text-primary">
            Daily Reports
          </h1>
          <p className="text-sm text-secondary">
            Field narrative, crew, weather, and photos — under 5 minutes.
          </p>
        </div>
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { value: "calendar", label: "Calendar" },
            { value: "list", label: "List" },
          ]}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-3 text-xs text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-success" /> Approved
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-500" /> Pending
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-warning" /> Draft
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-danger" /> Missing
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-muted/50" /> Weekend
        </span>
      </div>

      {mode === "calendar" && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-primary">March 2026</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg border border-border px-2 py-1 text-xs"
              >
                Prev
              </button>
              <button
                type="button"
                className="rounded-lg border border-border px-2 py-1 text-xs"
              >
                Next
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2 font-semibold">
                {d}
              </div>
            ))}
            {DUMMY_MARCH_2026_DAYS.map(({ day, dot }) => (
              <div
                key={day}
                className="flex aspect-square flex-col items-center justify-center rounded-lg border border-border/60 bg-bg text-sm text-primary"
              >
                <span>{day}</span>
                <span
                  className={`mt-1 h-2 w-2 rounded-full ${dotClass(dot)}`}
                  title={dot}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === "list" && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Submitted by</th>
                <th className="px-4 py-3">Crew</th>
                <th className="px-4 py-3">Weather</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_DAILY_REPORTS.map((r) => (
                <tr key={r.date} className="border-b border-border/60">
                  <td className="px-4 py-3">{r.date}</td>
                  <td className="px-4 py-3">{r.submittedBy}</td>
                  <td className="px-4 py-3">{r.crew}</td>
                  <td className="px-4 py-3">{r.weather}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        r.status === "Approved"
                          ? "success"
                          : r.status === "Pending"
                            ? "warning"
                            : r.status === "Rejected"
                              ? "danger"
                              : "secondary"
                      }
                    >
                      {r.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-primary">
        <strong>Missing report:</strong> today is a working day — submit before
        6 PM (sample banner).
      </div>
    </div>
  );
}
