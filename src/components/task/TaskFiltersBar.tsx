import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TaskListFilters, TaskPriorityKey, TaskTradeKey, TaskTypeKey } from '@/types/task';
import { EMPTY_TASK_FILTERS } from '@/types/task';
import { ALL_TASK_TYPE_KEYS, ALL_TRADE_KEYS, FLOOR_OPTIONS } from '@/utils/task/taskConstants';
import { DEMO_USERS } from '@/utils/task/demoUsers';
import { useTaskProject } from '@/hooks/task/TaskProjectContext';
import { taskTypeKeyTKey, taskTradeKeyTKey } from '@/utils/task/taskI18nKeys';
import { taskPriorityTKey } from '@/utils/task/fixtures';
import { Select } from '@/components/ui/select';

const PRIOS: TaskPriorityKey[] = ['critical', 'high', 'medium', 'low'];

export function useTaskFilterCount() {
  const { filters } = useTaskProject();
  return (
    filters.types.length +
    filters.priorities.length +
    filters.assigneeIds.length +
    filters.trades.length +
    filters.floors.length +
    (filters.search.trim() ? 1 : 0) +
    (filters.overdueOnly ? 1 : 0) +
    (filters.blockedOnly ? 1 : 0) +
    (filters.myWorkOnly ? 1 : 0)
  );
}

export function TaskFiltersBar() {
  const { t } = useTranslation();
  const { filters, setFilters } = useTaskProject();
  const [addFilterOpen, setAddFilterOpen] = useState(false);

  const set = (patch: Partial<TaskListFilters>) =>
    setFilters((f) => ({ ...f, ...patch }));
  const clear = () => setFilters(EMPTY_TASK_FILTERS);

  const activeCount = useTaskFilterCount();

  const quickFilters = [
    {
      id: 'myWork',
      label: t('tasks.filters.myTasks'),
      active: filters.myWorkOnly,
      toggle: () => set({ myWorkOnly: !filters.myWorkOnly }),
    },
    {
      id: 'overdue',
      label: t('tasks.filters.overdue'),
      active: filters.overdueOnly,
      toggle: () => set({ overdueOnly: !filters.overdueOnly }),
    },
    {
      id: 'blocked',
      label: t('tasks.filters.blocked'),
      active: filters.blockedOnly,
      toggle: () => set({ blockedOnly: !filters.blockedOnly }),
    },
    {
      id: 'highPrio',
      label: t('tasks.filters.highPriority'),
      active:
        filters.priorities.includes('high') ||
        filters.priorities.includes('critical'),
      toggle: () => {
        const hasHigh =
          filters.priorities.includes('high') ||
          filters.priorities.includes('critical');
        set({ priorities: hasHigh ? [] : (['high', 'critical'] as TaskPriorityKey[]) });
      },
    },
  ];

  const typeOptions = useMemo(
    () => [
      { value: '', label: t('tasks.filters.all') },
      ...ALL_TASK_TYPE_KEYS.map((k) => ({ value: k, label: t(taskTypeKeyTKey(k)) })),
    ],
    [t],
  );

  const priorityOptions = useMemo(
    () => [
      { value: '', label: t('tasks.filters.all') },
      ...PRIOS.map((k) => ({ value: k, label: t(taskPriorityTKey(k)) })),
    ],
    [t],
  );

  const assigneeOptions = useMemo(
    () => [
      { value: '', label: t('tasks.filters.all') },
      ...DEMO_USERS.map((u) => ({ value: u.id, label: u.name })),
    ],
    [t],
  );

  const tradeOptions = useMemo(
    () => [
      { value: '', label: t('tasks.filters.all') },
      ...ALL_TRADE_KEYS.map((k) => ({ value: k, label: t(taskTradeKeyTKey(k)) })),
    ],
    [t],
  );

  const floorOptions = useMemo(
    () => [
      { value: '', label: t('tasks.filters.all') },
      ...FLOOR_OPTIONS.map((f) => ({ value: f, label: f })),
    ],
    [t],
  );

  return (
    <div className="rounded-md border border-zinc-700 bg-zinc-900 shadow-xl shadow-black/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">{t('tasks.filters.title')}</span>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="text-xs font-medium text-secondary hover:text-primary hover:underline"
          >
            {t('tasks.filters.clear')}
          </button>
        ) : null}
      </div>

      <div className="mb-1">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
          {t('tasks.filters.quickFilters')}
        </p>
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((qf) => (
            <button
              key={qf.id}
              type="button"
              onClick={qf.toggle}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${
                qf.active
                  ? 'border-brand/60 bg-brand/15 text-brand'
                  : 'border-zinc-700 bg-transparent text-secondary hover:border-zinc-500 hover:text-primary'
              }`}
            >
              {qf.active ? (
                <svg className="h-3 w-3 shrink-0" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
                  <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              ) : null}
              {qf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 border-t border-zinc-800 pt-3">
        <button
          type="button"
          onClick={() => setAddFilterOpen((v) => !v)}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-secondary hover:text-primary"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M8 3a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5v-3.5A.75.75 0 0 1 8 3z" />
          </svg>
          {t('tasks.filters.addFilter')}
          <svg
            className={`h-3 w-3 transition-transform ${addFilterOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 12 12"
            fill="currentColor"
            aria-hidden
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </button>

        {addFilterOpen ? (
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-muted">
                {t('tasks.filters.type')}
              </span>
              <Select
                size="sm"
                fullWidth={false}
                triggerClassName="min-w-[8rem] bg-zinc-800 border-zinc-700"
                dropdownClassName="!bg-zinc-900 !border-zinc-700"
                options={typeOptions}
                value={filters.types[0] ?? ''}
                onValueChange={(v) => set({ types: v ? [v as TaskTypeKey] : [] })}
                placeholder={t('tasks.filters.all')}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-muted">
                {t('tasks.filters.priority')}
              </span>
              <Select
                size="sm"
                fullWidth={false}
                triggerClassName="min-w-[8rem] bg-zinc-800 border-zinc-700"
                dropdownClassName="!bg-zinc-900 !border-zinc-700"
                options={priorityOptions}
                value={filters.priorities[0] ?? ''}
                onValueChange={(v) => set({ priorities: v ? [v as TaskPriorityKey] : [] })}
                placeholder={t('tasks.filters.all')}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-muted">
                {t('tasks.filters.assignee')}
              </span>
              <Select
                size="sm"
                fullWidth={false}
                triggerClassName="min-w-[8rem] bg-zinc-800 border-zinc-700"
                dropdownClassName="!bg-zinc-900 !border-zinc-700"
                options={assigneeOptions}
                value={filters.assigneeIds[0] ?? ''}
                onValueChange={(v) => set({ assigneeIds: v ? [v] : [] })}
                placeholder={t('tasks.filters.all')}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-muted">
                {t('tasks.filters.trade')}
              </span>
              <Select
                size="sm"
                fullWidth={false}
                triggerClassName="min-w-[8rem] bg-zinc-800 border-zinc-700"
                dropdownClassName="!bg-zinc-900 !border-zinc-700"
                options={tradeOptions}
                value={filters.trades[0] ?? ''}
                onValueChange={(v) => set({ trades: v ? [v as TaskTradeKey] : [] })}
                placeholder={t('tasks.filters.all')}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-muted">
                {t('tasks.filters.floor')}
              </span>
              <Select
                size="sm"
                fullWidth={false}
                triggerClassName="min-w-[8rem] bg-zinc-800 border-zinc-700"
                dropdownClassName="!bg-zinc-900 !border-zinc-700"
                options={floorOptions}
                value={filters.floors[0] ?? ''}
                onValueChange={(v) => set({ floors: v ? [v] : [] })}
                placeholder={t('tasks.filters.all')}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
