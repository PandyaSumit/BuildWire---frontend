import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Button,
  SegmentedControl,
  SheetDrawer,
} from "@/components/ui";
import { TaskDrawer } from "@/features/tasks/TaskDrawer";
import {
  TaskProjectProvider,
  useTaskProject,
} from "@/features/tasks/TaskProjectContext";
import { TaskKanbanBoard } from "@/features/tasks/TaskKanbanBoard";
import { TaskFiltersBar } from "@/features/tasks/TaskFiltersBar";
import { TaskBulkToolbar } from "@/features/tasks/TaskBulkToolbar";
import { TaskGanttView } from "@/features/tasks/TaskGanttView";
import { demoPrimaryAssigneeName } from "@/features/tasks/demoUsers";
import { taskWorkflowTKey, taskPriorityTKey } from "@/features/tasks/fixtures";
import { taskTypeKeyTKey } from "@/features/tasks/taskI18nKeys";
import {
  taskTablePriorityPillClassKey,
  taskTableTypePillClassKey,
} from "@/features/tasks/taskPresentation";
import { getTasksDefaultViewPref } from "@/lib/userPreferences";
import type { BuildWireTask } from "@/types/task";

type View = "kanban" | "list" | "schedule" | "floor";

type AsanaSection = { id: string; rows: BuildWireTask[] };

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

function TaskAttachmentIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function AsanaTaskList({
  sections,
  onOpenTask,
  onAddTask,
  selectedTaskId,
  onSelectTask,
  filtersOpen,
  onToggleFilters,
}: {
  sections: AsanaSection[];
  onOpenTask: (task: BuildWireTask) => void;
  onAddTask: () => void;
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
  filtersOpen: boolean;
  onToggleFilters: () => void;
}) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggleSection = useCallback((id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-11 shrink-0 items-center justify-between gap-4 border-b border-border/35 py-2.5">
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
          {t("tasks.listAddTask")}
        </Button>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-2 gap-y-1 text-[12px] text-secondary sm:gap-x-2.5">
          <button
            type="button"
            onClick={onToggleFilters}
            aria-expanded={filtersOpen}
            aria-controls="tasks-filter-panel"
            className={`h-8 shrink-0 rounded-lg px-2.5 hover:bg-muted/10 hover:text-primary ${
              filtersOpen
                ? "bg-primary/8 text-primary dark:bg-white/10"
                : ""
            }`}
          >
            {t("tasks.filter")}
          </button>
          <button
            type="button"
            className="inline-flex h-8 shrink-0 items-center rounded-lg bg-primary/8 px-2.5 text-[12px] text-primary dark:bg-white/10 dark:text-primary"
          >
            {t("tasks.listToolbarSort")}
          </button>
          <button
            type="button"
            className="h-8 shrink-0 rounded-lg px-2.5 hover:bg-muted/10 hover:text-primary"
          >
            {t("tasks.listToolbarGroup")}
          </button>
          <button
            type="button"
            className="h-8 shrink-0 rounded-lg px-2.5 hover:bg-muted/10 hover:text-primary"
          >
            {t("tasks.listToolbarOptions")}
          </button>
          <button
            type="button"
            title={t("tasks.listToolbarSearch")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[15px] leading-none hover:bg-muted/10 hover:text-primary"
          >
            ⌕
          </button>
        </div>
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-auto pt-3">
        <table className="w-full min-w-[1320px] table-fixed border-separate border-spacing-0 text-[13px]">
          <colgroup>
            <col className="min-w-0 sm:w-[28%]" />
            <col className="w-[120px]" />
            <col className="w-[100px]" />
            <col className="w-[120px]" />
            <col className="w-[120px]" />
            <col className="w-[72px]" />
            <col className="w-[156px]" />
            <col className="w-[140px]" />
            <col className="w-[88px]" />
            <col className="w-[100px]" />
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
              <th className="border-b border-r border-border/30 px-3 py-2 text-left text-xs font-medium text-secondary">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{t("tasks.listColProgress")}</span>
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
                  <span className="truncate">{t("tasks.listColCollaborators")}</span>
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
                  <span className="truncate">{t("tasks.listColProjects")}</span>
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
                  <span className="truncate">{t("tasks.listColAttachments")}</span>
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
                  <span className="truncate">{t("tasks.listColVisibility")}</span>
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
                      colSpan={11}
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
                        <span>{t(listSectionTKey(section.id))}</span>
                      </button>
                    </td>
                  </tr>
                  {!isCollapsed
                    ? section.rows.map((task) => {
                        const collaborator = demoPrimaryAssigneeName(task);
                        const dueRange = formatShortDueRange(
                          task.start_date,
                          task.due_date,
                        );
                        const selected = selectedTaskId === task.id;
                        const isDone = task.status === "done";
                        const categoryLabel =
                          task.category.trim() || t(taskTypeKeyTKey(task.type));
                        const attCount = task.attachments.length;
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
                            <td className="border-r border-border/30 px-3 py-1.5 align-middle text-[12px] tabular-nums text-secondary">
                              {task.progress}%
                            </td>
                            <td className="border-r border-border/30 px-3 py-1.5 align-middle">
                              {collaborator === "—" ? (
                                <span className="text-[12px] text-muted">—</span>
                              ) : (
                                <span className="inline-flex max-w-full items-center gap-2">
                                  <Avatar name={collaborator} size="sm" />
                                  <span className="truncate text-[12px] text-primary">
                                    {collaborator}
                                  </span>
                                </span>
                              )}
                            </td>
                            <td className="border-r border-border/30 px-3 py-1.5 align-middle">
                              <span className="inline-flex max-w-full items-center gap-1.5 rounded border border-border/45 bg-muted/12 px-2 py-0.5 text-[11px] text-secondary">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-success" />
                                <span className="truncate">
                                  {t("tasks.listWorkspaceLabel")}
                                </span>
                              </span>
                            </td>
                            <td className="border-r border-border/30 px-3 py-1.5 align-middle text-[12px] text-secondary">
                              {attCount > 0 ? (
                                <span
                                  className="inline-flex items-center gap-1"
                                  title={t("tasks.attachmentCount", {
                                    count: attCount,
                                  })}
                                >
                                  <TaskAttachmentIcon className="h-3.5 w-3.5 shrink-0 text-muted" />
                                  <span className="tabular-nums">{attCount}</span>
                                </span>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td className="border-r border-border/30 px-3 py-1.5 align-middle text-[12px] text-secondary">
                              {task.is_private
                                ? t("tasks.listVisibilityPrivate")
                                : t("tasks.listVisibilityTeam")}
                            </td>
                            <td className="px-1 py-1.5 align-middle" />
                          </tr>
                        );
                      })
                    : null}
                  <tr className="bg-bg">
                    <td
                      colSpan={11}
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
  const [selectedListTaskId, setSelectedListTaskId] = useState<string | null>(
    null,
  );

  const { filteredTasks, selectedIds, setSelectedIds, setBulkSelectMode } =
    useTaskProject();

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
    setTaskSheet({ kind: "create" });
  }, []);

  const openTask = useCallback((task: BuildWireTask) => {
    setSelectedListTaskId(task.id);
    setTaskSheet({ kind: "edit", task });
  }, []);

  const closeTaskSheet = useCallback(() => {
    setCreateKanbanSectionId(undefined);
    setTaskSheet({ kind: "none" });
  }, []);

  const tableRows = useMemo(() => filteredTasks, [filteredTasks]);
  const asanaSections = useMemo(
    () => buildAsanaSections(tableRows),
    [tableRows],
  );

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

  return (
    <div
      className={`relative flex min-h-0 min-w-0 flex-1 flex-col px-6 pt-6 ${
        selectedIds.size > 0 ? "pb-24" : "pb-6"
      }`}
    >
      <div className="shrink-0">
        <div>
          <h1 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold tracking-tight text-primary">
            {t("tasks.title")}
          </h1>
        </div>

        <div className="mt-2 min-w-0 border-b border-border/55">
          <div>
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
          </div>
        </div>
      </div>

      {view === "kanban" || view === "list" ? (
        <div
          id="tasks-filter-panel"
          className={filtersOpen ? "mt-4" : ""}
          hidden={!filtersOpen}
        >
          {filtersOpen ? <TaskFiltersBar /> : null}
        </div>
      ) : null}

      {view === "kanban" ? (
        <div
          className={`min-h-0 flex-1 overflow-hidden ${filtersOpen ? "mt-5" : "mt-6"}`}
        >
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
            sections={asanaSections}
            onOpenTask={openTask}
            onAddTask={openCreate}
            selectedTaskId={selectedListTaskId}
            onSelectTask={setSelectedListTaskId}
            filtersOpen={filtersOpen}
            onToggleFilters={() => setFiltersOpen((v) => !v)}
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
        widthClassName="max-w-[560px]"
      >
        {taskSheet.kind === "create" ? (
          <TaskDrawer
            mode="create"
            onClose={closeTaskSheet}
            onCreated={(task) => setTaskSheet({ kind: "edit", task })}
            defaultKanbanSectionId={createKanbanSectionId}
          />
        ) : null}
        {taskSheet.kind === "edit" ? (
          <TaskDrawer
            mode="edit"
            task={taskSheet.task}
            onClose={closeTaskSheet}
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

export default function ProjectTasksPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const pid = projectId ?? "";
  return (
    <TaskProjectProvider projectId={pid}>
      <ProjectTasksInner />
    </TaskProjectProvider>
  );
}
