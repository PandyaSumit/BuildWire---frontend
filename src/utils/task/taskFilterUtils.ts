import type { BuildWireTask, TaskListFilters, TaskStatus } from '@/types/task';
import { DEMO_ACTOR_USER_ID } from '@/utils/task/demoUsers';

const TERMINAL: TaskStatus[] = ['done', 'void'];

export function isActiveTaskStatus(status: TaskStatus): boolean {
  return !TERMINAL.includes(status);
}

export function isConstructionTaskOverdue(task: BuildWireTask): boolean {
  if (!isActiveTaskStatus(task.status)) return false;
  const due = task.due_date?.slice(0, 10);
  if (!due || !/^\d{4}-\d{2}-\d{2}$/.test(due)) return false;
  const d = new Date(`${due}T12:00:00`);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return d < t;
}

export function taskSearchHaystack(task: BuildWireTask): string {
  return [
    task.title,
    task.display_number,
    task.location_detail,
    task.floor,
    task.category,
    task.blocked_reason,
    task.tags?.join(' ') ?? '',
  ]
    .join(' ')
    .toLowerCase();
}

export function taskMatchesSearch(task: BuildWireTask, raw: string): boolean {
  const q = raw.trim().toLowerCase();
  if (!q) return true;
  const hay = taskSearchHaystack(task);
  return hay.includes(q);
}

/**
 * Applies construction filters (search, quick chips) on top of facet filters.
 */
export function applyConstructionFilters(
  tasks: BuildWireTask[],
  f: TaskListFilters,
): BuildWireTask[] {
  return tasks.filter((t) => {
    if (f.types.length && !f.types.includes(t.type)) return false;
    if (f.priorities.length && !f.priorities.includes(t.priority)) return false;
    if (f.trades.length && !f.trades.includes(t.trade)) return false;
    if (f.floors.length && !f.floors.includes(t.floor)) return false;
    if (f.assigneeIds.length) {
      const hit = t.assignees.some((a) => f.assigneeIds.includes(a));
      if (!hit) return false;
    }
    if (f.myWorkOnly) {
      if (!t.assignees.includes(DEMO_ACTOR_USER_ID)) return false;
    }
    if (f.blockedOnly && t.status !== 'blocked') return false;
    if (f.overdueOnly && !isConstructionTaskOverdue(t)) return false;
    if (!taskMatchesSearch(t, f.search)) return false;
    return true;
  });
}
