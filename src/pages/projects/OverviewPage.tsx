import { useMemo, useState } from "react";
import { useProjectUi } from "@/hooks/project/useProjectUi";
import { computeOverviewTaskStats } from "@/utils/project/overviewTaskStats";
import { Badge } from "@/components/ui/badge";
import { OverviewExecutionSnapshot } from "@/components/project/overview/OverviewExecutionSnapshot";
import { OverviewRollups } from "@/components/project/overview/OverviewRollups";
import { EditProjectModal } from "@/components/project/EditProjectModal";
import type { ProjectStatus } from "@/types/project";

function typeBadge(t: string) {
  const map: Record<string, "default" | "success" | "warning"> = {
    residential: "default",
    commercial: "warning",
    industrial: "default",
    mixed_use: "success",
  };
  return map[t] ?? "default";
}

function statusLabelToKey(label: string): ProjectStatus {
  const map: Record<string, ProjectStatus> = {
    Active: "active",
    Planning: "planning",
    "On Hold": "on_hold",
  };
  return map[label] ?? "planning";
}

export default function OverviewPage() {
  const { project } = useProjectUi();
  const taskStats = useMemo(() => computeOverviewTaskStats(), []);
  const [editOpen, setEditOpen] = useState(false);

  const projectDto = useMemo(
    () => ({
      id: project.id,
      org_id: "",
      name: project.name,
      description: null,
      status: statusLabelToKey(project.statusLabel),
      start_date: project.startDate || null,
      end_date: project.endDate || null,
      address: {},
      budget: { amount: 0, currency: "USD" } as never,
      cover_image_url: null,
      created_by_id: "",
      settings: {},
    }),
    [project],
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] space-y-8 p-6">
      <div className="max-w-2xl">
        <h1 className="font-[family-name:var(--font-dm-sans)] text-xl font-bold text-primary">
          Overview
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-secondary">
          Project identity plus rollups for schedule, RFIs, inspections, and task execution.
          Open each area in the sidebar for full detail.
        </p>
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-[family-name:var(--font-dm-sans)] text-lg font-bold tracking-tight text-primary">
              {project.name}
            </h2>
            <Badge variant={typeBadge(project.type)}>
              {project.type.replace("_", " ")}
            </Badge>
            <Badge variant="secondary">{project.statusLabel}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-secondary">
            <span className="inline-flex items-center gap-2">
              <span
                className={`inline-block h-3 w-3 rounded-full ${
                  project.healthScore >= 75
                    ? "bg-success"
                    : project.healthScore >= 50
                      ? "bg-warning"
                      : "bg-danger"
                }`}
              />
              Health score {project.healthScore}
            </span>
            <span className="text-muted">·</span>
            <span>
              {project.startDate} → {project.endDate}
            </span>
            <span className="text-muted">·</span>
            <span>
              {project.addressLine}, {project.city}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="rounded-lg border border-border bg-bg px-4 py-2 text-sm font-medium text-primary hover:bg-muted/10"
          >
            Edit project
          </button>
          <button
            type="button"
            className="rounded-lg border border-border bg-bg px-4 py-2 text-sm font-medium text-primary hover:bg-muted/10"
          >
            Share
          </button>
        </div>
      </section>

      <OverviewRollups projectId={project.id} />

      <OverviewExecutionSnapshot projectId={project.id} stats={taskStats} />

      <EditProjectModal
        open={editOpen}
        project={projectDto}
        onClose={() => setEditOpen(false)}
        onSubmit={async () => { setEditOpen(false); }}
      />
    </div>
  );
}
