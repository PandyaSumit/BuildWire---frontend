import type { ProjectMemberRole, ProjectStatus } from '@/types/project';

export function projectStatusTKey(status: ProjectStatus): string {
  return `projectStatus.${status}`;
}

export function projectMemberRoleTKey(role: ProjectMemberRole): string {
  return `projectMemberRole.${role}`;
}

export function formatPersonName(u: { first_name?: string | null; last_name?: string | null; email?: string | null } | null | undefined): string {
  if (!u) return '';
  const n = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
  return n || u.email || '';
}

export function formatDateOnly(iso: string | null | undefined, locale?: string): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat(locale || undefined, { dateStyle: 'medium' }).format(d);
  } catch {
    return iso;
  }
}
