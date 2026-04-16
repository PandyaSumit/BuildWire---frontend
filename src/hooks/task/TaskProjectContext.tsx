import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
import { seedBuildWireTasks } from '@/utils/task/migrateLegacyMock';
import { applyConstructionFilters } from '@/utils/task/taskFilterUtils';
import { patchProjectTask } from '@/services/task/taskService';
import { emitTaskNotification } from '@/utils/notification/taskNotifications';
import {
  cloneDefaultKanbanSections,
  readKanbanSections,
  writeKanbanSections,
  type KanbanBoardSectionPersisted,
} from '@/lib/kanbanBoardPrefs';

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
  kanbanSections: KanbanBoardSectionPersisted[];
  addKanbanSection: () => void;
  renameKanbanSection: (sectionId: string, title: string) => void;
  deleteKanbanSection: (sectionId: string) => void;
  reorderKanbanSections: (fromIndex: number, toIndex: number) => void;
  toggleKanbanSectionCollapsed: (sectionId: string) => void;
  moveTaskKanban: (taskId: TaskId, toSectionId: string, toIndex: number) => void;
  getNextKanbanOrder: (sectionId: string) => number;
  resolveKanbanSectionId: (id: string | undefined) => string;
};

const TaskProjectContext = createContext<Ctx | null>(null);

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
  const [kanbanSections, setKanbanSections] = useState<KanbanBoardSectionPersisted[]>(() => {
    return readKanbanSections(projectId) ?? cloneDefaultKanbanSections();
  });

  useEffect(() => {
    writeKanbanSections(projectId, kanbanSections);
  }, [projectId, kanbanSections]);

  const resolveKanbanSectionId = useCallback(
    (id: string | undefined) => {
      if (id && kanbanSections.some((s) => s.id === id)) return id;
      return kanbanSections[0]?.id ?? 'recent';
    },
    [kanbanSections],
  );

  const getNextKanbanOrder = useCallback(
    (sectionId: string) => {
      const sid = resolveKanbanSectionId(sectionId);
      let max = -1;
      for (const t of tasks) {
        if (t.status === 'void') continue;
        if (t.kanban_section_id === sid) max = Math.max(max, t.kanban_order);
      }
      return max + 1;
    },
    [tasks, resolveKanbanSectionId],
  );

  const moveTaskKanban = useCallback(
    (taskId: TaskId, toSectionId: string, toIndex: number) => {
      const targetSection = resolveKanbanSectionId(toSectionId);
      setTasks((prev) => {
        const now = new Date().toISOString();
        const next = prev.map((t) => ({ ...t }));
        const taskIdx = next.findIndex((t) => t.id === taskId);
        if (taskIdx < 0) return prev;
        const task = next[taskIdx];
        if (task.status === 'void') return prev;
        const fromSection = task.kanban_section_id;

        const orderedIds = (sid: string) =>
          next
            .filter((t) => t.status !== 'void' && t.kanban_section_id === sid)
            .sort((a, b) => a.kanban_order - b.kanban_order || a.id.localeCompare(b.id))
            .map((t) => t.id);

        if (fromSection === targetSection) {
          const ids = orderedIds(fromSection).filter((id) => id !== taskId);
          const clamped = Math.max(0, Math.min(toIndex, ids.length));
          ids.splice(clamped, 0, taskId);
          ids.forEach((id, order) => {
            const i = next.findIndex((t) => t.id === id);
            if (i >= 0) {
              next[i] = {
                ...next[i],
                kanban_section_id: targetSection,
                kanban_order: order,
                updated_at: now,
              };
            }
          });
          return next;
        }

        const srcIds = orderedIds(fromSection).filter((id) => id !== taskId);
        const destIds = orderedIds(targetSection).filter((id) => id !== taskId);
        const clamped = Math.max(0, Math.min(toIndex, destIds.length));
        destIds.splice(clamped, 0, taskId);

        srcIds.forEach((id, order) => {
          const i = next.findIndex((t) => t.id === id);
          if (i >= 0) {
            next[i] = {
              ...next[i],
              kanban_section_id: fromSection,
              kanban_order: order,
              updated_at: now,
            };
          }
        });
        destIds.forEach((id, order) => {
          const i = next.findIndex((t) => t.id === id);
          if (i >= 0) {
            next[i] = {
              ...next[i],
              kanban_section_id: targetSection,
              kanban_order: order,
              updated_at: now,
            };
          }
        });
        return next;
      });
      void patchProjectTask(projectId, taskId, {
        kanban_section_id: targetSection,
        kanban_order: toIndex,
      }).catch(() => {});
    },
    [projectId, resolveKanbanSectionId],
  );

  const addKanbanSection = useCallback(() => {
    const id = `sec_${crypto.randomUUID().slice(0, 8)}`;
    setKanbanSections((prev) => [...prev, { id, title: '', collapsed: false }]);
  }, []);

  const renameKanbanSection = useCallback((sectionId: string, title: string) => {
    setKanbanSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, title } : s)),
    );
  }, []);

  const deleteKanbanSection = useCallback(
    (sectionId: string) => {
      if (kanbanSections.length <= 1) return;
      const idx = kanbanSections.findIndex((s) => s.id === sectionId);
      if (idx < 0) return;
      const fallbackId = kanbanSections[idx === 0 ? 1 : idx - 1].id;
      setTasks((prev) => {
        const now = new Date().toISOString();
        const next = prev.map((t) =>
          t.kanban_section_id === sectionId
            ? { ...t, kanban_section_id: fallbackId, updated_at: now }
            : t,
        );
        const ids = next
          .filter((t) => t.status !== 'void' && t.kanban_section_id === fallbackId)
          .sort((a, b) => a.kanban_order - b.kanban_order || a.id.localeCompare(b.id))
          .map((t) => t.id);
        ids.forEach((id, order) => {
          const i = next.findIndex((t) => t.id === id);
          if (i >= 0) next[i] = { ...next[i], kanban_order: order, updated_at: now };
        });
        return next;
      });
      setKanbanSections((prev) => prev.filter((s) => s.id !== sectionId));
    },
    [kanbanSections],
  );

  const reorderKanbanSections = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setKanbanSections((prev) => {
      const copy = [...prev];
      const [x] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, x);
      return copy;
    });
  }, []);

  const toggleKanbanSectionCollapsed = useCallback((sectionId: string) => {
    setKanbanSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, collapsed: !s.collapsed } : s)),
    );
  }, []);

  const filteredTasks = useMemo(
    () => applyConstructionFilters(tasks, filters),
    [tasks, filters],
  );

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
      kanbanSections,
      addKanbanSection,
      renameKanbanSection,
      deleteKanbanSection,
      reorderKanbanSections,
      toggleKanbanSectionCollapsed,
      moveTaskKanban,
      getNextKanbanOrder,
      resolveKanbanSectionId,
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
      kanbanSections,
      addKanbanSection,
      renameKanbanSection,
      deleteKanbanSection,
      reorderKanbanSections,
      toggleKanbanSectionCollapsed,
      moveTaskKanban,
      getNextKanbanOrder,
      resolveKanbanSectionId,
    ],
  );

  return <TaskProjectContext.Provider value={value}>{children}</TaskProjectContext.Provider>;
}

export function useTaskProject(): Ctx {
  const x = useContext(TaskProjectContext);
  if (!x) throw new Error('useTaskProject must be used within TaskProjectProvider');
  return x;
}
