import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import type { BuildWireTask } from '@/types/task';
import type { KanbanBoardSectionPersisted } from '@/lib/kanbanBoardPrefs';
import { useTaskProject } from '@/features/tasks/TaskProjectContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PM_TASK_STATUS_BADGE } from '@/design-system/pm-label-system';
import { useOptionalProjectUi } from '@/hooks/project/useProjectUi';
import { priorityBorderClassKey } from '@/features/tasks/taskPresentation';
import { taskWorkflowTKey } from '@/features/tasks/fixtures';
import { taskTradeKeyTKey } from '@/features/tasks/taskI18nKeys';
import { demoPrimaryAssigneeName, demoPrimaryInitials } from '@/features/tasks/demoUsers';

const SECTION_DROP_PREFIX = 'sec-';

function sectionDropId(sectionId: string) {
  return `${SECTION_DROP_PREFIX}${sectionId}`;
}

function isSectionDropId(id: string): id is `sec-${string}` {
  return id.startsWith(SECTION_DROP_PREFIX);
}

function parseSectionDropId(id: `sec-${string}`) {
  return id.slice(SECTION_DROP_PREFIX.length);
}

function formatShortDue(dueIso: string): string {
  const d = new Date(`${dueIso.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function sectionTitleKey(
  id: string,
):
  | 'tasks.listSectionRecent'
  | 'tasks.listSectionToday'
  | 'tasks.listSectionNextWeek'
  | 'tasks.listSectionLater'
  | null {
  switch (id) {
    case 'recent':
      return 'tasks.listSectionRecent';
    case 'today':
      return 'tasks.listSectionToday';
    case 'next-week':
      return 'tasks.listSectionNextWeek';
    case 'later':
      return 'tasks.listSectionLater';
    default:
      return null;
  }
}

function resolveSectionLabel(
  s: KanbanBoardSectionPersisted,
  t: (k: string) => string,
): string {
  if (s.title.trim()) return s.title.trim();
  const k = sectionTitleKey(s.id);
  return k ? t(k) : t('tasks.kanbanSectionUntitled');
}

/** Fixed column width — Asana-style lanes; full width only when stacked on small screens */
const SECTION_COL_CLASS =
  'flex w-full shrink-0 flex-col md:w-[280px] md:max-w-[280px] md:shrink-0';

function KanbanToolbar({
  onAddTask,
  filtersOpen,
  onToggleFilters,
}: {
  onAddTask: () => void;
  filtersOpen: boolean;
  onToggleFilters: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="mb-5 flex min-h-10 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border/25 pb-3">
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={onAddTask}
        className="h-8 shrink-0 gap-1.5 px-3 !py-0 text-[12px] font-semibold"
      >
        <span className="text-[15px] font-normal leading-none" aria-hidden>
          +
        </span>
        {t('tasks.listAddTask')}
      </Button>
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-1.5 text-[12px] text-secondary sm:gap-x-2">
        <button
          type="button"
          onClick={onToggleFilters}
          aria-expanded={filtersOpen}
          className={`h-8 rounded-lg px-2.5 hover:bg-muted/10 hover:text-primary ${
            filtersOpen ? 'bg-primary/8 text-primary dark:bg-white/10' : ''
          }`}
        >
          {t('tasks.filter')}
        </button>
        <button
          type="button"
          className="hidden h-8 rounded-lg px-2.5 hover:bg-muted/10 hover:text-primary sm:inline-flex"
        >
          {t('tasks.listToolbarSort')}
        </button>
        <button
          type="button"
          className="hidden h-8 rounded-lg px-2.5 hover:bg-muted/10 hover:text-primary md:inline-flex"
        >
          {t('tasks.listToolbarGroup')}
        </button>
      </div>
    </div>
  );
}

const CompactCard = memo(function CompactCard({
  task,
  projectLabel,
  onOpenTask,
}: {
  task: BuildWireTask;
  projectLabel: string;
  onOpenTask: (task: BuildWireTask) => void;
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` }
    : undefined;
  const locationLine = [task.floor, task.location_detail].filter(Boolean).join(' — ');
  const placeLine = locationLine || projectLabel;
  const assigneeName = demoPrimaryAssigneeName(task);
  const assigneeInitials = demoPrimaryInitials(task);

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onOpenTask(task)}
      className={`w-full rounded-md border border-border/25 bg-muted/[0.08] py-2 pl-2.5 pr-2 text-start transition hover:border-border/40 hover:bg-muted/[0.14] dark:bg-muted/[0.06] dark:hover:bg-muted/[0.12] ${priorityBorderClassKey(task.priority)} ${
        isDragging ? 'z-50 cursor-grabbing opacity-90 ring-2 ring-brand/20' : 'cursor-grab'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="shrink-0 font-mono text-[10px] leading-none text-muted">{task.display_number}</span>
        <span className="shrink-0 text-[10px] leading-none text-muted">{formatShortDue(task.due_date)}</span>
      </div>
      <div className="mt-1 flex items-start gap-1">
        {task.pinned ? (
          <span className="mt-0.5 shrink-0 text-[9px] text-brand" title={t('tasks.cardPinned')}>
            ●
          </span>
        ) : null}
        <p className="line-clamp-2 min-w-0 flex-1 text-[12px] font-semibold leading-snug text-primary">
          {task.title}
        </p>
      </div>
      <p className="mt-0.5 truncate text-[10px] leading-snug text-muted" title={placeLine}>
        {placeLine}
      </p>
      <div className="mt-1.5 flex items-center justify-between gap-1.5">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          <Badge
            variant={PM_TASK_STATUS_BADGE[task.status]}
            size="sm"
            className="max-w-[6.5rem] shrink-0 truncate !px-1.5 !py-px !text-[10px] !font-medium !leading-tight"
            title={t(taskWorkflowTKey(task.status))}
          >
            {t(taskWorkflowTKey(task.status))}
          </Badge>
          <span
            className="max-w-[5rem] truncate rounded border border-border/40 px-1 py-px text-[9px] leading-tight text-muted"
            title={t(taskTradeKeyTKey(task.trade))}
          >
            {t(taskTradeKeyTKey(task.trade))}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-[9px] font-semibold leading-none text-primary"
            title={assigneeName}
          >
            {assigneeInitials}
          </span>
          {task.comments_count > 0 ? (
            <span
              className="tabular-nums text-[9px] text-muted"
              title={t('tasks.commentCount', { count: task.comments_count })}
            >
              {task.comments_count}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
});

function KanbanSectionColumn({
  section,
  title,
  tasks,
  collapsed,
  sectionIndex,
  totalSections,
  onAddTask,
  onToggleCollapse,
  onRename,
  onDelete,
  onMoveLeft,
  onMoveRight,
  onOpenTask,
  projectLabel,
}: {
  section: KanbanBoardSectionPersisted;
  title: string;
  tasks: BuildWireTask[];
  collapsed: boolean;
  sectionIndex: number;
  totalSections: number;
  onAddTask: (sectionId: string) => void;
  onToggleCollapse: (sectionId: string) => void;
  onRename: (sectionId: string, title: string) => void;
  onDelete: (sectionId: string) => void;
  onMoveLeft: (index: number) => void;
  onMoveRight: (index: number) => void;
  onOpenTask: (task: BuildWireTask) => void;
  projectLabel: string;
}) {
  const { t } = useTranslation();
  const [renaming, setRenaming] = useState(false);
  const [renameDraft, setRenameDraft] = useState(title);
  const { setNodeRef, isOver } = useDroppable({ id: sectionDropId(section.id) });

  useEffect(() => {
    setRenameDraft(title);
  }, [title]);

  const finishRename = () => {
    onRename(section.id, renameDraft.trim());
    setRenaming(false);
  };

  return (
    <div
      className={`${SECTION_COL_CLASS} ${
        collapsed ? 'min-h-0' : 'min-h-0 max-md:max-h-none md:max-h-[min(70vh,640px)]'
      }`}
    >
      <div className="flex shrink-0 items-start justify-between gap-1 px-0.5 pb-2">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onToggleCollapse(section.id)}
            className="flex w-full items-center gap-1 text-start"
            aria-expanded={!collapsed}
          >
            <span className="shrink-0 text-[10px] text-muted">{collapsed ? '▸' : '▾'}</span>
            {renaming ? (
              <input
                value={renameDraft}
                onChange={(e) => setRenameDraft(e.target.value)}
                onBlur={finishRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') finishRename();
                  if (e.key === 'Escape') {
                    setRenameDraft(title);
                    setRenaming(false);
                  }
                }}
                className="w-full min-w-0 rounded border border-border/50 bg-bg px-1 py-0.5 text-[12px] font-semibold text-primary"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className="line-clamp-2 text-left text-[12px] font-semibold leading-snug text-primary"
                onDoubleClick={() => {
                  setRenameDraft(title);
                  setRenaming(true);
                }}
              >
                {title}{' '}
                <span className="font-normal text-muted">({tasks.length})</span>
              </span>
            )}
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => onAddTask(section.id)}
            className="rounded px-1.5 py-0.5 text-[13px] text-muted hover:bg-muted/15 hover:text-primary"
            title={t('tasks.kanbanAddCard')}
          >
            +
          </button>
          <details className="relative">
            <summary className="list-none cursor-pointer rounded px-1.5 py-0.5 text-muted hover:bg-muted/15 hover:text-primary [&::-webkit-details-marker]:hidden">
              ⋮
            </summary>
            <div className="absolute end-0 top-full z-20 mt-1 min-w-[9rem] rounded-md border border-border/50 bg-elevated py-1 text-[12px] shadow-lg">
              <button
                type="button"
                className="block w-full px-3 py-1.5 text-start hover:bg-muted/15"
                onClick={() => {
                  setRenameDraft(title);
                  setRenaming(true);
                }}
              >
                {t('tasks.kanbanRenameSection')}
              </button>
              <button
                type="button"
                disabled={sectionIndex <= 0}
                className="block w-full px-3 py-1.5 text-start hover:bg-muted/15 disabled:opacity-40"
                onClick={() => onMoveLeft(sectionIndex)}
              >
                {t('tasks.kanbanMoveSectionLeft')}
              </button>
              <button
                type="button"
                disabled={sectionIndex >= totalSections - 1}
                className="block w-full px-3 py-1.5 text-start hover:bg-muted/15 disabled:opacity-40"
                onClick={() => onMoveRight(sectionIndex)}
              >
                {t('tasks.kanbanMoveSectionRight')}
              </button>
              <button
                type="button"
                disabled={totalSections <= 1}
                className="block w-full px-3 py-1.5 text-start text-danger hover:bg-danger/10 disabled:opacity-40"
                onClick={() => onDelete(section.id)}
              >
                {t('tasks.kanbanDeleteSection')}
              </button>
            </div>
          </details>
        </div>
      </div>

      {!collapsed ? (
        <div
          ref={setNodeRef}
          className={`mt-1.5 flex min-h-[3rem] flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden overscroll-contain px-1 ${
            isOver ? 'rounded-md bg-brand/[0.06] ring-1 ring-brand/15' : ''
          }`}
        >
          {tasks.length === 0 ? (
            <p className="py-3 text-center text-[10px] leading-relaxed text-muted">{t('tasks.kanbanEmptyHint')}</p>
          ) : null}
          {tasks.map((task) => (
            <CompactCard
              key={task.id}
              task={task}
              projectLabel={projectLabel}
              onOpenTask={onOpenTask}
            />
          ))}
        </div>
      ) : null}

      {!collapsed ? (
        <button
          type="button"
          onClick={() => onAddTask(section.id)}
          className="mt-1.5 w-full rounded-md py-1.5 text-center text-[11px] text-muted hover:bg-muted/10 hover:text-secondary"
        >
          {t('tasks.kanbanAddPlaceholder')}
        </button>
      ) : null}
    </div>
  );
}

function AddSectionColumn({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex w-full shrink-0 flex-col md:w-[120px] md:max-h-[min(70vh,640px)] md:shrink-0">
      <button
        type="button"
        onClick={onAdd}
        className="flex min-h-[8rem] flex-1 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border/40 bg-muted/[0.03] px-2 py-3 text-center text-[11px] font-medium leading-snug text-muted transition hover:border-border/55 hover:bg-muted/15 hover:text-secondary md:min-h-0"
      >
        <span className="text-[15px] font-normal leading-none" aria-hidden>
          +
        </span>
        {t('tasks.listAddSection')}
      </button>
    </div>
  );
}

export function TaskKanbanBoard({
  onOpenTask,
  onRequestCreate,
  filtersOpen = false,
  onToggleFilters,
}: {
  onOpenTask: (t: BuildWireTask) => void;
  onRequestCreate: (sectionId?: string) => void;
  filtersOpen?: boolean;
  onToggleFilters?: () => void;
}) {
  const { t } = useTranslation();
  const projectUi = useOptionalProjectUi();
  const projectLabel = projectUi?.project.name ?? t('tasks.listWorkspaceLabel');
  const {
    filteredTasks,
    kanbanSections,
    addKanbanSection,
    renameKanbanSection,
    deleteKanbanSection,
    reorderKanbanSections,
    toggleKanbanSectionCollapsed,
    moveTaskKanban,
    resolveKanbanSectionId,
  } = useTaskProject();

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const tasksBySection = useMemo(() => {
    const valid = new Set(kanbanSections.map((s) => s.id));
    const fallback = kanbanSections[0]?.id ?? 'recent';
    const m = new Map<string, BuildWireTask[]>();
    kanbanSections.forEach((s) => m.set(s.id, []));
    filteredTasks
      .filter((x) => x.status !== 'void')
      .forEach((task) => {
        const sid = valid.has(task.kanban_section_id) ? task.kanban_section_id : fallback;
        m.get(sid)?.push(task);
      });
    kanbanSections.forEach((s) => {
      const list = m.get(s.id) ?? [];
      list.sort((a, b) => a.kanban_order - b.kanban_order || a.id.localeCompare(b.id));
      m.set(s.id, list);
    });
    return m;
  }, [filteredTasks, kanbanSections]);

  const activeTask = useMemo(
    () => (activeId ? filteredTasks.find((x) => x.id === activeId) : null),
    [activeId, filteredTasks],
  );

  const orderedIds = useCallback(
    (sid: string) =>
      (tasksBySection.get(sid) ?? []).map((x) => x.id),
    [tasksBySection],
  );

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const aid = String(active.id);
    const task = filteredTasks.find((x) => x.id === aid);
    if (!task || task.status === 'void') return;

    const overRaw = String(over.id);
    let destSection: string;
    let overTaskId: string | null = null;

    if (isSectionDropId(overRaw)) {
      destSection = parseSectionDropId(overRaw);
    } else {
      const hit = filteredTasks.find((x) => x.id === overRaw);
      if (!hit) return;
      destSection = resolveKanbanSectionId(hit.kanban_section_id);
      overTaskId = hit.id;
    }

    destSection = resolveKanbanSectionId(destSection);
    const destList = orderedIds(destSection).filter((id) => id !== aid);

    let toIndex = destList.length;
    if (overTaskId) {
      const idx = destList.indexOf(overTaskId);
      toIndex = idx >= 0 ? idx : destList.length;
    }

    moveTaskKanban(aid, destSection, toIndex);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {onToggleFilters ? (
          <KanbanToolbar
            onAddTask={() => onRequestCreate()}
            filtersOpen={filtersOpen}
            onToggleFilters={onToggleFilters}
          />
        ) : null}

        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto pb-2 [-webkit-overflow-scrolling:touch] md:overflow-y-hidden">
          <div className="flex w-full flex-col gap-4 pb-1 md:inline-flex md:w-max md:max-w-none md:flex-row md:items-start md:gap-[18px]">
            {kanbanSections.map((section, sectionIndex) => (
              <KanbanSectionColumn
                key={section.id}
                section={section}
                title={resolveSectionLabel(section, t)}
                tasks={tasksBySection.get(section.id) ?? []}
                collapsed={Boolean(section.collapsed)}
                sectionIndex={sectionIndex}
                totalSections={kanbanSections.length}
                onAddTask={(sid) => onRequestCreate(sid)}
                onToggleCollapse={toggleKanbanSectionCollapsed}
                onRename={renameKanbanSection}
                onDelete={deleteKanbanSection}
                onMoveLeft={(i) => i > 0 && reorderKanbanSections(i, i - 1)}
                onMoveRight={(i) =>
                  i < kanbanSections.length - 1 && reorderKanbanSections(i, i + 1)
                }
                onOpenTask={onOpenTask}
                projectLabel={projectLabel}
              />
            ))}
            <AddSectionColumn onAdd={addKanbanSection} />
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div
            className={`pointer-events-none w-[280px] rounded-lg border border-border/45 bg-elevated py-2 pl-2.5 pr-2.5 shadow-lg ${priorityBorderClassKey(activeTask.priority)}`}
          >
            <div className="flex items-center justify-between gap-2 text-[10px] text-muted">
              <span className="font-mono">{activeTask.display_number}</span>
              <span>{formatShortDue(activeTask.due_date)}</span>
            </div>
            <p className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug text-primary">
              {activeTask.title}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-muted">
              {[activeTask.floor, activeTask.location_detail].filter(Boolean).join(' — ') || projectLabel}
            </p>
            <div className="mt-1.5">
              <Badge
                variant={PM_TASK_STATUS_BADGE[activeTask.status]}
                size="sm"
                className="max-w-full truncate !px-1.5 !py-px !text-[10px] !font-medium !leading-tight"
              >
                {t(taskWorkflowTKey(activeTask.status))}
              </Badge>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
