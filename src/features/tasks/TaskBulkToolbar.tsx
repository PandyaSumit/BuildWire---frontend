import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TaskPriorityKey, TaskStatus } from '@/types/task';
import { KANBAN_STATUSES } from '@/features/tasks/taskConstants';
import { useTaskProject } from '@/features/tasks/TaskProjectContext';
import { taskWorkflowTKey, taskPriorityTKey } from '@/features/tasks/fixtures';
import { DEMO_USERS } from '@/features/tasks/demoUsers';
import { DeleteConfirmDialog } from '@/components/ui';

export function TaskBulkToolbar({ onClearSelection }: { onClearSelection: () => void }) {
  const { t } = useTranslation();
  const [voidConfirmOpen, setVoidConfirmOpen] = useState(false);
  const {
    selectedIds,
    bulkSetStatus,
    bulkSetPriority,
    bulkAssign,
    voidTasks,
  } = useTaskProject();

  const ids = [...selectedIds];
  if (ids.length === 0) return null;

  return (
    <div className="fixed bottom-0 start-0 end-0 z-40 border-t border-border bg-elevated/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm dark:shadow-[0_-8px_24px_rgba(0,0,0,0.4)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-primary">
          {t('tasks.bulk.selected', { count: ids.length })}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-primary"
            defaultValue=""
            onChange={(e) => {
              const v = e.target.value as TaskStatus;
              if (v) bulkSetStatus(ids, v);
              e.target.value = '';
            }}
          >
            <option value="">{t('tasks.bulk.changeStatus')}</option>
            {KANBAN_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(taskWorkflowTKey(s))}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-primary"
            defaultValue=""
            onChange={(e) => {
              const v = e.target.value;
              if (v) bulkAssign(ids, [v]);
              e.target.value = '';
            }}
          >
            <option value="">{t('tasks.bulk.assign')}</option>
            {DEMO_USERS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-primary"
            defaultValue=""
            onChange={(e) => {
              const v = e.target.value as TaskPriorityKey;
              if (v) bulkSetPriority(ids, v);
              e.target.value = '';
            }}
          >
            <option value="">{t('tasks.bulk.setPriority')}</option>
            {(['critical', 'high', 'medium', 'low'] as const).map((p) => (
              <option key={p} value={p}>
                {t(taskPriorityTKey(p))}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setVoidConfirmOpen(true)}
            className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger/20"
          >
            {t('tasks.bulk.delete')}
          </button>
          <button
            type="button"
            onClick={onClearSelection}
            className="rounded-lg px-3 py-1.5 text-sm text-secondary hover:bg-muted/10"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
      <DeleteConfirmDialog
        open={voidConfirmOpen}
        onOpenChange={setVoidConfirmOpen}
        title={t('confirmDialog.bulkVoidTitle', { count: ids.length })}
        description={t('confirmDialog.bulkVoidDescription')}
        onConfirm={() => {
          voidTasks(ids);
          onClearSelection();
        }}
      />
    </div>
  );
}
