import { Badge } from "@/components/ui/badge";
import {
  DUMMY_SUBCONTRACTORS,
  DUMMY_TEAM_MEMBERS,
  DUMMY_TEAM_STATS,
} from "@/features/project-ui/projectDummyData";

export default function ProjectTeamPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-dm-sans)] text-xl font-bold text-primary">
            Team
          </h1>
          <p className="text-sm text-secondary">
            Roles, companies, and who is on site today.
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white dark:text-bg"
        >
          + Add member
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <span className="rounded-lg border border-border bg-surface px-3 py-2">
          Total {DUMMY_TEAM_STATS.total}
        </span>
        <span className="rounded-lg border border-border bg-surface px-3 py-2">
          Active today {DUMMY_TEAM_STATS.activeToday}
        </span>
        <span className="rounded-lg border border-border bg-surface px-3 py-2">
          Companies {DUMMY_TEAM_STATS.companies}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Last active</th>
              <th className="px-4 py-3">Tasks</th>
              <th className="px-4 py-3">On site</th>
            </tr>
          </thead>
          <tbody>
            {DUMMY_TEAM_MEMBERS.map((m) => (
              <tr key={m.name} className="border-b border-border/60">
                <td className="px-4 py-3">
                  <span className="font-medium text-primary">{m.name}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{m.role}</Badge>
                </td>
                <td className="px-4 py-3">{m.company}</td>
                <td className="px-4 py-3 text-secondary">{m.joined}</td>
                <td className="px-4 py-3">{m.lastActive}</td>
                <td className="px-4 py-3">{m.tasks}</td>
                <td className="px-4 py-3">
                  {m.onSite ? (
                    <span className="text-success">●</span>
                  ) : (
                    <span className="text-muted">○</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 mt-10 font-[family-name:var(--font-dm-sans)] text-sm font-semibold uppercase tracking-wide text-muted">
        Subcontractor companies
      </h2>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Trade</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Active workers</th>
              <th className="px-4 py-3">Tasks</th>
            </tr>
          </thead>
          <tbody>
            {DUMMY_SUBCONTRACTORS.map((s) => (
              <tr key={s.name} className="border-b border-border/60">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">{s.trade}</td>
                <td className="px-4 py-3">{s.contact}</td>
                <td className="px-4 py-3">{s.workers}</td>
                <td className="px-4 py-3">{s.tasks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-secondary">
        <strong className="text-primary">On site now (sample):</strong> Raj
        Kumar — active 5m ago (L3) · Amit Verma — active 12m ago (Gate)
      </div>
    </div>
  );
}
