import type { ProjectDto, ProjectMemberRole, ProjectStatus } from '@/types/project';

const statusLabel: Record<ProjectStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On hold',
  completed: 'Completed',
  archived: 'Archived',
};

export function projectStatusLabel(status: ProjectStatus): string {
  return statusLabel[status] ?? status;
}

export function formatPersonName(u: { first_name?: string | null; last_name?: string | null; email?: string | null } | null | undefined): string {
  if (!u) return '';
  const n = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
  return n || u.email || '';
}

export function formatDateOnly(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(d);
  } catch {
    return iso;
  }
}

const memberRoleLabel: Record<ProjectMemberRole, string> = {
  project_manager: 'Project manager',
  supervisor: 'Supervisor',
  worker: 'Worker',
  guest: 'Guest',
};

export function projectMemberRoleLabel(role: ProjectMemberRole): string {
  return memberRoleLabel[role] ?? role;
}

export function projectCardSubtitle(project: ProjectDto): string {
  const parts: string[] = [];
  if (project.start_date) parts.push(`Starts ${formatDateOnly(project.start_date)}`);
  const cur = project.budget?.currency ?? 'INR';
  const est = project.budget?.estimated;
  if (est != null && est > 0) {
    parts.push(`${cur} ${est.toLocaleString()}`);
  }
  return parts.join(' · ') || 'No schedule yet';
}
