import type { TaskPriorityKey, TaskTypeKey } from '@/types/task';

export function typeBadgeClassKey(type: TaskTypeKey): string {
  const map: Record<TaskTypeKey, string> = {
    general: 'bg-muted/30 text-secondary',
    punch_list: 'bg-brand/10 text-primary',
    safety: 'bg-danger/15 text-danger',
    quality: 'bg-success/15 text-success',
    rfi_action: 'bg-warning/15 text-warning',
    inspection_action: 'bg-brand/15 text-primary',
  };
  return map[type] ?? 'bg-muted/30';
}

export function taskTableTypePillClassKey(type: TaskTypeKey): string {
  const map: Record<TaskTypeKey, string> = {
    general: 'border-border/70 bg-muted/20 text-secondary dark:bg-muted/15',
    punch_list:
      'border-violet-500/30 bg-violet-500/[0.12] text-violet-700 dark:text-violet-300',
    safety: 'border-danger/35 bg-danger/10 text-danger',
    quality: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    rfi_action: 'border-amber-500/35 bg-amber-500/10 text-amber-800 dark:text-amber-400',
    inspection_action: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  };
  return map[type] ?? 'border-border bg-muted/20 text-secondary';
}

export function priorityBorderClassKey(p: TaskPriorityKey): string {
  const map: Record<TaskPriorityKey, string> = {
    low: 'border-l-4 border-border',
    medium: 'border-l-4 border-blue-500',
    high: 'border-l-4 border-amber-500',
    critical: 'border-l-4 border-red-500',
  };
  return map[p] ?? 'border-l-4 border-border';
}

export function taskTablePriorityPillClassKey(p: TaskPriorityKey): string {
  const map: Record<TaskPriorityKey, string> = {
    critical: 'border-red-500/35 bg-red-500/10 text-red-700 dark:text-red-400',
    high: 'border-amber-500/35 bg-amber-500/10 text-amber-800 dark:text-amber-400',
    medium: 'border-violet-500/35 bg-violet-500/10 text-violet-800 dark:text-violet-300',
    low: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400',
  };
  return map[p] ?? 'border-border bg-muted/20 text-secondary';
}

/** Gantt bar fill by status */
export function ganttBarClassForStatus(status: string): string {
  switch (status) {
    case 'done':
    case 'void':
      return 'fill-muted/50';
    case 'blocked':
      return 'fill-danger/35';
    case 'in_review':
    case 'awaiting_inspection':
      return 'fill-amber-500/40';
    case 'in_progress':
      return 'fill-brand/45';
    default:
      return 'fill-sky-500/35';
  }
}
