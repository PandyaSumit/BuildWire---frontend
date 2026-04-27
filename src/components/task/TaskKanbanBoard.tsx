import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import type { BuildWireTask, TaskStatus } from '@/types/task';
import type { KanbanBoardSectionPersisted } from '@/lib/kanbanBoardPrefs';
import { useTaskProject } from '@/hooks/task/TaskProjectContext';
import { Badge } from '@/components/ui/badge';
import { PM_TASK_STATUS_BADGE } from '@/design-system/pm-label-system';
import { useOptionalProjectUi } from '@/hooks/project/useProjectUi';
import { priorityBorderClassKey } from '@/utils/task/taskPresentation';
import { taskWorkflowTKey } from '@/utils/task/fixtures';
import { taskTradeKeyTKey } from '@/utils/task/taskI18nKeys';
import { demoPrimaryAssigneeName, demoPrimaryInitials } from '@/utils/task/demoUsers';

const SECTION_DROP_PREFIX = 'sec-';
function sectionDropId(id: string)            { return `${SECTION_DROP_PREFIX}${id}`; }
function isSectionDropId(id: string)          { return id.startsWith(SECTION_DROP_PREFIX); }
function parseSectionDropId(id: string)       { return id.slice(SECTION_DROP_PREFIX.length); }

function formatShortDue(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function isOverdue(iso: string, status: TaskStatus): boolean {
  if (status === 'done' || status === 'void') return false;
  return new Date(`${iso.slice(0, 10)}T23:59:59`) < new Date();
}

function sectionTitleKey(id: string) {
  switch (id) {
    case 'recent':    return 'tasks.listSectionRecent';
    case 'today':     return 'tasks.listSectionToday';
    case 'next-week': return 'tasks.listSectionNextWeek';
    case 'later':     return 'tasks.listSectionLater';
    default:          return null;
  }
}

function resolveSectionLabel(s: KanbanBoardSectionPersisted, t: (k: string) => string): string {
  if (s.title.trim()) return s.title.trim();
  const k = sectionTitleKey(s.id);
  return k ? t(k) : t('tasks.kanbanSectionUntitled');
}

/** Status dot color — inline so it always renders regardless of Tailwind purge */
function statusDotColor(status: TaskStatus): string {
  switch (status) {
    case 'done':               return '#22c55e';  // green
    case 'in_progress':        return '#3b82f6';  // blue
    case 'in_review':          return '#a855f7';  // purple
    case 'blocked':            return '#ef4444';  // red
    case 'awaiting_inspection':return '#f59e0b';  // amber
    default:                   return '#6b7280';  // gray (open/void)
  }
}


const SECTION_COL_CLASS = 'flex w-full shrink-0 flex-col md:w-[272px] md:max-w-[272px] md:shrink-0';


// ── Compact Kanban card — Procore/Fieldwire style ─────────────────────────────
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
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = transform ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` } : undefined;

  const locationLine = [task.floor, task.location_detail].filter(Boolean).join(' · ');
  const assigneeName    = demoPrimaryAssigneeName(task);
  const assigneeInitials = demoPrimaryInitials(task);
  const overdue = isOverdue(task.due_date, task.status);
  const dotColor = statusDotColor(task.status);

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onOpenTask(task)}
      className={`group w-full rounded-lg border bg-surface text-start transition-all hover:shadow-md
        ${priorityBorderClassKey(task.priority)}
        ${isDragging ? 'z-50 cursor-grabbing opacity-90 shadow-xl ring-2 ring-brand/30' : 'cursor-grab hover:border-border/50'}
        ${overdue ? 'border-danger/30 bg-danger/[0.03]' : 'border-border/30'}
      `}
    >
      {/* Card header — number + due date */}
      <div className="flex items-center justify-between gap-2 border-b border-border/20 px-3 py-2">
        <span className="font-mono text-[10px] font-semibold text-muted">{task.display_number}</span>
        <span className={`text-[10px] tabular-nums ${overdue ? 'font-semibold text-danger' : 'text-muted'}`}>
          {overdue && <span className="mr-0.5">!</span>}{formatShortDue(task.due_date)}
        </span>
      </div>

      {/* Card body */}
      <div className="px-3 py-2.5">
        {/* Title */}
        <p className="line-clamp-2 text-[12px] font-semibold leading-snug text-primary">
          {task.pinned && <span className="mr-1 text-[9px] text-brand" title={t('tasks.cardPinned')}>●</span>}
          {task.title}
        </p>

        {/* Location / project label */}
        {locationLine ? (
          <p className="mt-0.5 truncate text-[10px] text-muted" title={locationLine}>{locationLine}</p>
        ) : (
          <p className="mt-0.5 truncate text-[10px] text-muted">{projectLabel}</p>
        )}

        {/* Progress bar (only when progress > 0) */}
        {task.progress > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-[9px] text-muted mb-0.5">
              <span>Progress</span>
              <span className="tabular-nums">{task.progress}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted/20">
              <div
                className="h-full rounded-full bg-brand/70 transition-all"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer — status + trade + assignee */}
        <div className="mt-2.5 flex items-center justify-between gap-1.5">
          {/* Status dot + label */}
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: dotColor }}
              aria-hidden
            />
            <Badge
              variant={PM_TASK_STATUS_BADGE[task.status]}
              size="sm"
              className="max-w-[7rem] shrink-0 truncate !px-1.5 !py-px !text-[10px] !font-medium !leading-tight"
              title={t(taskWorkflowTKey(task.status))}
            >
              {t(taskWorkflowTKey(task.status))}
            </Badge>
            {task.trade && (
              <span
                className="max-w-[4.5rem] truncate rounded border border-border/35 px-1 py-px text-[9px] leading-tight text-muted"
                title={t(taskTradeKeyTKey(task.trade))}
              >
                {t(taskTradeKeyTKey(task.trade))}
              </span>
            )}
          </div>

          {/* Assignee + comments */}
          <div className="flex shrink-0 items-center gap-1">
            {task.comments_count > 0 && (
              <div className="flex items-center gap-0.5 text-[9px] text-muted">
                <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                  <path d="M2 4.25C2 3.56 2.56 3 3.25 3h9.5c.69 0 1.25.56 1.25 1.25v5.5c0 .69-.56 1.25-1.25 1.25h-2.2l-2.15 1.65a.55.55 0 0 1-.9-.43V11h-2.1c-.69 0-1.25-.56-1.25-1.25v-5.5z" />
                </svg>
                <span className="tabular-nums">{task.comments_count}</span>
              </div>
            )}
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/20 text-[9px] font-bold text-primary ring-1 ring-border/30"
              title={assigneeName}
              aria-label={assigneeName}
            >
              {assigneeInitials || '?'}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
});

// ── Column header ─────────────────────────────────────────────────────────────
function KanbanSectionColumn({
  section, title, tasks, collapsed, sectionIndex, totalSections,
  onAddTask, onToggleCollapse, onRename, onDelete, onMoveLeft, onMoveRight, onOpenTask, projectLabel,
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { setNodeRef, isOver } = useDroppable({ id: sectionDropId(section.id) });

  useEffect(() => {
    if (!menuOpen) return;
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  useEffect(() => { setRenameDraft(title); }, [title]);

  const finishRename = () => { onRename(section.id, renameDraft.trim()); setRenaming(false); };

  // Count by status for the column header accent
  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const hasAllDone = tasks.length > 0 && doneCount === tasks.length;

  return (
    <div className={`${SECTION_COL_CLASS} ${collapsed ? 'min-h-0' : 'min-h-0 max-md:max-h-none md:max-h-[min(72vh,680px)]'}`}>

      {/* ── Column header ─────────────────────────────────────────────────── */}
      <div className="mb-2 flex shrink-0 items-center justify-between gap-1 rounded-t-xl border border-border/30 bg-elevated px-3 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleCollapse(section.id)}
            aria-expanded={!collapsed}
            className="flex shrink-0 items-center text-muted"
          >
            <svg className="h-3.5 w-3.5 transition-transform" style={{ transform: collapsed ? 'rotate(-90deg)' : undefined }} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06z" />
            </svg>
          </button>

          {renaming ? (
            <input
              value={renameDraft}
              onChange={(e) => setRenameDraft(e.target.value)}
              onBlur={finishRename}
              onKeyDown={(e) => { if (e.key === 'Enter') finishRename(); if (e.key === 'Escape') { setRenameDraft(title); setRenaming(false); } }}
              className="min-w-0 flex-1 rounded border border-brand/50 bg-bg px-1.5 py-0.5 text-[13px] font-semibold text-primary focus:outline-none"
              autoFocus onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className="min-w-0 flex-1 truncate text-[13px] font-semibold text-primary"
              onDoubleClick={() => { setRenameDraft(title); setRenaming(true); }}
            >
              {title}
            </span>
          )}

          {/* Task count badge */}
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${hasAllDone ? 'bg-success/15 text-success' : 'bg-muted/15 text-muted'}`}>
            {tasks.length}
          </span>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-0.5">
          <button type="button" onClick={() => onAddTask(section.id)}
            className="flex h-7 w-7 items-center justify-center rounded text-muted hover:bg-muted/15 hover:text-primary"
            title={t('tasks.kanbanAddCard')}>
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M8 3a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5v-3.5A.75.75 0 0 1 8 3z" />
            </svg>
          </button>
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              className="flex h-7 w-7 items-center justify-center rounded text-muted hover:bg-muted/15 hover:text-primary"
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M8 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM1.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm13 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute end-0 top-full z-20 mt-1 min-w-[10rem] rounded-xl border border-border/50 bg-elevated py-1 text-[12px] shadow-lg">
                <button type="button" className="block w-full px-3 py-2 text-start hover:bg-muted/10"
                  onClick={() => { setRenameDraft(title); setRenaming(true); setMenuOpen(false); }}>
                  {t('tasks.kanbanRenameSection')}
                </button>
                <button type="button" disabled={sectionIndex <= 0} className="block w-full px-3 py-2 text-start hover:bg-muted/10 disabled:opacity-40"
                  onClick={() => { onMoveLeft(sectionIndex); setMenuOpen(false); }}>
                  {t('tasks.kanbanMoveSectionLeft')}
                </button>
                <button type="button" disabled={sectionIndex >= totalSections - 1} className="block w-full px-3 py-2 text-start hover:bg-muted/10 disabled:opacity-40"
                  onClick={() => { onMoveRight(sectionIndex); setMenuOpen(false); }}>
                  {t('tasks.kanbanMoveSectionRight')}
                </button>
                <div className="my-1 border-t border-border/30" />
                <button type="button" disabled={totalSections <= 1} className="block w-full px-3 py-2 text-start text-danger hover:bg-danger/10 disabled:opacity-40"
                  onClick={() => { onDelete(section.id); setMenuOpen(false); }}>
                  {t('tasks.kanbanDeleteSection')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Drop zone ─────────────────────────────────────────────────────── */}
      {!collapsed && (
        <div
          ref={setNodeRef}
          className={`flex min-h-[4rem] flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden overscroll-contain rounded-b-xl px-0.5 pb-2 pt-0.5 ${
            isOver ? 'rounded-xl bg-brand/[0.05] ring-2 ring-brand/20' : ''
          }`}
        >
          {tasks.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
              <div className="mb-2 text-3xl opacity-20">📋</div>
              <p className="text-[11px] leading-relaxed text-muted">{t('tasks.kanbanEmptyHint')}</p>
            </div>
          ) : (
            tasks.map((task) => (
              <CompactCard key={task.id} task={task} projectLabel={projectLabel} onOpenTask={onOpenTask} />
            ))
          )}
        </div>
      )}

      {/* Add card button */}
      {!collapsed && (
        <button type="button" onClick={() => onAddTask(section.id)}
          className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/40 py-2.5 text-[12px] text-muted transition hover:border-border/60 hover:bg-muted/10 hover:text-secondary">
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M8 3a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5v-3.5A.75.75 0 0 1 8 3z" />
          </svg>
          {t('tasks.kanbanAddPlaceholder')}
        </button>
      )}
    </div>
  );
}

// ── Add section column ────────────────────────────────────────────────────────
function AddSectionColumn({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex w-full shrink-0 flex-col md:w-[200px] md:shrink-0">
      {/* Mobile: compact inline row */}
      <button type="button" onClick={onAdd}
        className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-[12px] font-medium text-muted transition hover:text-secondary md:hidden">
        <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <path d="M8 3a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5v-3.5A.75.75 0 0 1 8 3z" />
        </svg>
        {t('tasks.listAddSection')}
      </button>
      {/* Desktop: compact header-height button */}
      <button type="button" onClick={onAdd}
        className="hidden h-[50px] w-full items-center justify-center rounded-t-xl border border-dashed border-border/30 bg-elevated px-3 text-[13px] font-medium text-muted transition hover:border-brand/40 hover:bg-brand/[0.04] hover:text-secondary md:flex">
        {t('tasks.listAddSection')}
      </button>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function TaskKanbanBoard({
  onOpenTask,
  onRequestCreate,
}: {
  onOpenTask: (t: BuildWireTask) => void;
  onRequestCreate: (sectionId?: string) => void;
}) {
  const { t } = useTranslation();
  const projectUi   = useOptionalProjectUi();
  const projectLabel = projectUi?.project.name ?? t('tasks.listWorkspaceLabel');
  const {
    filteredTasks, kanbanSections,
    addKanbanSection, renameKanbanSection, deleteKanbanSection,
    reorderKanbanSections, toggleKanbanSectionCollapsed,
    moveTaskKanban, resolveKanbanSectionId,
  } = useTaskProject();

  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const tasksBySection = useMemo(() => {
    const valid    = new Set(kanbanSections.map((s) => s.id));
    const fallback = kanbanSections[0]?.id ?? 'recent';
    const m        = new Map<string, BuildWireTask[]>();
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
    () => activeId ? filteredTasks.find((x) => x.id === activeId) ?? null : null,
    [activeId, filteredTasks],
  );

  const orderedIds = useCallback((sid: string) => (tasksBySection.get(sid) ?? []).map((x) => x.id), [tasksBySection]);

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd   = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const aid  = String(active.id);
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
      overTaskId  = hit.id;
    }
    destSection = resolveKanbanSectionId(destSection);
    const destList = orderedIds(destSection).filter((id) => id !== aid);
    let toIndex = destList.length;
    if (overTaskId) { const idx = destList.indexOf(overTaskId); toIndex = idx >= 0 ? idx : destList.length; }
    moveTaskKanban(aid, destSection, toIndex);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">

        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto pb-4 [-webkit-overflow-scrolling:touch] md:overflow-y-hidden">
          <div className="flex w-full flex-col gap-4 pb-1 md:inline-flex md:w-max md:max-w-none md:flex-row md:items-start md:gap-4">
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
                onMoveRight={(i) => i < kanbanSections.length - 1 && reorderKanbanSections(i, i + 1)}
                onOpenTask={onOpenTask}
                projectLabel={projectLabel}
              />
            ))}
            <AddSectionColumn onAdd={addKanbanSection} />
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay dropAnimation={null}>
        {activeTask && (
          <div className={`pointer-events-none w-[272px] rounded-lg border border-border/50 bg-elevated shadow-2xl ${priorityBorderClassKey(activeTask.priority)}`}>
            <div className="flex items-center justify-between border-b border-border/20 px-3 py-2">
              <span className="font-mono text-[10px] font-semibold text-muted">{activeTask.display_number}</span>
              <span className="text-[10px] text-muted">{formatShortDue(activeTask.due_date)}</span>
            </div>
            <div className="px-3 py-2.5">
              <p className="line-clamp-2 text-[12px] font-semibold leading-snug text-primary">{activeTask.title}</p>
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: statusDotColor(activeTask.status) }} />
                <Badge variant={PM_TASK_STATUS_BADGE[activeTask.status]} size="sm"
                  className="!px-1.5 !py-px !text-[10px] !font-medium !leading-tight">
                  {t(taskWorkflowTKey(activeTask.status))}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
