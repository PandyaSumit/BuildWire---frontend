import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { BuildWireTask } from '@/types/task';
import { taskPriorityTKey, taskWorkflowTKey } from '@/features/tasks/fixtures';
import { typeBadgeClassKey } from '@/features/tasks/taskPresentation';
import { taskTypeKeyTKey, taskTradeKeyTKey } from '@/features/tasks/taskI18nKeys';
import {
  demoPrimaryAssigneeName,
  demoPrimaryInitials,
  demoUserById,
  DEMO_USERS,
} from '@/features/tasks/demoUsers';
import {
  draftToNewTaskValues,
  draftToPatch,
  emptyTaskDraft,
  taskToDraft,
  type TaskEditorDraft,
} from '@/features/tasks/taskEditorState';
import { TaskFormSections } from '@/features/tasks/TaskFormSections';
import { useTaskProject } from '@/features/tasks/TaskProjectContext';
import {
  BUILTIN_TASK_TEMPLATES,
  orderedTemplatesForPicker,
  recordTemplateUse,
} from '@/features/tasks/taskTemplates';
import { createBuildWireTask } from '@/features/tasks/taskFactory';
function fmtShortDate(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-center gap-3 py-1.5 text-sm">
      <div className="text-muted">{label}</div>
      <div className="min-w-0 text-primary">{children}</div>
    </div>
  );
}

export type TaskDrawerProps =
  | {
      mode: 'create';
      onClose: () => void;
      onCreated?: (task: BuildWireTask) => void;
      /** Kanban section to add the new task into */
      defaultKanbanSectionId?: string;
    }
  | {
      mode: 'edit';
      task: BuildWireTask;
      onClose: () => void;
    };

function draftFingerprint(d: TaskEditorDraft): string {
  const { templateId: _t, advancedOpen: _a, ...core } = d;
  return JSON.stringify(core);
}

function Icon({
  children,
  className = 'h-4 w-4',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex shrink-0 text-muted ${className}`} aria-hidden>
      {children}
    </span>
  );
}

function Section({
  icon,
  title,
  action,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
          {icon ? <span className="text-muted [&_svg]:h-4 [&_svg]:w-4">{icon}</span> : null}
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function CollaborationTab({
  task,
  base,
  statusLabel,
}: {
  task: BuildWireTask;
  base: string;
  statusLabel: string;
}) {
  const thread = [
    {
      type: 'comment' as const,
      who: 'QC Lead',
      body: 'Please confirm tolerance before we close ceiling L12 corridor.',
      when: '2h ago',
      initial: 'Q',
    },
    {
      type: 'comment' as const,
      who: demoPrimaryAssigneeName(task),
      body: 'Field measure matches shop drawing — photos attached.',
      when: 'Yesterday',
      initial: demoPrimaryInitials(task),
    },
    {
      type: 'update' as const,
      who: demoPrimaryAssigneeName(task),
      body: 'uploaded 2 photos',
      when: '3h ago',
    },
    {
      type: 'update' as const,
      who: 'System',
      body: `status → ${statusLabel}`,
      when: '1d ago',
    },
    {
      type: 'update' as const,
      who: 'PM',
      body: 'mentioned in daily report',
      when: '2d ago',
    },
  ];

  return (
    <div className="space-y-8 pb-2">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-primary">Discussion</h3>
        <div className="divide-y divide-border/50 rounded-lg border border-border/50 bg-surface/20">
          {thread.map((row, i) => (
            <div key={i} className="px-3 py-3">
              {row.type === 'comment' ? (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand">
                    {row.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-semibold text-primary">{row.who}</span>
                      <span className="text-xs text-muted">{row.when}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-secondary">{row.body}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-secondary">
                  <span className="font-medium text-primary">{row.who}</span> {row.body}
                  <span className="ml-2 text-xs text-muted">{row.when}</span>
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            placeholder="Write a comment…"
            className="min-w-0 flex-1 rounded-lg border border-border/60 bg-bg px-3 py-2.5 text-sm text-primary placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30"
          />
          <button
            type="button"
            className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white dark:text-bg"
          >
            Post
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-6 text-sm">
        <span className="text-muted">Following</span>
        {['PM', 'A', 'QC'].map((w) => (
          <div
            key={w}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-light text-[10px] font-bold text-brand"
            title={w}
          >
            {w[0]}
          </div>
        ))}
        <button type="button" className="ml-1 text-sm font-medium text-brand hover:underline">
          Add
        </button>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-primary">Floor plan</h3>
        <Link
          to={`${base}/drawings`}
          className="inline-flex text-sm font-medium text-brand hover:underline"
        >
          Open drawings
        </Link>
      </div>
    </div>
  );
}

/** Same collaboration layout as details, with empty state until the task exists. */
function CollaborationTabCreate({ base }: { base: string }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-8 pb-2">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-primary">Discussion</h3>
        <div className="rounded-lg border border-border/50 bg-surface/20 px-4 py-8 text-center">
          <p className="text-sm leading-relaxed text-secondary">{t('taskDetailDrawer.collabAfterCreate')}</p>
        </div>
        <div className="pointer-events-none mt-3 flex gap-2 opacity-40">
          <input
            type="text"
            placeholder="Write a comment…"
            readOnly
            className="min-w-0 flex-1 rounded-lg border border-border/60 bg-bg px-3 py-2.5 text-sm text-primary placeholder:text-muted"
          />
          <button
            type="button"
            className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white dark:text-bg"
          >
            Post
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-6 text-sm text-muted">
        <span>Following</span>
        <span className="text-xs">—</span>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-primary">Floor plan</h3>
        <Link
          to={`${base}/drawings`}
          className="inline-flex text-sm font-medium text-brand hover:underline"
        >
          Open drawings
        </Link>
      </div>
    </div>
  );
}

function TaskSiteCoordinationStrip({
  task,
  base,
}: {
  task: BuildWireTask;
  base: string;
}) {
  const { t } = useTranslation();
  const loc = [task.floor, task.location_detail].filter(Boolean).join(' · ');
  const nRfi = task.related_rfis?.length ?? 0;
  const nDrw = task.related_drawings?.length ?? 0;
  const nInsp = task.related_inspections?.length ?? 0;

  return (
    <div className="mt-3 rounded-lg border border-border/50 bg-muted/[0.04] px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
        {t('taskDetailDrawer.siteCoordination')}
      </p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
        {t('taskDetailDrawer.coordinationHint')}
      </p>
      <div className="mt-2 flex flex-col gap-2 text-xs text-primary sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
        <span>
          <span className="text-muted">{t('taskDetailDrawer.locationLabel')}: </span>
          {loc || '—'}
        </span>
        <span className="text-secondary">{t(taskTradeKeyTKey(task.trade))}</span>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {nRfi > 0 ? (
            <Link
              to={`${base}/rfis`}
              className="font-medium text-brand hover:underline"
            >
              {t('taskDetailDrawer.linkedRfis')} ({nRfi})
            </Link>
          ) : (
            <span className="text-muted">
              {t('taskDetailDrawer.linkedRfis')}: 0
            </span>
          )}
          {nDrw > 0 ? (
            <Link
              to={`${base}/drawings`}
              className="font-medium text-brand hover:underline"
            >
              {t('taskDetailDrawer.linkedDrawings')} ({nDrw})
            </Link>
          ) : (
            <span className="text-muted">
              {t('taskDetailDrawer.linkedDrawings')}: 0
            </span>
          )}
          {nInsp > 0 ? (
            <Link
              to={`${base}/inspections`}
              className="font-medium text-brand hover:underline"
            >
              {t('taskDetailDrawer.linkedInspections')} ({nInsp})
            </Link>
          ) : (
            <span className="text-muted">
              {t('taskDetailDrawer.linkedInspections')}: 0
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function isDueOverdue(due: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(due)) return false;
  const d = new Date(`${due}T12:00:00`);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return d < t;
}

const MOCK_SUBTASKS = [
  { id: 's1', label: 'Verify shop drawing against field measure', done: false },
  { id: 's2', label: 'Photo documentation uploaded', done: true },
  { id: 's3', label: 'GC sign-off', done: false },
];

function TaskDrawerCreate({
  projectId,
  onClose,
  onCreated,
  defaultKanbanSectionId,
}: {
  projectId: string;
  onClose: () => void;
  onCreated?: (task: BuildWireTask) => void;
  defaultKanbanSectionId?: string;
}) {
  const { t } = useTranslation();
  const { addTask, nextDisplayNumber, tasks, getNextKanbanOrder, resolveKanbanSectionId } =
    useTaskProject();

  const [draft, setDraft] = useState<TaskEditorDraft>(() => emptyTaskDraft());
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TaskDetailTab>('task');
  const templates = orderedTemplatesForPicker(BUILTIN_TASK_TEMPLATES);

  const base = `/projects/${projectId}`;
  const previewDisplayNumber = useMemo(() => nextDisplayNumber(), [nextDisplayNumber, tasks]);

  function update(p: Partial<TaskEditorDraft>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  function applyTemplate(id: string) {
    if (!id) {
      update({ templateId: '' });
      return;
    }
    const tpl = BUILTIN_TASK_TEMPLATES.find((x) => x.id === id);
    if (!tpl) {
      update({ templateId: id });
      return;
    }
    recordTemplateUse(id);
    setDraft((d) => ({
      ...d,
      templateId: id,
      type: tpl.type,
      priority: tpl.priority,
      trade: tpl.trade,
      floor: tpl.floor,
      description: tpl.description,
      assignees: tpl.assignees.length ? [...tpl.assignees] : [DEMO_USERS[0].id],
    }));
  }

  function resetForm() {
    setDraft(emptyTaskDraft());
    setError(null);
    setTab('task');
  }

  function submit(another: boolean) {
    const trimmed = draft.title.trim();
    if (!trimmed) {
      setError(t('newTaskDrawer.errorTitle'));
      setTab('task');
      return;
    }
    if (draft.status === 'blocked' && !draft.blocked_reason.trim()) {
      setError(t('newTaskDrawer.errorBlocked'));
      setTab('task');
      return;
    }
    setError(null);
    const num = nextDisplayNumber();
    const values = draftToNewTaskValues({ ...draft, title: trimmed });
    const sid = resolveKanbanSectionId(defaultKanbanSectionId);
    const order = getNextKanbanOrder(sid);
    const task = createBuildWireTask(num, values, 'u_current', {
      sectionId: sid,
      order,
    });
    if (draft.root_cause.trim()) {
      task.root_cause = draft.root_cause.trim();
    }
    addTask(task);
    onCreated?.(task);
    if (another) {
      resetForm();
    } else {
      onClose();
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit(false);
  }

  const overdueCreate =
    draft.status !== 'done' &&
    draft.status !== 'void' &&
    isDueOverdue(draft.due_date.slice(0, 10));

  const chipType = draft.type;
  const chipTrade = draft.trade;
  const chipPriority = draft.priority;
  const chipDue = draft.due_date;

  return (
    <div className="flex h-full min-h-0 flex-col bg-elevated">
      <header className="sticky top-0 z-10 shrink-0 border-b border-border bg-elevated px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-medium text-muted">Task</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <h2 className="font-[family-name:var(--font-dm-sans)] text-lg font-semibold leading-tight text-primary">
                {previewDisplayNumber}
              </h2>
              <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                {t('taskDetailDrawer.newTaskBadge')}
              </span>
              {overdueCreate ? (
                <span className="rounded-md bg-danger/15 px-2 py-0.5 text-[11px] font-semibold uppercase text-danger">
                  Overdue
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-secondary hover:bg-surface hover:text-primary"
            >
              Share
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-secondary hover:bg-surface hover:text-primary"
              aria-label={t('common.closeDialog')}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${typeBadgeClassKey(chipType)}`}
          >
            {t(taskTypeKeyTKey(chipType))}
          </span>
          <span className="rounded-full border border-border bg-bg px-2.5 py-1 text-xs font-medium text-secondary">
            {t('tasks.dueLabel', { date: chipDue })}
          </span>
          <span className="rounded-full border border-border bg-bg px-2.5 py-1 text-xs font-medium text-secondary">
            {t(taskTradeKeyTKey(chipTrade))} · {t(taskPriorityTKey(chipPriority))}
          </span>
        </div>

        <div className="mt-4 border-t border-border pt-3">
          <SegmentedControl<TaskDetailTab>
            value={tab}
            onChange={setTab}
            className="w-full"
            options={[
              { value: 'task', label: t('taskDetailDrawer.tabTask') },
              {
                value: 'checklist',
                label: t('taskDetailDrawer.checklistCount', { done: 0, total: 0 }),
              },
              { value: 'collab', label: t('taskDetailDrawer.tabCollab') },
            ]}
          />
        </div>
      </header>

      <div
        className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
        role="tabpanel"
        id={`task-panel-create-${tab}`}
        aria-label={
          tab === 'task' ? t('taskDetailDrawer.tabTask') : tab === 'checklist' ? 'Checklist' : 'Collaboration'
        }
      >
        {tab === 'task' ? (
          <form id="task-drawer-create-form" onSubmit={handleSubmit} className="pb-1">
            <p className="mb-4 text-sm text-secondary">{t('newTaskDrawer.subtitle')}</p>
            <TaskFormSections
              mode="create"
              draft={draft}
              update={update}
              idPrefix="nt"
              showTemplate
              templateOptions={[
                { value: '', label: t('newTaskDrawer.noTemplate') },
                ...templates.map((tpl) => ({ value: tpl.id, label: tpl.name })),
              ]}
              onTemplateChange={applyTemplate}
              projectId={projectId}
              error={error}
              autoFocusTitle
            />
          </form>
        ) : null}

        {tab === 'checklist' ? (
          <div className="space-y-8">
            <Section
              icon={
                <Icon>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </Icon>
              }
              title="Subtasks"
              action={
                <span className="text-xs tabular-nums text-muted">
                  0/0
                </span>
              }
            >
              <p className="rounded-lg border border-border/50 bg-surface/30 px-4 py-5 text-sm text-secondary">
                {t('taskDetailDrawer.checklistAfterCreate')}
              </p>
            </Section>
          </div>
        ) : null}

        {tab === 'collab' ? <CollaborationTabCreate base={base} /> : null}
      </div>

      <div className="shrink-0 border-t border-border bg-elevated px-4 py-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="secondary" size="sm" className="flex-1" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => submit(true)}>
            {t('newTaskDrawer.createAndAdd')}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="flex-1 font-semibold"
            onClick={() => submit(false)}
          >
            {t('newTaskDrawer.create')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function TaskDrawerEdit({
  task,
  projectId,
  onClose,
}: {
  task: BuildWireTask;
  projectId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { patchTask, tasks, kanbanSections } = useTaskProject();
  const liveTask = useMemo(() => tasks.find((x) => x.id === task.id) ?? task, [tasks, task]);
  const base = `/projects/${projectId}`;
  const statusLabel = t(taskWorkflowTKey(liveTask.status));
  const [subtasks, setSubtasks] = useState(MOCK_SUBTASKS);
  const [draft, setDraft] = useState(() => taskToDraft(task));
  const [baseline, setBaseline] = useState(() => taskToDraft(task));
  const [error, setError] = useState<string | null>(null);

  const overdue =
    draft.status !== 'done' && draft.status !== 'void' && isDueOverdue(draft.due_date.slice(0, 10));

  useEffect(() => {
    const d = taskToDraft(task);
    setDraft(d);
    setBaseline(d);
    setError(null);
    setSubtasks(MOCK_SUBTASKS.map((s) => ({ ...s })));
  }, [task.id]);

  const update = useCallback((p: Partial<TaskEditorDraft>) => {
    setDraft((d) => ({ ...d, ...p }));
  }, []);

  const isDirty = useMemo(
    () => draftFingerprint(draft) !== draftFingerprint(baseline),
    [draft, baseline],
  );

  const chipType = draft.type;
  const chipTrade = draft.trade;
  const chipPriority = draft.priority;
  const chipDue = draft.due_date;

  const doneSub = useMemo(() => subtasks.filter((s) => s.done).length, [subtasks]);

  function save() {
    const trimmed = draft.title.trim();
    if (!trimmed) {
      setError(t('newTaskDrawer.errorTitle'));
      return;
    }
    if (draft.status === 'blocked' && !draft.blocked_reason.trim()) {
      setError(t('newTaskDrawer.errorBlocked'));
      return;
    }
    setError(null);
    patchTask(liveTask.id, draftToPatch({ ...draft, title: trimmed }));
    setBaseline({ ...draft, title: trimmed });
  }

  function discard() {
    setDraft({ ...baseline });
    setError(null);
  }

  const footer =
    isDirty ? (
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="secondary" size="sm" className="flex-1" onClick={discard}>
          {t('taskForm.discardChanges')}
        </Button>
        <Button type="button" variant="primary" size="sm" className="flex-1 font-semibold" onClick={save}>
          {t('taskForm.saveChanges')}
        </Button>
      </div>
    ) : null;

  const assigneeId = draft.assignees[0] ?? DEMO_USERS[0]?.id ?? '';
  const assignee = demoUserById(assigneeId);
  const sectionTitle =
    kanbanSections.find((s) => s.id === liveTask.kanban_section_id)?.title ||
    liveTask.kanban_section_id ||
    '—';

  return (
    <div className="flex h-full min-h-0 flex-col bg-elevated">
      <header className="sticky top-0 z-10 shrink-0 border-b border-border bg-elevated px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              {draft.status === 'done' ? (
                <button
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, status: 'open' }))}
                  className="rounded-md bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success"
                >
                  Completed
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, status: 'done' }))}
                  className="rounded-md bg-bg px-2 py-0.5 text-[11px] font-semibold text-secondary ring-1 ring-border hover:bg-surface"
                >
                  Mark complete
                </button>
              )}
              <span className="text-xs text-muted">{liveTask.display_number}</span>
              {overdue ? (
                <span className="rounded-md bg-danger/15 px-2 py-0.5 text-[11px] font-semibold uppercase text-danger">
                  Overdue
                </span>
              ) : null}
              {liveTask.pinned ? (
                <span
                  className="rounded-md bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                  title="Pinned on plan"
                >
                  Pinned
                </span>
              ) : null}
            </div>
            <input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder={t('newTaskDrawer.titlePlaceholder')}
              className="mt-2 w-full bg-transparent text-[22px] font-semibold leading-tight text-primary outline-none placeholder:text-muted"
            />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-secondary hover:bg-surface hover:text-primary"
            >
              Share
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-secondary hover:bg-surface hover:text-primary"
              aria-label={t('common.closeDialog')}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${typeBadgeClassKey(chipType)}`}
          >
            {t(taskTypeKeyTKey(chipType))}
          </span>
          <span className="rounded-full border border-border bg-bg px-2.5 py-1 text-xs font-medium text-secondary">
            {t('tasks.dueLabel', { date: chipDue })}
          </span>
          <span className="rounded-full border border-border bg-bg px-2.5 py-1 text-xs font-medium text-secondary">
            {t(taskTradeKeyTKey(chipTrade))} · {t(taskPriorityTKey(chipPriority))}
          </span>
        </div>

      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="rounded-xl border border-border/70 bg-surface/20 p-4">
          <MetaRow label="Assignee">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-light text-[11px] font-bold text-brand">
                {assignee?.initials ?? demoPrimaryInitials({ assignees: draft.assignees })}
              </span>
              <select
                value={assigneeId}
                onChange={(e) => update({ assignees: e.target.value ? [e.target.value] : [] })}
                className="min-w-[180px] rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-primary"
              >
                {DEMO_USERS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </MetaRow>

          <MetaRow label="Due date">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={draft.start_date}
                onChange={(e) => update({ start_date: e.target.value })}
                className="rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-primary"
              />
              <span className="text-muted">–</span>
              <input
                type="date"
                value={draft.due_date}
                onChange={(e) => update({ due_date: e.target.value })}
                className="rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-primary"
              />
              <span className="text-xs text-muted">
                {fmtShortDate(draft.start_date)} – {fmtShortDate(draft.due_date)}
              </span>
            </div>
          </MetaRow>

          <MetaRow label="Dependencies">
            <button type="button" className="text-sm font-medium text-brand hover:underline">
              Add dependencies
            </button>
          </MetaRow>

          <MetaRow label="Project">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-md bg-bg px-2 py-1 text-secondary ring-1 ring-border">
                Project {projectId || '—'}
              </span>
              <span className="text-muted">·</span>
              <span className="text-secondary">{sectionTitle}</span>
            </div>
          </MetaRow>

          <MetaRow label="Priority">
            <span className="inline-flex items-center rounded-md bg-warning/15 px-2 py-1 text-xs font-semibold text-warning">
              {t(taskPriorityTKey(draft.priority))}
            </span>
          </MetaRow>

          <MetaRow label="Status">
            <span className="inline-flex items-center rounded-md bg-warning/15 px-2 py-1 text-xs font-semibold text-warning">
              {statusLabel}
            </span>
          </MetaRow>
        </div>

        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-primary">Description</h3>
          <textarea
            value={draft.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="What is this task about?"
            rows={6}
            className="w-full resize-y rounded-xl border border-border/70 bg-bg px-3 py-3 text-sm text-primary placeholder:text-muted"
          />
        </div>

        <div className="mt-6">
          <Section
            icon={
              <Icon>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </Icon>
            }
            title="Subtasks"
            action={<span className="text-xs tabular-nums text-muted">{doneSub}/{subtasks.length}</span>}
          >
            <ul className="space-y-2">
              {subtasks.map((s) => (
                <li key={s.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent px-1 py-1 hover:bg-bg/60">
                    <input
                      type="checkbox"
                      checked={s.done}
                      onChange={() =>
                        setSubtasks((prev) =>
                          prev.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)),
                        )
                      }
                      className="mt-0.5 h-4 w-4 rounded border-border text-brand"
                    />
                    <span className={`text-sm ${s.done ? 'text-muted line-through' : 'text-primary'}`}>
                      {s.label}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <button type="button" className="mt-2 text-xs font-medium text-brand hover:underline">
              + Add subtask
            </button>
          </Section>
        </div>

        <div className="mt-6">
          <Section
            title="Attachments"
            action={<span className="text-xs tabular-nums text-muted">{liveTask.attachments?.length ?? 0}</span>}
          >
            <div className="rounded-xl border border-border/70 bg-surface/20 px-4 py-5 text-sm text-secondary">
              Drop files here or click to upload (demo).
            </div>
          </Section>
        </div>

        <div className="mt-8 border-t border-border/40 pt-6">
          <CollaborationTab task={liveTask} base={base} statusLabel={statusLabel} />
        </div>

        <div className="mt-8">
          <TaskSiteCoordinationStrip task={liveTask} base={base} />
        </div>

        <div className="mt-6">
          <TaskFormSections
            mode="edit"
            draft={draft}
            update={update}
            idPrefix={`td-${liveTask.id}`}
            task={liveTask}
            projectId={projectId}
            error={error}
            layoutVariant="embedded"
          />
        </div>
      </div>

      {footer ? (
        <div className="shrink-0 border-t border-border bg-elevated px-4 py-4">{footer}</div>
      ) : null}
    </div>
  );
}

export function TaskDrawer(props: TaskDrawerProps) {
  const { projectId } = useTaskProject();

  if (props.mode === 'create') {
    return (
      <TaskDrawerCreate
        projectId={projectId}
        onClose={props.onClose}
        onCreated={props.onCreated}
        defaultKanbanSectionId={props.defaultKanbanSectionId}
      />
    );
  }

  return <TaskDrawerEdit task={props.task} projectId={projectId} onClose={props.onClose} />;
}
