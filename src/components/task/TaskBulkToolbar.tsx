import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { TaskPriorityKey, TaskStatus } from "@/types/task";
import { KANBAN_STATUSES } from "@/utils/task/taskConstants";
import { useTaskProject } from "@/hooks/task/TaskProjectContext";
import { taskWorkflowTKey, taskPriorityTKey } from "@/utils/task/fixtures";
import { DEMO_USERS } from "@/utils/task/demoUsers";
import { Button, DeleteConfirmDialog, Select } from "@/components/ui";

export function TaskBulkToolbar({
  onClearSelection,
}: {
  onClearSelection: () => void;
}) {
  const { t } = useTranslation();
  const [voidConfirmOpen, setVoidConfirmOpen] = useState(false);
  const { selectedIds, bulkSetStatus, bulkSetPriority, bulkAssign, voidTasks } =
    useTaskProject();

  const ids = [...selectedIds];
  if (ids.length === 0) return null;

  const statusOptions = [{ value: "", label: t("tasks.bulk.changeStatus") }, ...KANBAN_STATUSES.map((s) => ({ value: s, label: t(taskWorkflowTKey(s)) }))];
  const assignOptions = [{ value: "", label: t("tasks.bulk.assign") }, ...DEMO_USERS.map((u) => ({ value: u.id, label: u.name }))];
  const priorityOptions = [{ value: "", label: t("tasks.bulk.setPriority") }, ...(["critical", "high", "medium", "low"] as const).map((p) => ({ value: p, label: t(taskPriorityTKey(p)) }))];

  return (
    <div className="fixed bottom-0 start-0 end-0 z-40 border-t border-border bg-elevated/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm dark:shadow-[0_-8px_24px_rgba(0,0,0,0.4)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-primary">
          {t("tasks.bulk.selected", { count: ids.length })}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            fullWidth={false}
            size="sm"
            options={statusOptions}
            value=""
            onValueChange={(v) => { if (v) bulkSetStatus(ids, v as TaskStatus); }}
            triggerClassName="w-40"
          />
          <Select
            fullWidth={false}
            size="sm"
            options={assignOptions}
            value=""
            onValueChange={(v) => { if (v) bulkAssign(ids, [v]); }}
            triggerClassName="w-36"
          />
          <Select
            fullWidth={false}
            size="sm"
            options={priorityOptions}
            value=""
            onValueChange={(v) => { if (v) bulkSetPriority(ids, v as TaskPriorityKey); }}
            triggerClassName="w-36"
          />
          <Button variant="danger" size="sm" onClick={() => setVoidConfirmOpen(true)}>
            {t("tasks.bulk.delete")}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            {t("common.cancel")}
          </Button>
        </div>
      </div>
      <DeleteConfirmDialog
        open={voidConfirmOpen}
        onOpenChange={setVoidConfirmOpen}
        title={t("confirmDialog.bulkVoidTitle", { count: ids.length })}
        description={t("confirmDialog.bulkVoidDescription")}
        onConfirm={() => {
          voidTasks(ids);
          onClearSelection();
        }}
      />
    </div>
  );
}
