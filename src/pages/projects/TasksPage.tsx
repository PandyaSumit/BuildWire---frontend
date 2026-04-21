import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar, Button, SegmentedControl, SheetDrawer } from "@/components/ui";
import { IconPlus } from "@/components/ui/icons";
import { TaskDrawer } from "@/components/task/TaskDrawer";
import {
  TaskProjectProvider,
  useTaskProject,
} from "@/hooks/task/TaskProjectContext";
import { TaskKanbanBoard } from "@/components/task/TaskKanbanBoard";
import { TaskFiltersBar, useTaskFilterCount } from "@/components/task/TaskFiltersBar";
import { TaskGroupPanel, type GroupByKey, type GroupSortOrder } from "@/components/task/TaskGroupPanel";
import { TaskBulkToolbar } from "@/components/task/TaskBulkToolbar";
import { TaskGanttView } from "@/components/task/TaskGanttView";
import { demoAssigneesDisplayList } from "@/utils/task/demoUsers";
import { taskWorkflowTKey, taskPriorityTKey } from "@/utils/task/fixtures";
import { taskTypeKeyTKey } from "@/utils/task/taskI18nKeys";
import {
  taskTablePriorityPillClassKey,
  taskTableTypePillClassKey,
} from "@/utils/task/taskPresentation";
import { taskDrawingListCell } from "@/utils/task/taskDrawingDisplay";
import { getTasksDefaultViewPref } from "@/lib/userPreferences";
import type { BuildWireTask } from "@/types/task";

type View = "kanban" | "list" | "schedule" | "floor";

type AsanaSection = { id: string; rows: BuildWireTask[]; label?: string };

function toDateMidday(isoDate: string) {
  return new Date(`${isoDate}T12:00:00`);
}

function buildAsanaSections(rows: BuildWireTask[]): AsanaSection[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7Days = new Date(today);
  in7Days.setDate(today.getDate() + 7);
  const in14Days = new Date(today);
  in14Days.setDate(today.getDate() + 14);

  const sections: AsanaSection[] = [
    { id: "recent", rows: [] },
    { id: "today", rows: [] },
    { id: "next-week", rows: [] },
    { id: "later", rows: [] },
  ];

  rows.forEach((task, index) => {
    if (index < 2) {
      sections[0].rows.push(task);
      return;
    }
    const due = toDateMidday(task.due_date.slice(0, 10));
    if (Number.isNaN(due.getTime()) || due <= today) {
      sections[1].rows.push(task);
      return;
    }
    if (due <= in7Days || due <= in14Days) {
      sections[2].rows.push(task);
      return;
    }
    sections[3].rows.push(task);
  });

  return sections;
}

const PRIORITY_ORDER = ['critical', 'high', 'medium', 'low'];
const STATUS_ORDER = ['open', 'in_progress', 'in_review', 'blocked', 'awaiting_inspection', 'done', 'void'];

function buildGroupedSections(
  rows: BuildWireTask[],
  groupBy: GroupByKey,
  sortOrder: GroupSortOrder,
): AsanaSection[] {
  if (groupBy === 'sections') return buildAsanaSections(rows);

  const groupMap = new Map<string, BuildWireTask[]>();
  for (const task of rows) {
    let key: string;
    switch (groupBy) {
      case 'priority': key = task.priority; break;
      case 'status': key = task.status; break;
      case 'type': key = task.type; break;
      case 'trade': key = task.trade || 'none'; break;
      case 'floor': key = task.floor || 'none'; break;
      case 'due_date': key = task.due_date.slice(0, 10) || 'none'; break;
      default: key = 'none';
    }
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(task);
  }

  let keys = Array.from(groupMap.keys());
  if (sortOrder === 'asc') {
    if (groupBy === 'priority') keys.sort((a, b) => PRIORITY_ORDER.indexOf(a) - PRIORITY_ORDER.indexOf(b));
    else if (groupBy === 'status') keys.sort((a, b) => STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b));
    else keys.sort((a, b) => a.localeCompare(b));
  } else if (sortOrder === 'desc') {
    if (groupBy === 'priority') keys.sort((a, b) => PRIORITY_ORDER.indexOf(b) - PRIORITY_ORDER.indexOf(a));
    else if (groupBy === 'status') keys.sort((a, b) => STATUS_ORDER.indexOf(b) - STATUS_ORDER.indexOf(a));
    else keys.sort((a, b) => b.localeCompare(a));
  } else {
    if (groupBy === 'priority') keys.sort((a, b) => PRIORITY_ORDER.indexOf(a) - PRIORITY_ORDER.indexOf(b));
    else if (groupBy === 'status') keys.sort((a, b) => STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b));
  }

  return keys.map((key) => ({ id: `${groupBy}:${key}`, rows: groupMap.get(key)!, label: key }));
}

function formatShortDueRange(startIso: string, endIso: string): string {
  const s = new Date(`${startIso.slice(0, 10)}T12:00:00`);
  const e = new Date(`${endIso.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "—";
  const sameMonth =
    s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    const mon = s.toLocaleDateString(undefined, { month: "short" });
    return `${mon} ${s.getDate()}\u2009–\u2009${e.getDate()}`;
  }
  const left = s.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const right = e.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return `${left} – ${right}`;
}

function listSectionTKey(
  pid: string,
):
  | "tasks.listSectionRecent"
  | "tasks.listSectionToday"
  | "tasks.listSectionNextWeek"
  | "tasks.listSectionLater" {
  switch (pid) {
    case "recent":
      return "tasks.listSectionRecent";
    case "today":
      return "tasks.listSectionToday";
    case "next-week":
      return "tasks.listSectionNextWeek";
    case "later":
      return "tasks.listSectionLater";
    default:
      return "tasks.listSectionRecent";
  }
}

function TaskDoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
    >
      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 1 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
    </svg>
  );
}

/** Asana-style: show a tight face stack; names only in tooltips. */
const COLLAB_AVATAR_STACK_MAX = 3;

function TaskCollaboratorsCell({ task }: { task: BuildWireTask }) {
  const people = demoAssigneesDisplayList(task);
  if (!people.length) {
    return <span className="text-[12px] text-muted">—</span>;
  }
  const shown = people.slice(0, COLLAB_AVATAR_STACK_MAX);
  const overflow = people.length - shown.length;
  const allNamesLabel = people.map((p) => p.name).join(" · ");
  const overflowNames = people
    .slice(COLLAB_AVATAR_STACK_MAX)
    .map((p) => p.name)
    .join(" · ");

  return (
    <div
      className="flex w-full min-w-0 items-center justify-center"
      title={allNamesLabel}
      aria-label={allNamesLabel}
    >
      <div className="flex shrink-0 items-center">
        {shown.map((p, i) => (
          <span
            key={p.id}
            title={p.name}
            className={`relative inline-block ${i > 0 ? "-ml-1.5" : ""}`}
            style={{ zIndex: i + 1 }}
          >
            <Avatar
              name={p.name}
              size="sm"
              className="ring-2 ring-bg shadow-sm"
            />
          </span>
        ))}
        {overflow > 0 ? (
          <div
            className="relative -ml-1.5 flex h-8 w-8 shrink-0 cursor-default items-center justify-center rounded-full border border-border/80 bg-muted text-[10px] font-semibold tabular-nums text-secondary ring-2 ring-bg shadow-sm"
            style={{ zIndex: shown.length + 1 }}
            title={overflowNames}
          >
            +{overflow}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TaskCommentIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
    >
      <path d="M2 4.25C2 3.56 2.56 3 3.25 3h9.5c.69 0 1.25.56 1.25 1.25v5.5c0 .69-.56 1.25-1.25 1.25h-2.2l-2.15 1.65a.55.55 0 0 1-.9-.43V11h-2.1c-.69 0-1.25-.56-1.25-1.25v-5.5z" />
    </svg>
  );
}

function AsanaTaskList({
  projectId,
  sections,
  groupBy,
  onOpenTask,
  onAddTask,
  selectedTaskId,
  onSelectTask,
}: {
  projectId: string | undefined;
  sections: AsanaSection[];
  groupBy: GroupByKey;
  onOpenTask: (task: BuildWireTask) => void;
  onAddTask: () => void;
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = useCallback((id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="min-h-0 min-w-0 flex-1 overflow-auto">
        <table className="w-full min-w-[1032px] table-fixed border-separate border-spacing-0 text-[13px]">
          <colgroup>
            <col className="min-w-0 sm:w-[28%]" />
            <col className="w-[120px]" />
            <col className="w-[100px]" />
            <col className="w-[120px]" />
            <col className="w-[120px]" />
            <col className="w-[116px]" />
            <col className="w-[160px]" />
            <col className="w-10" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-bg">
            <tr className="h-9">
              <th className="border-b border-r border-border/30 px-3 py-2 text-left text-xs font-medium tracking-wide text-secondary">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1">
                    <span>{t("tasks.listColName")}</span>
                    <span className="text-muted">↕</span>
                  </span>
                  <button
                    type="button"
                    aria-label="Column options"
                    className="rounded p-0.5 text-xs text-muted hover:bg-muted/25 hover:text-primary"
                  >
                    ▾
                  </button>
                </div>
              </th>
              <th className="border-b border-r border-border/30 px-3 py-2 text-left text-xs font-medium text-secondary">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{t("tasks.listColStatus")}</span>
                  <button
                    type="button"
                    aria-label="Column options"
                    className="shrink-0 rounded p-0.5 text-xs text-muted hover:bg-muted/25 hover:text-primary"
                  >
                    ▾
                  </button>
                </div>
              </th>
              <th className="border-b border-r border-border/30 px-3 py-2 text-left text-xs font-medium text-secondary">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{t("tasks.listColPriority")}</span>
                  <button
                    type="button"
                    aria-label="Column options"
                    className="shrink-0 rounded p-0.5 text-xs text-muted hover:bg-muted/25 hover:text-primary"
                  >
                    ▾
                  </button>
                </div>
              </th>
              <th className="border-b border-r border-border/30 px-3 py-2 text-left text-xs font-medium text-secondary">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{t("tasks.listColCategory")}</span>
                  <button
                    type="button"
                    aria-label="Column options"
                    className="shrink-0 rounded p-0.5 text-xs text-muted hover:bg-muted/25 hover:text-primary"
                  >
                    ▾
                  </button>
                </div>
              </th>
              <th className="border-b border-r border-border/30 px-3 py-2 text-left text-xs font-medium text-secondary">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{t("tasks.listColDue")}</span>
                  <button
                    type="button"
                    aria-label="Column options"
                    className="shrink-0 rounded p-0.5 text-xs text-muted hover:bg-muted/25 hover:text-primary"
                  >
                    ▾
                  </button>
                </div>
              </th>
              <th className="border-b border-r border-border/30 px-2 py-2 text-center text-xs font-medium text-secondary">
                <div className="flex items-center justify-center gap-1">
                  <span className="truncate">
                    {t("tasks.listColCollaborators")}
                  </span>
                  <button
                    type="button"
                    aria-label="Column options"
                    className="shrink-0 rounded p-0.5 text-xs text-muted hover:bg-muted/25 hover:text-primary"
                  >
                    ▾
                  </button>
                </div>
              </th>
              <th className="border-b border-r border-border/30 px-3 py-2 text-left text-xs font-medium text-secondary">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{t("tasks.listColDrawing")}</span>
                  <button
                    type="button"
                    aria-label="Column options"
                    className="shrink-0 rounded p-0.5 text-xs text-muted hover:bg-muted/25 hover:text-primary"
                  >
                    ▾
                  </button>
                </div>
              </th>
              <th className="border-b border-border/30 px-1 py-2 text-left text-xs font-medium text-secondary">
                <button
                  type="button"
                  aria-label="Add field"
                  className="flex h-6 w-6 items-center justify-center rounded text-xs text-muted hover:bg-muted/25 hover:text-primary"
                >
                  +
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => {
              const isCollapsed = Boolean(collapsed[section.id]);
              return (
                <Fragment key={section.id}>
                  <tr className="bg-bg">
                    <td
                      colSpan={8}
                      className="border-b border-border/30 px-0 py-0"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-base font-semibold text-primary hover:bg-muted/[0.04]"
                      >
                        <span className="w-3 text-center text-xs text-muted">
                          {isCollapsed ? "▸" : "▾"}
                        </span>
                        <span>
                          {section.label
                            ? groupBy === 'priority'
                              ? t(taskPriorityTKey(section.label as Parameters<typeof taskPriorityTKey>[0]))
                              : groupBy === 'status'
                              ? t(taskWorkflowTKey(section.label as Parameters<typeof taskWorkflowTKey>[0]))
                              : groupBy === 'type'
                              ? t(taskTypeKeyTKey(section.label as Parameters<typeof taskTypeKeyTKey>[0]))
                              : section.label === 'none' ? t('tasks.group.noValue') : section.label
                            : t(listSectionTKey(section.id))}
                        </span>
                      </button>
                    </td>
                  </tr>
                  {!isCollapsed
                    ? section.rows.map((task) => {
                        const dueRange = formatShortDueRange(
                          task.start_date,
                          task.due_date,
                        );
                        const selected = selectedTaskId === task.id;
                        const isDone = task.status === "done";
                        const categoryLabel =
                          task.category.trim() || t(taskTypeKeyTKey(task.type));
                        const drawingCell = taskDrawingListCell(task);
                        return (
                          <tr
                            key={task.id}
                            role="row"
                            onClick={() => onSelectTask(task.id)}
                            className={`cursor-pointer border-b border-border/25 transition-colors ${
                              selected
                                ? "bg-primary/[0.07] dark:bg-[#2f405c]/50"
                                : "bg-bg hover:bg-muted/[0.06]"
                            }`}
                          >
                            <td className="border-r border-border/30 py-1.5 pl-8 pr-1 align-middle">
                              <div className="flex min-w-0 items-center gap-2">
                                {isDone ? (
                                  <TaskDoneIcon className="h-3.5 w-3.5 shrink-0 text-success" />
                                ) : (
                                  <span className="h-2 w-2 shrink-0 rounded-full border border-success/85 bg-success" />
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenTask(task);
                                  }}
                                  className="inline-flex min-w-0 flex-1 items-center gap-2 whitespace-nowrap text-left text-[13px] text-primary hover:underline"
                                >
                                  <span className="shrink-0 font-mono text-[11px] text-muted">
                                    {task.display_number}
                                  </span>
                                  <span className="min-w-0 truncate">
                                    {task.title}
                                  </span>
                                </button>
                                {task.comments_count > 0 ? (
                                  <span
                                    className="inline-flex shrink-0 items-center gap-0.5 text-muted"
                                    title={t("tasks.commentCount", {
                                      count: task.comments_count,
                                    })}
                                  >
                                    <TaskCommentIcon className="h-3.5 w-3.5" />
                                    <span className="text-[11px] tabular-nums text-secondary">
                                      {task.comments_count}
                                    </span>
                                  </span>
                                ) : null}
                              </div>
                            </td>
                            <td className="border-r border-border/30 px-3 py-1.5 align-middle">
                              <span className="line-clamp-2 text-[12px] font-medium text-primary">
                                {t(taskWorkflowTKey(task.status))}
                              </span>
                            </td>
                            <td className="border-r border-border/30 px-3 py-1.5 align-middle">
                              <span
                                className={`inline-flex max-w-full rounded-md border px-2 py-0.5 text-[11px] font-medium ${taskTablePriorityPillClassKey(task.priority)}`}
                              >
                                {t(taskPriorityTKey(task.priority))}
                              </span>
                            </td>
                            <td className="border-r border-border/30 px-3 py-1.5 align-middle">
                              <span
                                className={`inline-flex max-w-full truncate rounded-md border px-2 py-0.5 text-[11px] font-medium ${taskTableTypePillClassKey(task.type)}`}
                                title={categoryLabel}
                              >
                                {categoryLabel}
                              </span>
                            </td>
                            <td className="whitespace-nowrap border-r border-border/30 px-3 py-1.5 align-middle text-[12px] text-secondary">
                              {dueRange}
                            </td>
                            <td className="border-r border-border/30 px-2 py-1.5 align-middle">
                              <TaskCollaboratorsCell task={task} />
                            </td>
                            <td className="border-r border-border/30 px-3 py-1.5 align-middle text-[12px] text-secondary">
                              {drawingCell.planId && projectId ? (
                                <Link
                                  to={`/projects/${projectId}/drawings/viewer/${drawingCell.planId}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex max-w-full min-w-0 items-center gap-1.5 font-medium text-brand hover:underline"
                                  title={drawingCell.title}
                                >
                                  <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-brand/80" />
                                  <span className="truncate">
                                    {drawingCell.label}
                                  </span>
                                </Link>
                              ) : drawingCell.label ? (
                                <span
                                  className="inline-flex max-w-full items-center gap-1.5 text-[12px] text-primary"
                                  title={drawingCell.title}
                                >
                                  <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-primary/70" />
                                  <span className="truncate">
                                    {drawingCell.label}
                                  </span>
                                </span>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td className="px-1 py-1.5 align-middle" />
                          </tr>
                        );
                      })
                    : null}
                  <tr className="bg-bg">
                    <td
                      colSpan={8}
                      className="border-b border-border/25 py-1.5 pl-8 pr-3"
                    >
                      <button
                        type="button"
                        onClick={onAddTask}
                        className="block ps-4 text-left text-[13px] text-muted hover:text-secondary"
                      >
                        {t("tasks.listAddTaskPlaceholder")}
                      </button>
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="shrink-0 border-t border-border/30 py-2">
        <button
          type="button"
          className="px-0 text-[13px] text-secondary hover:text-primary"
        >
          {t("tasks.listAddSection")}
        </button>
      </div>
    </div>
  );
}

function ProjectTasksInner() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const [view, setView] = useState<View>(() =>
    getTasksDefaultViewPref() === "kanban" ? "kanban" : "list",
  );
  const [createKanbanSectionId, setCreateKanbanSectionId] = useState<
    string | undefined
  >(undefined);
  const [taskSheet, setTaskSheet] = useState<
    | { kind: "none" }
    | { kind: "create" }
    | { kind: "edit"; task: BuildWireTask }
  >({ kind: "none" });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupByKey>('sections');
  const [groupSortOrder, setGroupSortOrder] = useState<GroupSortOrder>('custom');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [selectedListTaskId, setSelectedListTaskId] = useState<string | null>(
    null,
  );
  const [taskDrawerExpanded, setTaskDrawerExpanded] = useState(false);

  const { filteredTasks, selectedIds, setSelectedIds, setBulkSelectMode, filters, setFilters } =
    useTaskProject();
  const activeFilterCount = useTaskFilterCount();

  useEffect(() => {
    if (!filteredTasks.length) {
      setSelectedListTaskId(null);
      return;
    }
    setSelectedListTaskId((prev) => {
      if (prev && filteredTasks.some((x) => x.id === prev)) return prev;
      return filteredTasks[0].id;
    });
  }, [filteredTasks]);

  const openCreate = useCallback((kanbanSectionId?: string) => {
    setCreateKanbanSectionId(kanbanSectionId);
    setTaskDrawerExpanded(false);
    setTaskSheet({ kind: "create" });
  }, []);

  const openTask = useCallback((task: BuildWireTask) => {
    setSelectedListTaskId(task.id);
    setTaskDrawerExpanded(false);
    setTaskSheet({ kind: "edit", task });
  }, []);

  const closeTaskSheet = useCallback(() => {
    setCreateKanbanSectionId(undefined);
    setTaskDrawerExpanded(false);
    setTaskSheet({ kind: "none" });
  }, []);

  const tableRows = useMemo(() => filteredTasks, [filteredTasks]);
  const asanaSections = useMemo(
    () => buildGroupedSections(tableRows, groupBy, groupSortOrder),
    [tableRows, groupBy, groupSortOrder],
  );

  const handleGroupByChange = useCallback((v: GroupByKey) => {
    setGroupBy(v);
    setGroupSortOrder('custom');
  }, []);

  const handleGroupClear = useCallback(() => {
    setGroupBy('sections');
    setGroupSortOrder('custom');
    setGroupOpen(false);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setBulkSelectMode(false);
  }, [setBulkSelectMode, setSelectedIds]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (
        el?.closest(
          'input, textarea, select, [contenteditable="true"], [role="combobox"]',
        )
      ) {
        return;
      }
      if (e.key === "n" || e.key === "N") {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        e.preventDefault();
        openCreate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openCreate]);

  useEffect(() => {
    if (searchExpanded) searchRef.current?.focus();
  }, [searchExpanded]);

  return (
    <div
      className={`relative flex min-h-0 min-w-0 flex-1 flex-col px-6 pt-6 ${
        selectedIds.size > 0 ? "pb-24" : "pb-6"
      }`}
    >
      <div className="shrink-0">
        {/* Row 1: heading + Add task button */}
        <div className="flex items-center justify-between">
          <h1 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold tracking-tight text-primary">
            {t("tasks.title")}
          </h1>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => openCreate()}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 px-3 !py-0 text-[12px] font-semibold"
          >
            <IconPlus />
            {t("tasks.listAddTask")}
          </Button>
        </div>

        {/* Row 2: tabs (left) + toolbar buttons (right) */}
        <div className="relative mt-2 flex min-w-0 items-center justify-between border-b border-border/55">
          <SegmentedControl<View>
            variant="underline"
            className="min-w-0 !border-b-0"
            value={view}
            onChange={setView}
            options={[
              { value: "kanban", label: t("tasks.viewKanban") },
              { value: "list", label: t("tasks.viewList") },
              { value: "schedule", label: t("tasks.viewSchedule") },
              { value: "floor", label: t("tasks.viewFloorPlan") },
            ]}
          />

          {/* Toolbar buttons */}
          <div className="mb-1 flex shrink-0 items-center gap-x-1 text-[12px] text-secondary">
            {searchExpanded ? (
              <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-surface/40 px-2.5 py-1">
                <svg className="h-3.5 w-3.5 shrink-0 text-muted" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                  <path d="M6.5 1a5.5 5.5 0 1 0 3.535 9.596l3.185 3.184a.75.75 0 1 0 1.06-1.06L11.096 10.03A5.5 5.5 0 0 0 6.5 1zm-4 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0z" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  placeholder={t("tasks.workspaceSearchPlaceholder")}
                  className="w-44 bg-transparent text-[12px] text-primary placeholder:text-muted focus:outline-none"
                  onBlur={() => { if (!filters.search.trim()) setSearchExpanded(false); }}
                />
                <button type="button" onClick={() => { setFilters((f) => ({ ...f, search: '' })); setSearchExpanded(false); }} className="shrink-0 rounded p-0.5 text-muted hover:text-primary" aria-label="Close search">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" /></svg>
                </button>
              </div>
            ) : (
              <>
                <button type="button" onClick={() => { setFiltersOpen((v) => !v); setGroupOpen(false); }} aria-expanded={filtersOpen} className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 hover:bg-muted/10 hover:text-primary ${filtersOpen ? "bg-muted/10 text-primary" : ""}`}>
                  <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden><path d="M1.5 3.25a.75.75 0 0 1 .75-.75h11.5a.75.75 0 0 1 0 1.5H2.25a.75.75 0 0 1-.75-.75zM3 7.25a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 3 7.25zm2 4a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 11.25z" /></svg>
                  {t("tasks.filter")}
                  {activeFilterCount > 0 ? <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">{activeFilterCount}</span> : null}
                </button>
                <button type="button" className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-muted/8 px-2.5 text-primary dark:bg-white/8">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden><path d="M3.5 3.75a.75.75 0 0 0-1.5 0v8.5a.75.75 0 0 0 1.5 0v-8.5zm5.25 0a.75.75 0 0 0-1.5 0v8.5a.75.75 0 0 0 1.5 0V7.5l3.22 5.28a.75.75 0 0 0 1.28-.78V3.75a.75.75 0 0 0-1.5 0v4.75L8.75 3.22z" /></svg>
                  {t("tasks.listToolbarSort")}
                </button>
                <button type="button" onClick={() => { setGroupOpen((v) => !v); setFiltersOpen(false); }} aria-expanded={groupOpen} className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 hover:bg-muted/10 hover:text-primary ${groupBy !== 'sections' || groupOpen ? "bg-muted/10 text-primary" : ""}`}>
                  <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden><path d="M1 2.75A.75.75 0 0 1 1.75 2h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 1 2.75zm0 5A.75.75 0 0 1 1.75 7h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 1 7.75zm0 5a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75zM9.25 2a.75.75 0 0 0 0 1.5h5a.75.75 0 0 0 0-1.5h-5zm0 5a.75.75 0 0 0 0 1.5h5a.75.75 0 0 0 0-1.5h-5zm0 5a.75.75 0 0 0 0 1.5h5a.75.75 0 0 0 0-1.5h-5z" /></svg>
                  {t("tasks.listToolbarGroup")}
                </button>
                <button type="button" className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 hover:bg-muted/10 hover:text-primary">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden><path d="M8 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM1.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm13 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" /></svg>
                  {t("tasks.listToolbarOptions")}
                </button>
                <button type="button" title={t("tasks.listToolbarSearch")} onClick={() => setSearchExpanded(true)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-muted/10 hover:text-primary">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden><path d="M6.5 1a5.5 5.5 0 1 0 3.535 9.596l3.185 3.184a.75.75 0 1 0 1.06-1.06L11.096 10.03A5.5 5.5 0 0 0 6.5 1zm-4 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0z" /></svg>
                </button>
              </>
            )}
          </div>

          {/* Floating panels — anchored to this row */}
          {filtersOpen ? (
            <div className="absolute right-0 top-full z-30 mt-1 w-[500px] max-w-full">
              <TaskFiltersBar />
            </div>
          ) : null}
          {groupOpen ? (
            <div className="absolute right-0 top-full z-30 mt-1 w-[500px] max-w-full">
              <TaskGroupPanel
                groupBy={groupBy}
                sortOrder={groupSortOrder}
                onGroupByChange={handleGroupByChange}
                onSortOrderChange={setGroupSortOrder}
                onClear={handleGroupClear}
              />
            </div>
          ) : null}
        </div>
      </div>

      {view === "kanban" ? (
        <div className="min-h-0 flex-1 overflow-hidden mt-4">
          <TaskKanbanBoard
            onOpenTask={openTask}
            onRequestCreate={openCreate}
            filtersOpen={filtersOpen}
            onToggleFilters={() => setFiltersOpen((v) => !v)}
          />
        </div>
      ) : null}

      {view === "list" ? (
        <div className="mt-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <AsanaTaskList
            projectId={projectId}
            sections={asanaSections}
            groupBy={groupBy}
            onOpenTask={openTask}
            onAddTask={openCreate}
            selectedTaskId={selectedListTaskId}
            onSelectTask={setSelectedListTaskId}
          />
        </div>
      ) : null}

      {view === "schedule" ? (
        <div className="mt-2 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <TaskGanttView />
        </div>
      ) : null}

      {view === "floor" ? (
        <div className="mt-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-center">
          <p className="text-sm font-medium text-primary">
            {t("tasks.floorBanner")}
          </p>
          {projectId ? (
            <Link
              to={`/projects/${projectId}/drawings`}
              className="mt-2 inline-block text-sm font-semibold text-brand hover:underline"
            >
              {t("tasks.floorPlanLink")}
            </Link>
          ) : null}
        </div>
      ) : null}

      <SheetDrawer
        open={taskSheet.kind !== "none"}
        title=""
        hideTitleBar
        onClose={closeTaskSheet}
        widthClassName={
          taskDrawerExpanded
            ? "max-w-[min(100vw,1180px)]"
            : "max-w-[720px]"
        }
      >
        {taskSheet.kind === "create" ? (
          <TaskDrawer
            mode="create"
            onClose={closeTaskSheet}
            expanded={taskDrawerExpanded}
            onToggleExpand={() => setTaskDrawerExpanded((v) => !v)}
            onCreated={(task) => setTaskSheet({ kind: "edit", task })}
            defaultKanbanSectionId={createKanbanSectionId}
          />
        ) : null}
        {taskSheet.kind === "edit" ? (
          <TaskDrawer
            mode="edit"
            task={taskSheet.task}
            onClose={closeTaskSheet}
            expanded={taskDrawerExpanded}
            onToggleExpand={() => setTaskDrawerExpanded((v) => !v)}
          />
        ) : null}
      </SheetDrawer>

      <TaskBulkToolbar onClearSelection={clearSelection} />

      <button
        type="button"
        onClick={() => openCreate()}
        className="fixed bottom-6 end-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white shadow-lg shadow-brand/20 dark:text-bg md:hidden"
        aria-label={t("tasks.newTaskFab")}
      >
        +
      </button>
    </div>
  );
}

export default function TasksPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const pid = projectId ?? "";
  return (
    <TaskProjectProvider projectId={pid}>
      <ProjectTasksInner />
    </TaskProjectProvider>
  );
}
