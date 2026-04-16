import { useId, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { TaskListFilters, TaskPriorityKey, TaskTradeKey, TaskTypeKey } from '@/types/task';
import { EMPTY_TASK_FILTERS } from '@/types/task';
import { ALL_TASK_TYPE_KEYS, ALL_TRADE_KEYS } from '@/utils/task/taskConstants';
import { DEMO_USERS } from '@/utils/task/demoUsers';
import { FLOOR_OPTIONS } from '@/utils/task/taskConstants';
import { useTaskProject } from '@/hooks/task/TaskProjectContext';
import { taskTypeKeyTKey, taskTradeKeyTKey } from '@/utils/task/taskI18nKeys';
import { taskPriorityTKey } from '@/utils/task/fixtures';
import { Select } from '@/components/ui/select';

const PRIOS: TaskPriorityKey[] = ['critical', 'high', 'medium', 'low'];

const triggerFilter = 'min-w-[7.25rem] max-w-[11rem]';

function FilterField({
  label,
  labelId,
  children,
}: {
  label: string;
  labelId: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span
        id={labelId}
        className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted"
      >
        {label}
      </span>
      {children}
    </div>
  );
}

export function TaskFiltersBar() {
  const { t, i18n } = useTranslation();
  const { filters, setFilters } = useTaskProject();
  const uid = useId();

  const set = (patch: Partial<TaskListFilters>) =>
    setFilters((f) => ({ ...f, ...patch }));

  const clear = () => setFilters(EMPTY_TASK_FILTERS);

  const active =
    filters.types.length +
      filters.priorities.length +
      filters.assigneeIds.length +
      filters.trades.length +
      filters.floors.length +
      (filters.search.trim() ? 1 : 0) +
      (filters.overdueOnly ? 1 : 0) +
      (filters.blockedOnly ? 1 : 0) +
      (filters.myWorkOnly ? 1 : 0) >
    0;

  const typeOptions = useMemo(
    () => [
      { value: '', label: t('tasks.filters.all') },
      ...ALL_TASK_TYPE_KEYS.map((k) => ({
        value: k,
        label: t(taskTypeKeyTKey(k)),
      })),
    ],
    [t, i18n.language],
  );

  const priorityOptions = useMemo(
    () => [
      { value: '', label: t('tasks.filters.all') },
      ...PRIOS.map((k) => ({
        value: k,
        label: t(taskPriorityTKey(k)),
      })),
    ],
    [t, i18n.language],
  );

  const assigneeOptions = useMemo(
    () => [
      { value: '', label: t('tasks.filters.all') },
      ...DEMO_USERS.map((u) => ({ value: u.id, label: u.name })),
    ],
    [t, i18n.language],
  );

  const tradeOptions = useMemo(
    () => [
      { value: '', label: t('tasks.filters.all') },
      ...ALL_TRADE_KEYS.map((k) => ({
        value: k,
        label: t(taskTradeKeyTKey(k)),
      })),
    ],
    [t, i18n.language],
  );

  const floorOptions = useMemo(
    () => [
      { value: '', label: t('tasks.filters.all') },
      ...FLOOR_OPTIONS.map((f) => ({ value: f, label: f })),
    ],
    [t, i18n.language],
  );

  const allLabel = t('tasks.filters.all');

  const typeVal = filters.types[0] ?? '';
  const prioVal = filters.priorities[0] ?? '';

  return (
    <div className="mb-3 px-6">
      <div className="rounded-lg border border-border/60 bg-surface/35 px-2.5 py-1.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <FilterField label={t('tasks.filters.type')} labelId={`${uid}-type-lbl`}>
            <Select
              size="sm"
              fullWidth={false}
              triggerClassName={triggerFilter}
              aria-labelledby={`${uid}-type-lbl`}
              options={typeOptions}
              value={typeVal}
              onValueChange={(v) =>
                set({ types: v ? [v as TaskTypeKey] : [] })
              }
              placeholder={allLabel}
            />
          </FilterField>

          <FilterField label={t('tasks.filters.priority')} labelId={`${uid}-prio-lbl`}>
            <Select
              size="sm"
              fullWidth={false}
              triggerClassName={triggerFilter}
              aria-labelledby={`${uid}-prio-lbl`}
              options={priorityOptions}
              value={prioVal}
              onValueChange={(v) =>
                set({ priorities: v ? [v as TaskPriorityKey] : [] })
              }
              placeholder={allLabel}
            />
          </FilterField>

          <FilterField label={t('tasks.filters.assignee')} labelId={`${uid}-asg-lbl`}>
            <Select
              size="sm"
              fullWidth={false}
              triggerClassName={triggerFilter}
              aria-labelledby={`${uid}-asg-lbl`}
              options={assigneeOptions}
              value={filters.assigneeIds[0] ?? ''}
              onValueChange={(v) => set({ assigneeIds: v ? [v] : [] })}
              placeholder={allLabel}
            />
          </FilterField>

          <FilterField label={t('tasks.filters.trade')} labelId={`${uid}-trade-lbl`}>
            <Select
              size="sm"
              fullWidth={false}
              triggerClassName={triggerFilter}
              aria-labelledby={`${uid}-trade-lbl`}
              options={tradeOptions}
              value={filters.trades[0] ?? ''}
              onValueChange={(v) =>
                set({ trades: v ? [v as TaskTradeKey] : [] })
              }
              placeholder={allLabel}
            />
          </FilterField>

          <FilterField label={t('tasks.filters.floor')} labelId={`${uid}-floor-lbl`}>
            <Select
              size="sm"
              fullWidth={false}
              triggerClassName={triggerFilter}
              aria-labelledby={`${uid}-floor-lbl`}
              options={floorOptions}
              value={filters.floors[0] ?? ''}
              onValueChange={(v) => set({ floors: v ? [v] : [] })}
              placeholder={allLabel}
            />
          </FilterField>

          {active ? (
            <button
              type="button"
              onClick={clear}
              className="shrink-0 rounded-md border border-border px-2 py-1.5 text-xs font-medium text-secondary hover:bg-muted/10"
            >
              {t('tasks.filters.clear')}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
