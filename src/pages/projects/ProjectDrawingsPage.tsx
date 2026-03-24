import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  DUMMY_DRAWING_PLANS,
  type DrawingPlanCard,
} from "@/features/project-ui/projectDummyData";

const DISC_COLORS: Record<string, string> = {
  Architectural:
    "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-200",
  Structural:
    "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-100",
  MEP: "border-cyan-500/30 bg-cyan-500/10 text-cyan-800 dark:text-cyan-100",
  "MEP Plumbing":
    "border-cyan-500/30 bg-cyan-500/10 text-cyan-800 dark:text-cyan-100",
  "MEP Electrical":
    "border-yellow-500/30 bg-yellow-500/10 text-yellow-900 dark:text-yellow-100",
  Electrical:
    "border-yellow-500/30 bg-yellow-500/10 text-yellow-900 dark:text-yellow-100",
  Fire: "border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-100",
};

function DrawingCard({
  plan,
  projectId,
}: {
  plan: DrawingPlanCard;
  projectId: string;
}) {
  return (
    <Link
      to={`/projects/${projectId}/drawings/viewer/${plan.id}`}
      className="group flex flex-col rounded-2xl border border-border bg-surface shadow-sm transition-all duration-150 hover:border-brand/30 hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-gradient-to-br from-muted/30 to-muted/10">
        {plan.status === "Superseded" && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg/60 backdrop-blur-[2px]">
            <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted">
              Superseded
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-medium text-muted">
              {plan.sheet}
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-primary group-hover:underline">
              {plan.name}
            </p>
          </div>
          <Badge
            variant={plan.status === "Current" ? "success" : "secondary"}
            size="sm"
          >
            {plan.status}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${DISC_COLORS[plan.discipline] ?? "border-border bg-muted/20 text-secondary"}`}
          >
            {plan.discipline}
          </span>
          <span className="text-[11px] text-muted">{plan.rev}</span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted">
          <span className="inline-flex items-center gap-1">
            <span>📌</span>
            <span>
              {plan.pins} task{plan.pins !== 1 ? "s" : ""}
            </span>
          </span>
          <span>Updated {plan.updated}</span>
        </div>
      </div>
    </Link>
  );
}

export default function ProjectDrawingsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const pid = projectId ?? "";

  const [filter, setFilter] = useState<string>("All");

  const availableDiscs = [
    "All",
    ...Array.from(new Set(DUMMY_DRAWING_PLANS.map((p) => p.discipline))),
  ];

  const filtered =
    filter === "All"
      ? DUMMY_DRAWING_PLANS
      : DUMMY_DRAWING_PLANS.filter((p) => p.discipline === filter);

  return (
    <div className="flex min-h-full flex-col gap-5 p-6">
      <PageHeader
        title="Drawings"
        description="Floor plans and sheets — upload flow comes with backend."
        actions={<Button size="sm">Upload PDF</Button>}
      />

      {/* Discipline filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {availableDiscs.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setFilter(d)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filter === d
                ? "border-brand bg-brand text-white dark:text-bg"
                : "border-border bg-surface text-secondary hover:border-brand/40 hover:text-primary"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No drawings match"
          description="Try a different discipline filter or upload a new drawing."
          action={{ label: "Upload PDF" }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <DrawingCard key={p.id} plan={p} projectId={pid} />
          ))}
        </div>
      )}
    </div>
  );
}
