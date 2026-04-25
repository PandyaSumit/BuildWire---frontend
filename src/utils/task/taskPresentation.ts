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

/** Gantt bar fill by status — returns Tailwind class (kept for legacy callers) */
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

/** Gantt bar fill color as an inline SVG hex/rgba — works regardless of Tailwind purging */
export function ganttBarFill(status: string): string {
  switch (status) {
    case 'done':      return 'rgba(156,163,175,0.45)';   // muted gray
    case 'void':      return 'rgba(156,163,175,0.30)';
    case 'blocked':   return 'rgba(239,68,68,0.55)';     // red
    case 'in_review':
    case 'awaiting_inspection': return 'rgba(245,158,11,0.55)'; // amber
    case 'in_progress': return 'rgba(59,130,246,0.65)';  // blue (brand)
    default:          return 'rgba(14,165,233,0.55)';    // sky (open)
  }
}

/** Stroke color for overdue tasks */
export const GANTT_OVERDUE_STROKE = 'rgba(239,68,68,0.9)';
