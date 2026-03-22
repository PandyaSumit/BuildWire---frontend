import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  BuildWireTask,
  TaskId,
  TaskListFilters,
  TaskPriorityKey,
  TaskStatus,
} from '@/types/task';
import { EMPTY_TASK_FILTERS } from '@/types/task';
import { seedBuildWireTasks } from '@/features/tasks/migrateLegacyMock';
import { patchProjectTask } from '@/api/tasks';
import { emitTaskNotification } from '@/features/notifications/taskNotifications';
import { KANBAN_STATUSES } from '@/features/tasks/taskConstants';

type Ctx = {
  projectId: string;
  tasks: BuildWireTask[];
  filters: TaskListFilters;
  setFilters: (f: TaskListFilters | ((p: TaskListFilters) => TaskListFilters)) => void;
  filteredTasks: BuildWireTask[];
  selectedIds: Set<string>;
  setSelectedIds: (s: Set<string> | ((p: Set<string>) => Set<string>)) => void;
  bulkSelectMode: boolean;
  setBulkSelectMode: (v: boolean) => void;
  addTask: (t: BuildWireTask) => void;
  patchTask: (id: TaskId, patch: Partial<BuildWireTask>) => void;
  setTaskStatus: (id: TaskId, status: TaskStatus) => void;
  voidTasks: (ids: TaskId[]) => void;
  bulkSetStatus: (ids: TaskId[], status: TaskStatus) => void;
  bulkSetPriority: (ids: TaskId[], priority: TaskPriorityKey) => void;
  bulkAssign: (ids: TaskId[], assigneeIds: string[]) => void;
  nextDisplayNumber: () => string;
};

const TaskProjectContext = createContext<Ctx | null>(null);

function applyFilters(tasks: BuildWireTask[], f: TaskListFilters): BuildWireTask[] {
  return tasks.filter((t) => {
    if (f.types.length && !f.types.includes(t.type)) return false;
    if (f.priorities.length && !f.priorities.includes(t.priority)) return false;
    if (f.trades.length && !f.trades.includes(t.trade)) return false;
    if (f.floors.length && !f.floors.includes(t.floor)) return false;
    if (f.assigneeIds.length) {
      const hit = t.assignees.some((a) => f.assigneeIds.includes(a));
      if (!hit) return false;
    }
    return true;
  });
}

function maxTaskNumber(tasks: BuildWireTask[]): number {
  let max = 0;
  for (const x of tasks) {
    const m = /^T-(\d+)$/i.exec(x.display_number.trim());
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max;
}

export function TaskProjectProvider({
  projectId,
  children,
}: {
  projectId: string;
  children: ReactNode;
}) {
  const [tasks, setTasks] = useState<BuildWireTask[]>(() => seedBuildWireTasks());
  const [filters, setFilters] = useState<TaskListFilters>(EMPTY_TASK_FILTERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkSelectMode, setBulkSelectMode] = useState(false);

  const filteredTasks = useMemo(() => applyFilters(tasks, filters), [tasks, filters]);

  const nextDisplayNumber = useCallback(() => {
    const n = maxTaskNumber(tasks) + 1;
    return `T-${String(n).padStart(3, '0')}`;
  }, [tasks]);

  const patchTask = useCallback((id: TaskId, patch: Partial<BuildWireTask>) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch, updated_at: now } : t)),
    );
    void patchProjectTask(projectId, id, patch).catch(() => {
      /* offline / mock */
    });
  }, [projectId]);

  const setTaskStatus = useCallback(
    (id: TaskId, status: TaskStatus) => {
      const prev = tasks.find((t) => t.id === id);
      patchTask(id, { status });
      if (prev && prev.status !== status) {
        emitTaskNotification({
          kind: 'status_changed',
          taskId: id,
          from: prev.status,
          to: status,
          actorId: 'u_current',
        });
      }
    },
    [patchTask, tasks],
  );

  const addTask = useCallback((t: BuildWireTask) => {
    setTasks((prev) => [t, ...prev]);
    if (t.assignees.length) {
      emitTaskNotification({ kind: 'assigned', taskId: t.id, userIds: t.assignees });
    }
  }, []);

  const voidTasks = useCallback((ids: TaskId[]) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) =>
        ids.includes(t.id)
          ? { ...t, status: 'void' as TaskStatus, updated_at: now }
          : t,
      ),
    );
    ids.forEach((id) => {
      void patchProjectTask(projectId, id, { status: 'void' }).catch(() => {});
    });
  }, [projectId]);

  const bulkSetStatus = useCallback(
    (ids: TaskId[], status: TaskStatus) => {
      ids.forEach((id) => setTaskStatus(id, status));
    },
    [setTaskStatus],
  );

  const bulkSetPriority = useCallback(
    (ids: TaskId[], priority: TaskPriorityKey) => {
      ids.forEach((id) => patchTask(id, { priority }));
    },
    [patchTask],
  );

  const bulkAssign = useCallback(
    (ids: TaskId[], assigneeIds: string[]) => {
      ids.forEach((id) => patchTask(id, { assignees: assigneeIds }));
    },
    [patchTask],
  );

  const value = useMemo(
    () => ({
      projectId,
      tasks,
      filters,
      setFilters,
      filteredTasks,
      selectedIds,
      setSelectedIds,
      bulkSelectMode,
      setBulkSelectMode,
      addTask,
      patchTask,
      setTaskStatus,
      voidTasks,
      bulkSetStatus,
      bulkSetPriority,
      bulkAssign,
      nextDisplayNumber,
    }),
    [
      projectId,
      tasks,
      filters,
      filteredTasks,
      selectedIds,
      bulkSelectMode,
      addTask,
      patchTask,
      setTaskStatus,
      voidTasks,
      bulkSetStatus,
      bulkSetPriority,
      bulkAssign,
      nextDisplayNumber,
    ],
  );

  return <TaskProjectContext.Provider value={value}>{children}</TaskProjectContext.Provider>;
}

export function useTaskProject(): Ctx {
  const x = useContext(TaskProjectContext);
  if (!x) throw new Error('useTaskProject must be used within TaskProjectProvider');
  return x;
}

export function isKanbanColumnId(id: string): id is TaskStatus {
  return (KANBAN_STATUSES as string[]).includes(id);
}
