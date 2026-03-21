import type { ProjectTaskStats } from '@/types/project';

const items: { key: keyof ProjectTaskStats; label: string }[] = [
  { key: 'total', label: 'Total' },
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'completed', label: 'Done' },
  { key: 'blocked', label: 'Blocked' },
];

export function ProjectTaskStatsGrid({ stats }: { stats: ProjectTaskStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map(({ key, label }) => (
        <div
          key={key}
          className="rounded-lg border border-border bg-surface px-4 py-3 text-center"
        >
          <p className="text-2xl font-bold tabular-nums text-primary">{stats[key] ?? 0}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        </div>
      ))}
    </div>
  );
}
