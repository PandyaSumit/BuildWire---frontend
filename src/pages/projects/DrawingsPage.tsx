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
} from "@/components/project";
import {
  DUMMY_DRAWING_PLANS,
  type DrawingPlanCard,
} from "@/services/project/projectDummyData";

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
      className="group flex flex-col overflow-hidden rounded-md border border-border/70 bg-surface shadow-token-xs transition-all duration-150 hover:border-brand/30 hover:shadow-token-md"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-gradient-to-br from-muted/30 via-muted/10 to-bg">
        {/* Grid overlay to simulate blueprint/plan feel */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* Sheet number watermark */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[22px] font-bold tracking-tight text-muted/20 select-none">
            {plan.sheet}
          </span>
        </div>
        {/* Open icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <div className="rounded-xl bg-brand/90 p-2.5 shadow-token-md backdrop-blur-sm">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
        </div>
        {/* Superseded overlay */}
        {plan.status === "Superseded" && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg/70 backdrop-blur-[2px]">
            <span className="rotate-[-12deg] rounded-lg border border-border bg-surface/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-muted shadow-token-sm">
              Superseded
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-semibold tracking-wider text-muted/80">
              {plan.sheet}
            </p>
            <p className="mt-0.5 line-clamp-2 text-[13px] font-semibold leading-snug text-primary transition-colors group-hover:text-brand">
              {plan.name}
            </p>
          </div>
          <Badge
            variant={PM_DRAWING_SHEET_STATUS_BADGE[plan.status] ?? "secondary"}
            size="sm"
            shape="pill"
            className="shrink-0"
          >
            {plan.status}
          </Badge>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <SemanticPill
            label={plan.discipline}
            palette={DRAWING_DISCIPLINE_CLASSES}
          />
          <span className="rounded bg-muted/15 px-1.5 py-0.5 font-mono text-[10px] text-muted">
            {plan.rev}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/40 pt-2 text-[11px] text-muted">
          <span className="flex min-w-0 items-center gap-1 truncate">
            <svg
              className="h-3 w-3 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {plan.pins} task{plan.pins !== 1 ? "s" : ""}
          </span>
          <span
            className="shrink-0 tabular-nums"
            title={`Updated ${plan.updated}`}
          >
            {plan.updated}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function DrawingsPage() {
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
        actions={
          <Button
            size="sm"
            iconLeft={
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            }
          >
            Upload PDF
          </Button>
        }
      />

      <FilterChipGroup
        options={disciplineOptions}
        value={filter}
        onChange={setFilter}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="No drawings match"
          description="Try another discipline or upload a new drawing set."
          action={{ label: "Upload PDF" }}
        />
      ) : (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filtered.map((p) => (
            <DrawingCard key={p.id} plan={p} projectId={pid} />
          ))}
        </div>
      )}
    </ModulePageShell>
  );
}
