import { Badge } from "@/components/ui/badge";
import {
  DUMMY_INSPECTIONS,
  DUMMY_INSPECTION_STATS,
} from "@/features/project-ui/projectDummyData";

export default function ProjectInspectionsPage() {
  const s = DUMMY_INSPECTION_STATS;

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-dm-sans)] text-xl font-bold text-primary">
            Inspections
          </h1>
          <p className="text-sm text-secondary">
            Templates, checklist conduct, and auto-tasks on fail.
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white dark:text-bg"
        >
          + Schedule inspection
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <span className="rounded-lg border border-border bg-surface px-3 py-2">
          Total {s.total}
        </span>
        <span className="rounded-lg border border-border bg-surface px-3 py-2">
          Pass rate {s.passRate}%
        </span>
        <span className="rounded-lg border border-border bg-surface px-3 py-2">
          This month {s.month}
        </span>
        <span className="rounded-lg border border-border bg-surface px-3 py-2">
          Scheduled {s.scheduled}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Conducted by</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Result</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {DUMMY_INSPECTIONS.map((r) => (
              <tr key={r.title + r.date} className="border-b border-border/60">
                <td className="px-4 py-3 font-medium text-primary">
                  {r.title}
                </td>
                <td className="px-4 py-3">{r.type}</td>
                <td className="px-4 py-3">{r.location}</td>
                <td className="px-4 py-3">{r.by}</td>
                <td className="px-4 py-3">{r.date}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      r.result === "Pass"
                        ? "success"
                        : r.result === "Fail"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {r.result}
                  </Badge>
                </td>
                <td className="px-4 py-3">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
