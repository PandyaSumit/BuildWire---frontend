import type { TaskPriorityKey, TaskTypeKey } from '@/types/task';
import {
  PM_TASK_PRIORITY_RAIL,
  PM_TASK_TABLE_PRIORITY_PILL,
  PM_TASK_TABLE_TYPE_PILL,
  PM_TASK_TYPE_CHIP,
} from '@/design-system/pm-label-system';

export function typeBadgeClassKey(type: TaskTypeKey): string {
  return PM_TASK_TYPE_CHIP[type] ?? 'bg-muted/30';
}

export function taskTableTypePillClassKey(type: TaskTypeKey): string {
  return PM_TASK_TABLE_TYPE_PILL[type] ?? 'border-border bg-muted/20 text-secondary';
}

export function priorityBorderClassKey(p: TaskPriorityKey): string {
  return PM_TASK_PRIORITY_RAIL[p] ?? 'border-l-4 border-border';
}

export function taskTablePriorityPillClassKey(p: TaskPriorityKey): string {
  return PM_TASK_TABLE_PRIORITY_PILL[p] ?? 'border-border bg-muted/20 text-secondary';
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
