import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { DUMMY_SCHEDULE_PHASES } from "@/features/project-ui/projectDummyData";

type Tab = "timeline" | "milestones" | "workload";

export default function ProjectSchedulePage() {
  const [tab, setTab] = useState<Tab>("timeline");

  return (
    <div className="flex min-h-full flex-col gap-5 p-6">
      <PageHeader
        title="Schedule"
        description="Phases, Gantt, dependencies, and workload — sample hierarchy."
        toolbar={
          <SegmentedControl
            value={tab}
            onChange={setTab}
            options={[
              { value: "timeline", label: "Timeline" },
              { value: "milestones", label: "Milestones" },
              { value: "workload", label: "Workload" },
            ]}
          />
        }
      />

      <div className="grid min-h-[480px] gap-0 rounded-2xl border border-border bg-surface lg:grid-cols-12">
        {/* Hierarchy panel */}
        <div className="border-b border-border p-5 lg:col-span-4 lg:border-b-0 lg:border-r">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
            Hierarchy
          </p>
          <ul className="space-y-3">
            {DUMMY_SCHEDULE_PHASES.map((ph) => (
              <li
                key={ph.name}
                className="rounded-xl border border-border/60 bg-bg p-3 transition-colors hover:border-border"
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
                <ul className="mt-2 space-y-0.5">
                  {ph.children.map((c) => (
                    <li key={c} className="flex items-center gap-1.5 text-[12px] text-secondary">
                      <span className="text-muted">›</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        {/* Gantt/placeholder panel */}
        <div className="flex flex-col gap-4 p-5 lg:col-span-8">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {tab === "timeline" && "Gantt — placeholder canvas"}
            {tab === "milestones" && "Milestones roadmap"}
            {tab === "workload" && "Weekly workload"}
          </p>

          <p className="text-sm text-secondary">
            {tab === "timeline" &&
              "Gantt canvas with today line and dependencies — interactive Gantt renders after backend integration."}
            {tab === "milestones" &&
              "Milestone cards with countdown and owner — renders after backend integration."}
            {tab === "workload" &&
              "Weekly load bars per assignee — renders after backend integration."}
          </p>

          {/* Placeholder bars */}
          <div className="space-y-2">
            {["Foundation", "Superstructure", "MEP", "Finishing"].map(
              (label, i) => {
                const widths = ["100%", "72%", "45%", "18%"];
                const variants = [
                  "success" as const,
                  "default" as const,
                  "warning" as const,
                  "warning" as const,
                ];
                return (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-lg bg-muted/10 px-3 py-2"
                  >
                    <span className="w-28 shrink-0 text-[12px] text-muted">
                      {label}
                    </span>
                    <ProgressBar
                      value={parseFloat(widths[i])}
                      max={100}
                      size="md"
                      className="flex-1"
                      variant={variants[i]}
                    />
                    <span className="w-10 text-right text-[12px] tabular-nums text-muted">
                      {widths[i]}
                    </span>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
