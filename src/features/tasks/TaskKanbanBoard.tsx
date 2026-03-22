import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import type { BuildWireTask, TaskStatus } from '@/types/task';
import { KANBAN_STATUSES, KANBAN_WIP_LIMIT } from '@/features/tasks/taskConstants';
import {
  isKanbanColumnId,
  useTaskProject,
} from '@/features/tasks/TaskProjectContext';
import { EmptyState } from '@/components/ui';
import {
  priorityBorderClassKey,
  typeBadgeClassKey,
} from '@/features/tasks/taskPresentation';
import { taskTypeKeyTKey } from '@/features/tasks/taskI18nKeys';
import { taskWorkflowTKey } from '@/features/tasks/fixtures';
import { demoPrimaryAssigneeName, demoPrimaryInitials } from '@/features/tasks/demoUsers';

function isOverdue(due: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(due)) return false;
  const d = new Date(`${due}T12:00:00`);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return d < t;
}

function DroppableColumn({
  id,
  count,
  wipLimit,
  children,
}: {
  id: TaskStatus;
  count: number;
  wipLimit?: number;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id });
  const atWip = wipLimit != null && count >= wipLimit;
  return (
    <div
      ref={setNodeRef}
      className={`flex w-[280px] shrink-0 flex-col rounded-lg border border-border bg-surface px-3 py-2 transition-colors ${
        isOver ? 'ring-2 ring-brand/40' : ''
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-primary">
          {t(taskWorkflowTKey(id))} <span className="text-muted">({count})</span>
        </span>
        {atWip ? (
          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-700 dark:text-amber-400">
            {t('tasks.wipLimit')}
          </span>
        ) : null}
      </div>
      <div className="flex min-h-[100px] flex-1 flex-col gap-2">{children}</div>
    </div>
  );
}

function KanbanCard({
  task,
  selected,
  bulkMode,
  onToggleSelect,
  onOpen,
}: {
  task: BuildWireTask;
  selected: boolean;
  bulkMode: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });
  const overdue = isOverdue(task.due_date);
  const blocked = task.status === 'blocked';
  const style = transform
    ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-lg border bg-bg text-left shadow-sm transition ${
        blocked ? 'border-danger/60' : 'border-border'
      } ${priorityBorderClassKey(task.priority)} ps-1 ${
        isDragging ? 'z-20 opacity-80' : ''
      }`}
    >
      <button
        type="button"
        {...listeners}
        {...attributes}
        onClick={(e) => {
          if (bulkMode) {
            e.stopPropagation();
            onToggleSelect();
            return;
          }
          onOpen();
        }}
        className="w-full rounded-lg p-3 ps-3 text-left"
      >
        {bulkMode ? (
          <span className="absolute start-2 top-2 z-10">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelect();
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-3.5 w-3.5 rounded border-border"
            />
          </span>
        ) : null}
        <p className="font-mono text-[10px] text-muted">{task.display_number}</p>
        <p className="mt-1 text-[15px] font-semibold leading-snug text-primary">{task.title}</p>
        {blocked && task.blocked_reason ? (
          <p className="mt-1 line-clamp-2 text-xs italic text-danger/90">
            {task.blocked_reason}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${typeBadgeClassKey(task.type)}`}
          >
            {t(taskTypeKeyTKey(task.type))}
          </span>
          <span className="rounded border border-border/60 px-1.5 py-0.5 text-[10px] text-secondary">
            {task.floor}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-secondary">
          <span className={overdue ? 'font-medium text-danger' : ''}>{task.due_date}</span>
          <span className="flex items-center gap-2">
            {task.pinned ? <span title={t('tasks.pinnedTitle')}>📌</span> : null}
            <span>{t('tasks.photoCount', { count: task.photos.length })}</span>
            <span>{t('tasks.commentCount', { count: task.comments_count })}</span>
          </span>
        </div>
        <div className="mt-2 flex justify-end">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-light text-[10px] font-bold text-brand"
            title={demoPrimaryAssigneeName(task)}
          >
            {demoPrimaryInitials(task)}
          </div>
        </div>
      </button>
    </div>
  );
}

export function TaskKanbanBoard({
  onOpenTask,
  onRequestCreate,
}: {
  onOpenTask: (t: BuildWireTask) => void;
  onRequestCreate: () => void;
}) {
  const { t } = useTranslation();
  const {
    filteredTasks,
    setTaskStatus,
    selectedIds,
    setSelectedIds,
    bulkSelectMode,
  } = useTaskProject();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const byColumn = useMemo(() => {
    const m = new Map<TaskStatus, BuildWireTask[]>();
    KANBAN_STATUSES.forEach((s) => m.set(s, []));
    filteredTasks.forEach((x) => {
      if (x.status === 'void') return;
      if (m.has(x.status)) m.get(x.status)!.push(x);
    });
    return m;
  }, [filteredTasks]);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const taskId = String(active.id);
    let targetStatus: TaskStatus | null = null;
    if (isKanbanColumnId(String(over.id))) {
      targetStatus = over.id as TaskStatus;
    } else {
      const hit = filteredTasks.find((x) => x.id === over.id);
      if (hit && hit.status !== 'void') targetStatus = hit.status;
    }
    if (!targetStatus || !KANBAN_STATUSES.includes(targetStatus)) return;
    setTaskStatus(taskId, targetStatus);
  };

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto px-6 pb-4">
        {KANBAN_STATUSES.map((col) => {
          const list = byColumn.get(col) ?? [];
          const wip = KANBAN_WIP_LIMIT[col];
          return (
            <DroppableColumn key={col} id={col} count={list.length} wipLimit={wip}>
              <div className="mb-1 flex justify-end">
                <button
                  type="button"
                  onClick={onRequestCreate}
                  className="rounded p-1 text-muted hover:bg-muted/20 hover:text-primary"
                  title={t('tasks.kanbanAddCard')}
                >
                  +
                </button>
              </div>
              {list.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  selected={selectedIds.has(task.id)}
                  bulkMode={bulkSelectMode}
                  onToggleSelect={() => toggle(task.id)}
                  onOpen={() => onOpenTask(task)}
                />
              ))}
              {list.length === 0 ? (
                <EmptyState
                  title={t('tasks.kanbanEmptyTitle')}
                  description={t('tasks.kanbanEmptyDesc')}
                  icon={<span className="text-2xl">📋</span>}
                />
              ) : null}
            </DroppableColumn>
          );
        })}
      </div>
    </DndContext>
  );
}
