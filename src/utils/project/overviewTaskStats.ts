import {
  MOCK_TASKS,
  TASK_COLUMNS,
  type TaskColumn,
  type UiTask,
} from '@/utils/task/fixtures';

export type OverviewTaskStats = {
  total: number;
  completed: number;
  incomplete: number;
  completionPct: number;
  overdueIncomplete: number;
  blockedIncomplete: number;
  /** Non-completed tasks only, by workflow column */
  incompleteByColumn: { id: TaskColumn; count: number }[];
  /** Non-completed tasks only */
  priorityIncomplete: Record<UiTask["priority"], number>;
  overdueSamples: Pick<UiTask, "number" | "title" | "due">[];
};

export function computeOverviewTaskStats(): OverviewTaskStats {
  const total = MOCK_TASKS.length;
  const completed = MOCK_TASKS.filter((t) => t.status === "done").length;
  const incomplete = total - completed;
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const nonDone = MOCK_TASKS.filter((t) => t.status !== "done");
  const overdueIncomplete = nonDone.filter((t) => t.overdue).length;
  const blockedIncomplete = nonDone.filter((t) => t.status === "blocked").length;

  const incompleteByColumn = TASK_COLUMNS.filter((c) => c.id !== "done").map(
    (c) => ({
      id: c.id,
      count: MOCK_TASKS.filter((t) => t.status === c.id).length,
    }),
  );

  const priorityIncomplete: OverviewTaskStats["priorityIncomplete"] = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };
  nonDone.forEach((t) => {
    priorityIncomplete[t.priority] += 1;
  });

  const overdueSamples = nonDone
    .filter((t) => t.overdue)
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 4)
    .map((t) => ({ number: t.number, title: t.title, due: t.due }));

  return {
    total,
    completed,
    incomplete,
    completionPct,
    overdueIncomplete,
    blockedIncomplete,
    incompleteByColumn,
    priorityIncomplete,
    overdueSamples,
  };
}
