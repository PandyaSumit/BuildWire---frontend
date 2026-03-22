import { Badge } from "@/components/ui/badge";
import {
  DUMMY_RFIS,
  DUMMY_RFIS_STATS,
} from "@/features/project-ui/projectDummyData";

export default function ProjectRfisPage() {
  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <span className="rounded-lg border border-border bg-surface px-3 py-2">
          Total {DUMMY_RFIS_STATS.total}
        </span>
        <span className="rounded-lg border border-border bg-surface px-3 py-2">
          Open {DUMMY_RFIS_STATS.open}
        </span>
        <span className="rounded-lg border border-border bg-surface px-3 py-2">
          Overdue {DUMMY_RFIS_STATS.overdue}
        </span>
        <span className="rounded-lg border border-border bg-surface px-3 py-2">
          Avg response {DUMMY_RFIS_STATS.avgResponseDays}d
        </span>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-dm-sans)] text-xl font-bold text-primary">
            RFIs
          </h1>
          <p className="text-sm text-secondary">
            Ball-in-court, impact flags, and formal responses.
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white dark:text-bg"
        >
          + New RFI
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">RFI #</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Trade</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">BIC</th>
              <th className="px-4 py-3">Submitted by</th>
              <th className="px-4 py-3">Assigned to</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Days open</th>
              <th className="px-4 py-3">Cost</th>
            </tr>
          </thead>
          <tbody>
            {DUMMY_RFIS.map((r) => (
              <tr
                key={r.num}
                className={`border-b border-border/60 ${r.highlight ? "bg-warning/5" : ""}`}
              >
                <td className="px-4 py-3 font-mono text-xs font-medium text-brand">
                  {r.num}
                </td>
                <td className="max-w-[220px] truncate px-4 py-3 text-primary">
                  {r.title}
                </td>
                <td className="px-4 py-3">{r.trade}</td>
                <td className="px-4 py-3">
                  <Badge variant={r.pri === "Urgent" ? "danger" : "secondary"}>
                    {r.pri}
                  </Badge>
                </td>
                <td className="px-4 py-3">{r.status}</td>
                <td className="px-4 py-3">{r.bic}</td>
                <td className="px-4 py-3 text-secondary">{r.submittedBy}</td>
                <td className="px-4 py-3 text-secondary">{r.assignedTo}</td>
                <td className="px-4 py-3">{r.due}</td>
                <td className="px-4 py-3">{r.days}</td>
                <td className="px-4 py-3">
                  {r.cost ? (
                    <span className="font-mono text-warning">$</span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
