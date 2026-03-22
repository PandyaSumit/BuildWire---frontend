import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { DUMMY_DRAWING_PLANS } from "@/features/project-ui/projectDummyData";

const disc: Record<string, string> = {
  Architectural:
    "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-200",
  Structural:
    "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-100",
  MEP: "border-cyan-500/40 bg-cyan-500/10 text-cyan-800 dark:text-cyan-100",
  "MEP Plumbing":
    "border-cyan-500/40 bg-cyan-500/10 text-cyan-800 dark:text-cyan-100",
  "MEP Electrical":
    "border-yellow-500/40 bg-yellow-500/10 text-yellow-900 dark:text-yellow-100",
  Electrical:
    "border-yellow-500/40 bg-yellow-500/10 text-yellow-900 dark:text-yellow-100",
  Fire: "border-red-500/40 bg-red-500/10 text-red-800 dark:text-red-100",
};

export default function ProjectDrawingsPage() {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-dm-sans)] text-xl font-bold text-primary">
            Drawings
          </h1>
          <p className="text-sm text-secondary">
            Floor plans and sheets — upload flow comes with backend.
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white dark:text-bg"
        >
          Upload PDF
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DUMMY_DRAWING_PLANS.map((p) => (
          <Link
            key={p.id}
            to={`/projects/${projectId}/drawings/viewer/${p.id}`}
            className="group rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:border-brand/40"
          >
            <div className="mb-3 aspect-[4/3] rounded-xl bg-gradient-to-br from-muted/40 to-muted/15" />
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-xs text-muted">{p.sheet}</p>
                <p className="mt-1 font-medium text-primary group-hover:underline">
                  {p.name}
                </p>
              </div>
              <Badge variant={p.status === "Current" ? "success" : "secondary"}>
                {p.status}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`rounded-full border px-2 py-0.5 font-medium ${disc[p.discipline] ?? "border-border bg-muted/20"}`}
              >
                {p.discipline}
              </span>
              <span className="text-muted">{p.rev}</span>
              <span className="text-secondary">📌 {p.pins} tasks</span>
            </div>
            <p className="mt-2 text-[10px] text-muted">Updated {p.updated}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
