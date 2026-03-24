import { Fragment, useCallback, useMemo, useState } from "react";
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
import {
  getDateFormatPref,
  getTasksDefaultViewPref,
  formatTaskCreatedDate,
} from "@/lib/userPreferences";
import type { BuildWireTask } from "@/types/task";

type View = "kanban" | "list" | "schedule" | "floor";

type AsanaSection = { id: string; title: string; rows: BuildWireTask[] };

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
    { id: "recent", title: "Recently assigned", rows: [] },
    { id: "today", title: "Do today", rows: [] },
    { id: "next-week", title: "Do next week", rows: [] },
    { id: "later", title: "Do later", rows: [] },
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

function AsanaTaskList({
  sections,
  onOpenTask,
  onAddTask,
}: {
  sections: AsanaSection[];
  onOpenTask: (task: BuildWireTask) => void;
  onAddTask: () => void;
}) {
  const dateFormat = getDateFormatPref();
  return (
    <div className="mx-6 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-md border border-border/70 bg-bg">
      <div className="flex items-center justify-between border-b border-border/70 px-2.5 py-1.5">
        <button
          type="button"
          onClick={onAddTask}
          className="inline-flex h-6 items-center gap-1.5 rounded-[4px] border border-[#2f6fcb] bg-[#2d74da] px-2 text-[11px] font-medium text-white hover:bg-[#2766c0]"
        >
          <span>+</span>
          <span>Add task</span>
          <span className="text-[10px]">▾</span>
        </button>
        <div className="flex items-center gap-1.5 text-[11px] text-secondary">
          <button type="button" className="h-6 px-1.5 hover:text-primary">
            Filter
          </button>
          <button
            type="button"
            className="inline-flex h-6 items-center rounded-[4px] bg-brand/15 px-1.5 text-[11px] text-brand"
          >
            Sort: 1
          </button>
          <button type="button" className="h-6 px-1.5 hover:text-primary">
            Group
          </button>
          <button type="button" className="h-6 px-1.5 hover:text-primary">
            Options
          </button>
          <button
            type="button"
            className="h-6 px-1.5 text-[12px] leading-none hover:text-primary"
          >
            ⌕
          </button>
        </div>
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-auto">
        <table className="w-full min-w-[1120px] table-fixed border-separate border-spacing-0 text-sm">
          <colgroup>
            <col className="w-[560px]" />
            <col className="w-[150px]" />
            <col className="w-[150px]" />
            <col className="w-[160px]" />
            <col className="w-[160px]" />
            <col className="w-12" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-[#151b24]">
            <tr className="h-[37px]">
              <th className="border-b border-r border-border/60 px-3 py-1 text-left text-[10px] font-medium text-secondary">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span>Name</span>
                    <span className="text-[11px] leading-none">↕</span>
                  </span>
                  <button
                    type="button"
                    aria-label="Show sort options for task name"
                    className="rounded p-0.5 text-[10px] text-secondary hover:bg-muted/30 hover:text-primary"
                  >
                    ▾
                  </button>
                </div>
              </th>
              <th className="border-b border-r border-border/60 px-3 py-1 text-left text-[10px] font-medium text-secondary">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">Due date</span>
                  <button
                    type="button"
                    aria-label="Show options for due date column"
                    className="rounded p-0.5 text-[10px] text-secondary hover:bg-muted/30 hover:text-primary"
                  >
                    ▾
                  </button>
                </div>
              </th>
              <th className="border-b border-r border-border/60 px-3 py-1 text-left text-[10px] font-medium text-secondary">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">Collaborators</span>
                  <button
                    type="button"
                    aria-label="Show options for collaborators column"
                    className="rounded p-0.5 text-[10px] text-secondary hover:bg-muted/30 hover:text-primary"
                  >
                    ▾
                  </button>
                </div>
              </th>
              <th className="border-b border-r border-border/60 px-3 py-1 text-left text-[10px] font-medium text-secondary">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">Projects</span>
                  <button
                    type="button"
                    aria-label="Show options for projects column"
                    className="rounded p-0.5 text-[10px] text-secondary hover:bg-muted/30 hover:text-primary"
                  >
                    ▾
                  </button>
                </div>
              </th>
              <th className="border-b border-r border-border/60 px-3 py-1 text-left text-[10px] font-medium text-secondary">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">Task visibility</span>
                  <button
                    type="button"
                    aria-label="Show options for task visibility column"
                    className="rounded p-0.5 text-[10px] text-secondary hover:bg-muted/30 hover:text-primary"
                  >
                    ▾
                  </button>
                </div>
              </th>
              <th className="border-b border-border/60 px-2 py-1 text-left text-[11px] font-medium text-secondary">
                <button
                  type="button"
                  aria-label="Add field"
                  className="rounded p-0.5 text-[12px] leading-none text-secondary hover:bg-muted/30 hover:text-primary"
                >
                  +
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <Fragment key={section.id}>
                <tr key={`${section.id}-header`} className="bg-muted/[0.02]">
                  <td
                    colSpan={6}
                    className="border-b border-border/60 px-3 py-2 text-[13px] font-semibold text-primary"
                  >
                    <span className="me-2 text-[10px] text-muted">▾</span>
                    <span>{section.title}</span>
                  </td>
                </tr>
                {section.rows.map((task) => {
                  const collaborator = demoPrimaryAssigneeName(task);
                  const start = formatTaskCreatedDate(
                    task.start_date.slice(0, 10),
                    dateFormat,
                  );
                  const due = formatTaskCreatedDate(
                    task.due_date.slice(0, 10),
                    dateFormat,
                  );
                  return (
                    <tr key={task.id} className="h-8 hover:bg-muted/[0.05]">
                      <td className="border-b border-border/55 px-3 py-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenTask(task)}
                          className="inline-flex max-w-full items-center gap-2 whitespace-nowrap text-[12px] text-primary hover:text-brand"
                        >
                          <span className="h-2 w-2 shrink-0 rounded-full border border-emerald-300/70 bg-emerald-400/80" />
                          <span className="shrink-0 text-[11px] text-muted">
                            {task.display_number}
                          </span>
                          <span className="truncate text-left">
                            {task.title}
                          </span>
                        </button>
                      </td>
                      <td className="border-b border-border/55 px-3 py-1.5 text-[11px] text-secondary">
                        <span className="whitespace-nowrap">
                          {start} - {due}
                        </span>
                      </td>
                      <td className="border-b border-border/55 px-3 py-1.5">
                        {collaborator === "—" ? (
                          <span className="text-[11px] text-muted">—</span>
                        ) : (
                          <span className="inline-flex max-w-full items-center gap-1.5 whitespace-nowrap">
                            <Avatar name={collaborator} size="sm" />
                            <span className="truncate text-[11px] text-primary">
                              {collaborator}
                            </span>
                          </span>
                        )}
                      </td>
                      <td className="border-b border-border/55 px-3 py-1.5 text-[11px] text-primary">
                        <span className="inline-flex max-w-full items-center gap-1 rounded bg-muted/30 px-1.5 py-0.5 text-[10px]">
                          <span className="h-1.5 w-1.5 rounded-sm bg-teal-300" />
                          <span className="truncate">My workspace</span>
                        </span>
                      </td>
                      <td className="border-b border-border/55 px-3 py-1.5 text-[11px] text-secondary">
                        —
                      </td>
                      <td className="border-b border-border/55 px-3 py-1.5 text-muted" />
                    </tr>
                  );
                })}
                <tr key={`${section.id}-add`}>
                  <td
                    colSpan={6}
                    className="border-b border-border/55 px-3 py-1.5"
                  >
                    <button
                      type="button"
                      onClick={onAddTask}
                      className="text-[12px] text-muted hover:text-primary"
                    >
                      Add task...
                    </button>
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border/60 px-3 py-1.5">
        <button
          type="button"
          className="text-[12px] text-secondary hover:text-primary"
        >
          + Add section
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

  const {
    filteredTasks,
    selectedIds,
    setSelectedIds,
    bulkSelectMode,
    setBulkSelectMode,
  } = useTaskProject();

  const openCreate = useCallback(() => {
    setTaskSheet({ kind: "create" });
  }, []);

  const openTask = useCallback((task: BuildWireTask) => {
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
      className={`relative flex min-h-0 min-w-0 flex-1 flex-col pt-6 ${
        selectedIds.size > 0 ? "pb-24" : "pb-6"
      }`}
    >
      <div className="mb-4 flex shrink-0 flex-col gap-4 px-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold tracking-tight text-primary">
            {t("tasks.title")}
          </h1>
          <p className="mt-1 text-sm text-secondary">{t("tasks.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
          <SegmentedControl<View>
            value={view}
            onChange={setView}
            options={[
              { value: "kanban", label: t("tasks.viewKanban") },
              { value: "list", label: t("tasks.viewList") },
              { value: "schedule", label: t("tasks.viewSchedule") },
              { value: "floor", label: t("tasks.viewFloorPlan") },
            ]}
          />
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
            className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white dark:text-bg"
          >
            + {t("tasks.newTask")}
          </button>
        </div>
      </div>

      {view === "kanban" || view === "list" ? (
        <div id="tasks-filter-panel" hidden={!filtersOpen}>
          {filtersOpen ? <TaskFiltersBar /> : null}
        </div>
      ) : null}

      {view === "kanban" ? (
        <TaskKanbanBoard onOpenTask={openTask} onRequestCreate={openCreate} />
      ) : null}

      {view === "list" ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <AsanaTaskList
            sections={asanaSections}
            onOpenTask={openTask}
            onAddTask={openCreate}
          />
        </div>
      ) : null}

      {view === "schedule" ? <TaskGanttView /> : null}

      {view === "floor" ? (
        <div className="mx-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-center">
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
