import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar, SegmentedControl, SheetDrawer } from "@/components/ui";
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

function AsanaTaskList({
  sections,
  onOpenTask,
  onAddTask,
  selectedTaskId,
  onSelectTask,
}: {
  sections: AsanaSection[];
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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-6">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border/35 px-0.5">
        <button
          type="button"
          onClick={onAddTask}
          className="inline-flex h-7 items-center gap-1 rounded border border-[#2f6fcb] bg-[#2d74da] px-2 text-[11px] font-semibold text-white shadow-sm hover:bg-[#2766c0]"
        >
          <span className="text-[13px] font-normal leading-none">+</span>
          <span>{t("tasks.listAddTask")}</span>
          <span className="text-[10px] opacity-90">▾</span>
        </button>
        <div className="flex items-center gap-0.5 text-[11px] text-secondary">
          <button
            type="button"
            className="h-7 rounded px-2 hover:bg-muted/10 hover:text-primary"
          >
            {t("tasks.filter")}
          </button>
          <button
            type="button"
            className="inline-flex h-7 items-center rounded bg-primary/8 px-2 text-[11px] text-primary dark:bg-white/10 dark:text-primary"
          >
            {t("tasks.listToolbarSort")}
          </button>
          <button
            type="button"
            className="h-7 px-2 hover:bg-muted/10 hover:text-primary"
          >
            {t("tasks.listToolbarGroup")}
          </button>
          <button
            type="button"
            className="h-7 px-2 hover:bg-muted/10 hover:text-primary"
          >
            {t("tasks.listToolbarOptions")}
          </button>
          <button
            type="button"
            title={t("tasks.listToolbarSearch")}
            className="flex h-7 w-7 items-center justify-center rounded text-[14px] leading-none hover:bg-muted/10 hover:text-primary"
          >
            ⌕
          </button>
        </div>
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-auto">
        <table className="w-full min-w-[1080px] table-fixed border-separate border-spacing-0 text-[13px]">
          <colgroup>
            <col className="min-w-0 sm:w-[44%]" />
            <col className="w-[148px]" />
            <col className="w-[168px]" />
            <col className="w-[148px]" />
            <col className="w-[120px]" />
            <col className="w-10" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-bg">
            <tr className="h-8">
              <th className="border-b border-border/30 px-3 py-1.5 text-left text-[11px] font-medium tracking-wide text-secondary">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1">
                    <span>{t("tasks.listColName")}</span>
                    <span className="text-muted">↕</span>
                  </span>
                  <button
                    type="button"
                    aria-label="Column options"
                    className="rounded p-0.5 text-[10px] text-muted hover:bg-muted/25 hover:text-primary"
                  >
                    ▾
                  </button>
                </div>
              </th>
              <th className="border-b border-border/30 px-3 py-1.5 text-left text-[11px] font-medium text-secondary">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{t("tasks.listColDue")}</span>
                  <button
                    type="button"
                    aria-label="Column options"
                    className="shrink-0 rounded p-0.5 text-[10px] text-muted hover:bg-muted/25 hover:text-primary"
                  >
                    ▾
                  </button>
                </div>
              </th>
              <th className="border-b border-border/30 px-3 py-1.5 text-left text-[11px] font-medium text-secondary">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{t("tasks.listColCollaborators")}</span>
                  <button
                    type="button"
                    aria-label="Column options"
                    className="shrink-0 rounded p-0.5 text-[10px] text-muted hover:bg-muted/25 hover:text-primary"
                  >
                    ▾
                  </button>
                </div>
              </th>
              <th className="border-b border-border/30 px-3 py-1.5 text-left text-[11px] font-medium text-secondary">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{t("tasks.listColProjects")}</span>
                  <button
                    type="button"
                    aria-label="Column options"
                    className="shrink-0 rounded p-0.5 text-[10px] text-muted hover:bg-muted/25 hover:text-primary"
                  >
                    ▾
                  </button>
                </div>
              </th>
              <th className="border-b border-border/30 px-3 py-1.5 text-left text-[11px] font-medium text-secondary">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{t("tasks.listColVisibility")}</span>
                  <button
                    type="button"
                    aria-label="Column options"
                    className="shrink-0 rounded p-0.5 text-[10px] text-muted hover:bg-muted/25 hover:text-primary"
                  >
                    ▾
                  </button>
                </div>
              </th>
              <th className="border-b border-border/30 px-1 py-1.5 text-left text-[11px] font-medium text-secondary">
                <button
                  type="button"
                  aria-label="Add field"
                  className="flex h-6 w-6 items-center justify-center rounded text-[13px] text-muted hover:bg-muted/25 hover:text-primary"
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
                      colSpan={6}
                      className="border-b border-border/30 px-0 py-0"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-semibold text-primary hover:bg-muted/[0.04]"
                      >
                        <span className="w-3 text-center text-[10px] text-muted">
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
                        return (
                          <tr
                            key={task.id}
                            role="row"
                            onClick={() => onSelectTask(task.id)}
                            className={`cursor-pointer border-b border-border/25 transition-colors ${
                              selected
                                ? "bg-[#2a3f5c]/55 dark:bg-[#2f405c]/50"
                                : "bg-bg hover:bg-muted/[0.06]"
                            }`}
                          >
                            <td className="px-3 py-1.5 align-middle">
                              <div className="flex min-w-0 items-center gap-2">
                                {isDone ? (
                                  <TaskDoneIcon className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                                ) : (
                                  <span className="h-2 w-2 shrink-0 rounded-full border border-emerald-400/80 bg-emerald-400/90" />
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
                            <td className="whitespace-nowrap px-3 py-1.5 align-middle text-[12px] text-secondary">
                              {dueRange}
                            </td>
                            <td className="px-3 py-1.5 align-middle">
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
                            <td className="px-3 py-1.5 align-middle">
                              <span className="inline-flex max-w-full items-center gap-1.5 rounded bg-muted/25 px-2 py-0.5 text-[11px] text-primary">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-emerald-400" />
                                <span className="truncate">
                                  {t("tasks.listWorkspaceLabel")}
                                </span>
                              </span>
                            </td>
                            <td className="px-3 py-1.5 align-middle text-[12px] text-secondary">
                              —
                            </td>
                            <td className="px-1 py-1.5 align-middle" />
                          </tr>
                        );
                      })
                    : null}
                  <tr className="bg-bg">
                    <td
                      colSpan={6}
                      className="border-b border-border/25 px-3 py-1.5"
                    >
                      <button
                        type="button"
                        onClick={onAddTask}
                        className="text-[13px] text-muted hover:text-secondary"
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
  const [taskSheet, setTaskSheet] = useState<
    | { kind: "none" }
    | { kind: "create" }
    | { kind: "edit"; task: BuildWireTask }
  >({ kind: "none" });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedListTaskId, setSelectedListTaskId] = useState<string | null>(
    null,
  );

  const {
    filteredTasks,
    selectedIds,
    setSelectedIds,
    bulkSelectMode,
    setBulkSelectMode,
  } = useTaskProject();

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

  const openCreate = useCallback(() => {
    setTaskSheet({ kind: "create" });
  }, []);

  const openTask = useCallback((task: BuildWireTask) => {
    setSelectedListTaskId(task.id);
    setTaskSheet({ kind: "edit", task });
  }, []);

  const closeTaskSheet = useCallback(() => {
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

  return (
    <div
      className={`relative flex min-h-0 min-w-0 flex-1 flex-col ${
        selectedIds.size > 0 ? "pb-24" : "pb-6"
      }`}
    >
      <div className="shrink-0 px-6 pt-6">
        <Link
          to="/projects"
          className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-secondary hover:text-primary"
        >
          <span className="text-[11px] opacity-80" aria-hidden>
            ‹
          </span>
          {t("tasks.backToProjects")}
        </Link>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold tracking-tight text-primary">
              {t("tasks.title")}
            </h1>
            <p className="mt-1 text-sm text-secondary">{t("tasks.subtitle")}</p>
          </div>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end lg:shrink-0">
            <SegmentedControl<View>
              variant="underline"
              className="min-w-0 border-border/40"
              value={view}
              onChange={setView}
              options={[
                { value: "kanban", label: t("tasks.viewKanban") },
                { value: "list", label: t("tasks.viewList") },
                { value: "schedule", label: t("tasks.viewSchedule") },
                { value: "floor", label: t("tasks.viewFloorPlan") },
              ]}
            />
            <div className="flex flex-wrap items-center gap-2">
              {view === "kanban" ? (
                <button
                  type="button"
                  onClick={() => setBulkSelectMode(!bulkSelectMode)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    bulkSelectMode
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-surface text-primary hover:bg-muted/10"
                  }`}
                >
                  Select
                </button>
              ) : null}
              {view === "kanban" || view === "list" ? (
                <button
                  type="button"
                  onClick={() => setFiltersOpen((v) => !v)}
                  aria-expanded={filtersOpen}
                  aria-controls="tasks-filter-panel"
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    filtersOpen
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-surface text-primary hover:bg-muted/10"
                  }`}
                >
                  {t("tasks.filter")}
                </button>
              ) : null}
              <button
                type="button"
                onClick={openCreate}
                className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-bg shadow-sm hover:opacity-95"
              >
                + {t("tasks.newTask")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {view === "kanban" || view === "list" ? (
        <div
          id="tasks-filter-panel"
          className="px-6"
          hidden={!filtersOpen}
        >
          {filtersOpen ? <TaskFiltersBar /> : null}
        </div>
      ) : null}

      {view === "kanban" ? (
        <div className="mt-4 min-h-0 flex-1 overflow-hidden px-6">
          <TaskKanbanBoard onOpenTask={openTask} onRequestCreate={openCreate} />
        </div>
      ) : null}

      {view === "list" ? (
        <div className="mt-1 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-t border-border/35">
          <AsanaTaskList
            sections={asanaSections}
            onOpenTask={openTask}
            onAddTask={openCreate}
            selectedTaskId={selectedListTaskId}
            onSelectTask={setSelectedListTaskId}
          />
        </div>
      ) : null}

      {view === "schedule" ? (
        <div className="mt-4 min-h-0 flex-1 px-6">
          <TaskGanttView />
        </div>
      ) : null}

      {view === "floor" ? (
        <div className="mx-6 mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-center">
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
        onClick={openCreate}
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
