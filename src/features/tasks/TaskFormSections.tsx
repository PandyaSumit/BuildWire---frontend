import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { BuildWireTask, TaskPriorityKey, TaskStatus, TaskTradeKey, TaskTypeKey } from '@/types/task';
import { ALL_TASK_TYPE_KEYS, ALL_TRADE_KEYS, FLOOR_OPTIONS } from '@/features/tasks/taskConstants';
import { taskTypeKeyTKey, taskTradeKeyTKey } from '@/features/tasks/taskI18nKeys';
import { TASK_COLUMNS, taskPriorityTKey, taskWorkflowTKey } from '@/features/tasks/fixtures';
import { Select } from '@/components/ui/select';
import { DEMO_USERS } from '@/features/tasks/demoUsers';
import type { TaskEditorDraft } from '@/features/tasks/taskEditorState';

function toggleId(arr: string[], id: string): string[] {
  return arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
}

type Props = {
  mode: 'create' | 'edit';
  draft: TaskEditorDraft;
  update: (p: Partial<TaskEditorDraft>) => void;
  idPrefix: string;
  showTemplate?: boolean;
  templateOptions?: { value: string; label: string }[];
  onTemplateChange?: (id: string) => void;
  task?: BuildWireTask | null;
  projectId?: string;
  error?: string | null;
  autoFocusTitle?: boolean;
  /** Omit fields surfaced in document-style task header; keep site + links + advanced. */
  layoutVariant?: 'default' | 'embedded';
};

export function TaskFormSections({
  mode,
  draft,
  update,
  idPrefix,
  showTemplate,
  templateOptions,
  onTemplateChange,
  task,
  projectId,
  error,
  autoFocusTitle,
  layoutVariant = 'default',
}: Props) {
  const { t } = useTranslation();
  const base = projectId ? `/projects/${projectId}` : '';
  const embedded = layoutVariant === 'embedded';

  const pf = (s: string) => `${idPrefix}-${s}`;

  return (
    <div className="space-y-4">
      {showTemplate && templateOptions && onTemplateChange ? (
        <Select
          id={pf('template')}
          label={t('newTaskDrawer.template')}
          value={draft.templateId}
          onValueChange={onTemplateChange}
          options={templateOptions}
        />
      ) : null}

      {!embedded ? (
      <div>
        <label htmlFor={pf('title')} className="mb-1 block text-sm font-medium text-primary">
          {t('newTaskDrawer.fieldTitle')} <span className="text-danger">*</span>
        </label>
        <input
          id={pf('title')}
          value={draft.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder={t('newTaskDrawer.titlePlaceholder')}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          autoFocus={autoFocusTitle}
        />
      </div>
      ) : null}

      {!embedded ? (
      <Select
        id={pf('type')}
        label={t('newTaskDrawer.type')}
        value={draft.type}
        onValueChange={(v) => update({ type: v as TaskTypeKey })}
        options={ALL_TASK_TYPE_KEYS.map((k) => ({
          value: k,
          label: t(taskTypeKeyTKey(k)),
        }))}
      />
      ) : null}

      {!embedded ? (
      <Select
        id={pf('status')}
        label={t('newTaskDrawer.status')}
        value={draft.status}
        onValueChange={(v) => update({ status: v as TaskStatus })}
        options={[
          ...TASK_COLUMNS.map((c) => ({
            value: c.id,
            label: t(taskWorkflowTKey(c.id)),
          })),
          { value: 'void', label: t(taskWorkflowTKey('void')) },
        ]}
      />
      ) : null}

      {!embedded && draft.status === 'blocked' ? (
        <div>
          <label htmlFor={pf('blocked')} className="mb-1 block text-sm font-medium text-danger">
            {t('newTaskDrawer.blockedReasonLabel')} <span className="text-danger">*</span>
          </label>
          <textarea
            id={pf('blocked')}
            value={draft.blocked_reason}
            onChange={(e) => update({ blocked_reason: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-danger/40 bg-bg px-3 py-2 text-sm text-primary focus:border-danger focus:outline-none focus:ring-1 focus:ring-danger/30"
          />
        </div>
      ) : null}

      {!embedded ? (
      <Select
        id={pf('priority')}
        label={t('newTaskDrawer.priority')}
        value={draft.priority}
        onValueChange={(v) => update({ priority: v as TaskPriorityKey })}
        options={(['critical', 'high', 'medium', 'low'] as const).map((p) => ({
          value: p,
          label: t(taskPriorityTKey(p)),
        }))}
      />
      ) : null}

      <Select
        id={pf('trade')}
        label={t('newTaskDrawer.trade')}
        value={draft.trade}
        onValueChange={(v) => update({ trade: v as TaskTradeKey })}
        options={ALL_TRADE_KEYS.map((k) => ({
          value: k,
          label: t(taskTradeKeyTKey(k)),
        }))}
      />

      <Select
        id={pf('floor')}
        label={t('newTaskDrawer.floor')}
        value={draft.floor}
        onValueChange={(v) => update({ floor: v })}
        options={FLOOR_OPTIONS.map((f) => ({ value: f, label: f }))}
      />

      <div>
        <label htmlFor={pf('loc')} className="mb-1 block text-sm font-medium text-primary">
          {t('newTaskDrawer.locationDetail')}
        </label>
        <input
          id={pf('loc')}
          value={draft.location_detail}
          onChange={(e) => update({ location_detail: e.target.value })}
          placeholder={t('newTaskDrawer.locationPlaceholder')}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      {!embedded ? (
      <fieldset className="rounded-lg border border-border/60 p-3">
        <legend className="px-1 text-xs font-semibold text-muted">
          {t('newTaskDrawer.assignees')}
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {DEMO_USERS.map((u) => (
            <label key={u.id} className="flex cursor-pointer items-center gap-2 text-sm text-primary">
              <input
                type="checkbox"
                checked={draft.assignees.includes(u.id)}
                onChange={() => update({ assignees: toggleId(draft.assignees, u.id) })}
                className="rounded border-border"
              />
              {u.name}
            </label>
          ))}
        </div>
      </fieldset>
      ) : null}

      <fieldset className="rounded-lg border border-border/60 p-3">
        <legend className="px-1 text-xs font-semibold text-muted">
          {t('newTaskDrawer.watchers')}
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {DEMO_USERS.map((u) => (
            <label key={u.id} className="flex cursor-pointer items-center gap-2 text-sm text-primary">
              <input
                type="checkbox"
                checked={draft.watchers.includes(u.id)}
                onChange={() => update({ watchers: toggleId(draft.watchers, u.id) })}
                className="rounded border-border"
              />
              {u.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div className={`grid grid-cols-1 gap-3 ${embedded ? '' : 'sm:grid-cols-2'}`}>
        <div>
          <label htmlFor={pf('start')} className="mb-1 block text-sm font-medium text-primary">
            {t('newTaskDrawer.startDate')}
          </label>
          <input
            id={pf('start')}
            type="date"
            value={draft.start_date}
            onChange={(e) => update({ start_date: e.target.value })}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-primary"
          />
        </div>
        {!embedded ? (
        <div>
          <label htmlFor={pf('due')} className="mb-1 block text-sm font-medium text-primary">
            {t('newTaskDrawer.dueDate')}
          </label>
          <input
            id={pf('due')}
            type="date"
            value={draft.due_date}
            onChange={(e) => update({ due_date: e.target.value })}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-primary"
          />
        </div>
        ) : null}
      </div>

      {!embedded ? (
      <div>
        <label htmlFor={pf('desc')} className="mb-1 block text-sm font-medium text-primary">
          {t('newTaskDrawer.description')}
        </label>
        <textarea
          id={pf('desc')}
          value={draft.description}
          onChange={(e) => update({ description: e.target.value })}
          rows={4}
          className="w-full resize-y rounded-lg border border-border bg-bg px-3 py-2 text-sm text-primary"
        />
      </div>
      ) : null}

      {!embedded ? (
      <label className="flex cursor-pointer items-center gap-2 text-sm text-primary">
        <input
          type="checkbox"
          checked={draft.is_private}
          onChange={(e) => update({ is_private: e.target.checked })}
          className="rounded border-border"
        />
        {t('newTaskDrawer.private')}
      </label>
      ) : null}

      <div>
        <label htmlFor={pf('tags')} className="mb-1 block text-sm font-medium text-primary">
          {t('newTaskDrawer.tags')}
        </label>
        <input
          id={pf('tags')}
          value={draft.tagsRaw}
          onChange={(e) => update({ tagsRaw: e.target.value })}
          placeholder={t('newTaskDrawer.tagsHint')}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-primary"
        />
      </div>

      {/* Photos & files — shared UX for create + edit */}
      <div className="rounded-xl border border-border/80 bg-surface/30 p-4">
        <h3 className="mb-2 text-sm font-semibold text-primary">{t('taskForm.sectionPhotos')}</h3>
        {task && task.photos.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {task.photos.slice(0, 8).map((p) => (
              <div
                key={p.id}
                className="h-16 w-16 shrink-0 rounded-lg border border-border bg-gradient-to-br from-muted/30 to-muted/10"
                title={p.caption || p.id}
              />
            ))}
          </div>
        ) : null}
        <button
          type="button"
          className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-bg/50 px-4 py-8 text-center transition-colors hover:border-brand/40 hover:bg-brand/5"
        >
          <span className="text-sm font-medium text-primary">{t('taskForm.dropPhotos')}</span>
          <span className="mt-1 text-xs text-muted">{t('taskForm.uploadHint')}</span>
        </button>
      </div>

      {/* Linked RFIs / drawings / files */}
      <div className="rounded-xl border border-border/80 bg-surface/30 p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-primary">{t('taskForm.sectionLinked')}</h3>
          {base ? (
            <Link to={`${base}/rfis`} className="text-xs font-medium text-brand hover:underline">
              {t('taskForm.browseRfis')}
            </Link>
          ) : null}
        </div>
        {task &&
        (task.related_rfis.length > 0 ||
          task.related_drawings.length > 0 ||
          task.related_files.length > 0) ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {task.related_rfis.map((id) => (
              <span
                key={id}
                className="inline-flex items-center rounded-full border border-border bg-bg px-2.5 py-1 text-xs font-medium text-primary"
              >
                RFI {id}
              </span>
            ))}
            {task.related_drawings.map((id) => (
              <span
                key={id}
                className="inline-flex items-center rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand"
              >
                {t('taskForm.drawing')} {id}
              </span>
            ))}
            {task.related_files.map((id) => (
              <span
                key={id}
                className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs text-secondary"
              >
                {t('taskForm.file')} {id}
              </span>
            ))}
          </div>
        ) : (
          <p className="mb-3 text-sm text-secondary">{t('taskForm.noLinked')}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-medium text-primary hover:bg-muted/10"
          >
            + {t('taskForm.linkRfi')}
          </button>
          <button
            type="button"
            className="rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-medium text-primary hover:bg-muted/10"
          >
            + {t('taskForm.linkDrawing')}
          </button>
          <button
            type="button"
            className="rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-medium text-primary hover:bg-muted/10"
          >
            + {t('taskForm.linkFile')}
          </button>
        </div>
        {base ? (
          <p className="mt-3 text-xs text-muted">{t('taskForm.drawingsHint')}</p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => update({ advancedOpen: !draft.advancedOpen })}
        className="text-sm font-medium text-brand hover:underline"
      >
        + {t('newTaskDrawer.advanced')}
      </button>

      {draft.advancedOpen ? (
        <div className="space-y-3 rounded-lg border border-dashed border-border p-3">
          <div>
            <label htmlFor={pf('parent')} className="mb-1 block text-xs font-medium text-muted">
              {t('newTaskDrawer.parentTask')}
            </label>
            <input
              id={pf('parent')}
              value={draft.parent_task_id}
              onChange={(e) => update({ parent_task_id: e.target.value })}
              placeholder="task_…"
              className="w-full rounded border border-border bg-bg px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor={pf('root')} className="mb-1 block text-xs font-medium text-muted">
              {t('newTaskDrawer.rootCause')}
            </label>
            <input
              id={pf('root')}
              value={draft.root_cause}
              onChange={(e) => update({ root_cause: e.target.value })}
              className="w-full rounded border border-border bg-bg px-2 py-1.5 text-sm"
            />
          </div>
        </div>
      ) : null}

      {mode === 'edit' && task ? (
        <p className="text-xs text-muted">
          {t('taskForm.metaCreated', { date: task.created_at.slice(0, 10) })} ·{' '}
          {t('taskForm.metaUpdated', { date: task.updated_at.slice(0, 10) })}
        </p>
      ) : null}

      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
