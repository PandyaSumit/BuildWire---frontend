import { useCallback, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DataTable, SegmentedControl, SheetDrawer } from "@/components/ui";
import { TaskDrawer } from "@/features/tasks/TaskDrawer";
import { getTaskListColumns } from "@/features/tasks/taskListColumns";
import { TaskProjectProvider, useTaskProject } from "@/features/tasks/TaskProjectContext";
import { TaskKanbanBoard } from "@/features/tasks/TaskKanbanBoard";
import { TaskFiltersBar } from "@/features/tasks/TaskFiltersBar";
import { TaskBulkToolbar } from "@/features/tasks/TaskBulkToolbar";
import { TaskGanttView } from "@/features/tasks/TaskGanttView";
import { getDateFormatPref, getTasksDefaultViewPref } from "@/lib/userPreferences";
import type { BuildWireTask } from "@/types/task";
import { createBuildWireTask } from "@/features/tasks/taskFactory";
import { emitTaskNotification } from "@/features/notifications/taskNotifications";

type View = "kanban" | "list" | "schedule" | "floor";

function ProjectTasksInner() {
  const { t, i18n } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const [view, setView] = useState<View>(() =>
    getTasksDefaultViewPref() === "kanban" ? "kanban" : "list",
  );
  const [taskSheet, setTaskSheet] = useState<
    { kind: "none" } | { kind: "create" } | { kind: "edit"; task: BuildWireTask }
  >({ kind: "none" });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const {
    filteredTasks,
    selectedIds,
    setSelectedIds,
    bulkSelectMode,
    setBulkSelectMode,
    addTask,
    nextDisplayNumber,
    voidTasks,
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
  const visibleIds = useMemo(() => tableRows.map((x) => x.id), [tableRows]);

  const onToggleRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, [setSelectedIds]);

  const onToggleAll = useCallback(
    (ids: string[]) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        const allOn = ids.length > 0 && ids.every((id) => next.has(id));
        if (allOn) ids.forEach((id) => next.delete(id));
        else ids.forEach((id) => next.add(id));
        return next;
      });
    },
    [setSelectedIds],
  );

  const dateFormat = getDateFormatPref();

  const onRowMenu = useCallback(
    (action: "edit" | "duplicate" | "move" | "delete", task: BuildWireTask) => {
      if (action === "edit") openTask(task);
      if (action === "duplicate") {
        const copy = createBuildWireTask(nextDisplayNumber(), {
          title: `${task.title} (copy)`,
          description: task.description,
          type: task.type,
          priority: task.priority,
          trade: task.trade,
          floor: task.floor,
          location_detail: task.location_detail,
          assignees: [...task.assignees],
          watchers: [...task.watchers],
          start_date: task.start_date.slice(0, 10),
          due_date: task.due_date.slice(0, 10),
          is_private: task.is_private,
          tags: [...task.tags],
          blocked_reason: task.blocked_reason,
          parent_task_id: task.parent_task_id,
          status: "open",
        }, "u_current");
        addTask(copy);
        emitTaskNotification({ kind: "assigned", taskId: copy.id, userIds: copy.assignees });
      }
      if (action === "move") {
        // Placeholder — project picker when API exists
      }
      if (action === "delete") voidTasks([task.id]);
    },
    [addTask, nextDisplayNumber, openTask, voidTasks],
  );

  const taskColumns = useMemo(
    () =>
      getTaskListColumns({
        onTaskOpen: openTask,
        dateFormat,
        visibleIds,
        selectedIds,
        onToggleRow,
        onToggleAll,
        t,
        onRowMenu,
      }),
    [
      openTask,
      dateFormat,
      visibleIds,
      selectedIds,
      onToggleRow,
      onToggleAll,
      t,
      i18n.language,
      onRowMenu,
    ],
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
              onClick={() => setBulkSelectMode((v) => !v)}
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
          <DataTable
            columns={taskColumns}
            data={tableRows}
            rowKey={(row) => row.id}
            variant="flush"
            tableMinWidthClassName="min-w-[1680px]"
            className="min-h-0 min-w-0 flex-1"
            maxHeightClassName="max-h-none"
            onRowClick={(row) => openTask(row)}
          />
        </div>
      ) : null}

      {view === "schedule" ? <TaskGanttView /> : null}

      {view === "floor" ? (
        <div className="mx-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-center">
          <p className="text-sm font-medium text-primary">{t("tasks.floorBanner")}</p>
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
          <TaskDrawer mode="edit" task={taskSheet.task} onClose={closeTaskSheet} />
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
