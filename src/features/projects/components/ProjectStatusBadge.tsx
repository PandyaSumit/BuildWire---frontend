import type { ProjectStatus } from '@/types/project';
import { projectStatusLabel } from '@/features/projects/lib/display';

const styles: Record<ProjectStatus, string> = {
  planning: 'bg-muted/25 text-secondary ring-1 ring-border',
  active: 'bg-brand/15 text-brand ring-1 ring-brand/25',
  on_hold: 'bg-warning/15 text-warning ring-1 ring-warning/20',
  completed: 'bg-success/15 text-success ring-1 ring-success/20',
  archived: 'bg-muted/50 text-muted ring-1 ring-border',
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${styles[status]}`}
    >
      {projectStatusLabel(status)}
    </span>
  );
}
