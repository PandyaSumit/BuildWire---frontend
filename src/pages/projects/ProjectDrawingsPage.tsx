import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { DRAWING_DISCIPLINE_CLASSES } from "@/config/pm/drawings";
import { PM_DRAWING_SHEET_STATUS_BADGE } from "@/design-system/pm-label-system";
import {
  FilterChipGroup,
  ModulePageShell,
  SemanticPill,
} from "@/features/project-ui/components";
import {
  DUMMY_DRAWING_PLANS,
  type DrawingPlanCard,
} from "@/features/project-ui/projectDummyData";

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
      className="group flex flex-col overflow-hidden rounded-md border border-border bg-surface transition-colors duration-150 hover:border-border hover:bg-muted/5"
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-gradient-to-br from-muted/20 to-muted/5">
        {plan.status === "Superseded" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-bg/60 backdrop-blur-[1px]">
            <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted">
              Superseded
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-medium text-muted">{plan.sheet}</p>
            <p className="mt-0.5 line-clamp-2 text-[13px] font-semibold leading-snug text-primary group-hover:underline">
              {plan.name}
            </p>
          </div>
          <Badge
            variant={PM_DRAWING_SHEET_STATUS_BADGE[plan.status] ?? "secondary"}
            size="sm"
            className="shrink-0"
          >
            {plan.status}
          </Badge>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <SemanticPill label={plan.discipline} palette={DRAWING_DISCIPLINE_CLASSES} />
          <span className="text-[11px] text-muted">{plan.rev}</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/50 pt-1.5 text-[11px] text-muted">
          <span className="min-w-0 truncate tabular-nums">
            {plan.pins} task{plan.pins !== 1 ? "s" : ""} linked
          </span>
          <span className="shrink-0 tabular-nums" title={`Updated ${plan.updated}`}>
            {plan.updated}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ProjectDrawingsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const pid = projectId ?? "";

  const [filter, setFilter] = useState<string>("All");

  const disciplineOptions = useMemo(() => {
    const discs = Array.from(
      new Set(DUMMY_DRAWING_PLANS.map((p) => p.discipline)),
    ).sort();
    return ["All", ...discs];
  }, []);

  const filtered = useMemo(() => {
    if (filter === "All") return DUMMY_DRAWING_PLANS;
    return DUMMY_DRAWING_PLANS.filter((p) => p.discipline === filter);
  }, [filter]);

  return (
    <ModulePageShell>
      <PageHeader
        title="Drawings"
        description="Sheets and revisions — upload connects when the API is ready."
        actions={<Button size="sm">Upload PDF</Button>}
      />

      <FilterChipGroup options={disciplineOptions} value={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <EmptyState
          title="No drawings match"
          description="Try another discipline or upload a new drawing set."
          action={{ label: "Upload PDF" }}
        />
      ) : (
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filtered.map((p) => (
            <DrawingCard key={p.id} plan={p} projectId={pid} />
          ))}
        </div>
      )}
    </ModulePageShell>
  );
}
