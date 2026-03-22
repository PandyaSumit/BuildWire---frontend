import { SegmentedControl } from "@/components/ui/segmented-control";
import { useState } from "react";
import { DUMMY_SCHEDULE_PHASES } from "@/features/project-ui/projectDummyData";

export default function ProjectSchedulePage() {
  const [tab, setTab] = useState<"timeline" | "milestones" | "workload">(
    "timeline",
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-dm-sans)] text-xl font-bold text-primary">
          Schedule
        </h1>
        <p className="text-sm text-secondary">
          Phases, Gantt, dependencies, and workload — sample hierarchy.
        </p>
      </div>
      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[
          { value: "timeline", label: "Timeline" },
          { value: "milestones", label: "Milestones" },
          { value: "workload", label: "Workload" },
        ]}
        className="mb-6"
      />
      <div className="grid min-h-[420px] gap-4 rounded-2xl border border-dashed border-border bg-surface/40 lg:grid-cols-12">
        <div className="border-b border-border p-4 lg:col-span-4 lg:border-b-0 lg:border-r">
          <p className="text-xs font-semibold uppercase text-muted">
            Hierarchy
          </p>
          <ul className="mt-3 space-y-4 text-sm">
            {DUMMY_SCHEDULE_PHASES.map((ph) => (
              <li
                key={ph.name}
                className="rounded-lg border border-border/60 bg-bg/50 p-3"
              >
                <p className="font-semibold text-primary">{ph.name}</p>
                <p className="text-xs text-secondary">
                  Milestone: {ph.milestone}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Owner: {ph.owner} · {ph.progress}%
                </p>
                <ul className="mt-2 list-inside list-disc text-xs text-secondary">
                  {ph.children.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 lg:col-span-8">
          <p className="text-sm text-secondary">
            {tab === "timeline" &&
              "Gantt canvas with today line & dependencies — placeholder canvas below."}
            {tab === "milestones" &&
              "Roadmap cards with countdown — placeholder."}
            {tab === "workload" &&
              "Weekly load bars per assignee — placeholder."}
          </p>
          <div className="mt-6 space-y-2">
            <div className="flex h-10 items-center gap-2 rounded-lg bg-muted/15 px-2 text-xs">
              <span className="w-24 text-muted">W1</span>
              <div className="h-6 flex-1 rounded bg-blue-500/30" />
            </div>
            <div className="flex h-10 items-center gap-2 rounded-lg bg-muted/15 px-2 text-xs">
              <span className="w-24 text-muted">W2</span>
              <div className="h-6 flex-1 rounded bg-amber-500/35" />
            </div>
            <div className="flex h-10 items-center gap-2 rounded-lg bg-muted/15 px-2 text-xs">
              <span className="w-24 text-muted">W3</span>
              <div className="h-6 flex-1 rounded bg-success/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
