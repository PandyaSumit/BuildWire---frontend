import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from '@/components/ui/select';

export type GroupByKey =
  | 'sections'
  | 'priority'
  | 'status'
  | 'type'
  | 'trade'
  | 'floor'
  | 'due_date';

export type GroupSortOrder = 'custom' | 'asc' | 'desc';

type Props = {
  groupBy: GroupByKey;
  sortOrder: GroupSortOrder;
  onGroupByChange: (v: GroupByKey) => void;
  onSortOrderChange: (v: GroupSortOrder) => void;
  onClear: () => void;
};

const GROUP_OPTION_DEFS: { value: GroupByKey; labelKey: string }[] = [
  { value: 'sections', labelKey: 'tasks.group.sections' },
  { value: 'priority', labelKey: 'tasks.filters.priority' },
  { value: 'status', labelKey: 'tasks.listColStatus' },
  { value: 'type', labelKey: 'tasks.filters.type' },
  { value: 'assignee' as GroupByKey, labelKey: 'tasks.filters.assignee' },
  { value: 'trade', labelKey: 'tasks.filters.trade' },
  { value: 'floor', labelKey: 'tasks.filters.floor' },
  { value: 'due_date', labelKey: 'tasks.group.dueDate' },
];

const SORT_OPTION_DEFS: { value: GroupSortOrder; labelKey: string }[] = [
  { value: 'custom', labelKey: 'tasks.group.customOrder' },
  { value: 'asc', labelKey: 'tasks.group.ascending' },
  { value: 'desc', labelKey: 'tasks.group.descending' },
];

const DARK_TRIGGER = 'bg-zinc-800 border-zinc-700';
const DARK_DROPDOWN = '!bg-zinc-900 !border-zinc-700';

export function TaskGroupPanel({
  groupBy,
  sortOrder,
  onGroupByChange,
  onSortOrderChange,
  onClear,
}: Props) {
  const { t } = useTranslation();
  const isModified = groupBy !== 'sections' || sortOrder !== 'custom';

  const groupOptions = useMemo(
    () => GROUP_OPTION_DEFS.map((o) => ({ value: o.value, label: t(o.labelKey) })),
    [t],
  );

  const sortOptions = useMemo(
    () => SORT_OPTION_DEFS.map((o) => ({ value: o.value, label: t(o.labelKey) })),
    [t],
  );

  return (
    <div className="rounded-md border border-zinc-700 bg-zinc-900 shadow-xl shadow-black/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">{t('tasks.group.title')}</span>
        {isModified ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-secondary hover:text-primary hover:underline"
          >
            {t('tasks.group.clear')}
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-2 rounded-md border border-zinc-700/70 bg-zinc-800/50 px-3 py-2">
        <svg
          className="h-4 w-4 shrink-0 text-muted"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden
        >
          <path d="M2 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3.75-1.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5zm0 5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5zm0 5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5zM3 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
        </svg>

        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Select
            size="sm"
            fullWidth={false}
            triggerClassName={`min-w-[9rem] flex-1 ${DARK_TRIGGER}`}
            dropdownClassName={DARK_DROPDOWN}
            options={groupOptions}
            value={groupBy}
            onValueChange={(v) => onGroupByChange(v as GroupByKey)}
          />

          <Select
            size="sm"
            fullWidth={false}
            triggerClassName={`min-w-[9rem] ${DARK_TRIGGER}`}
            dropdownClassName={DARK_DROPDOWN}
            options={sortOptions}
            value={sortOrder}
            onValueChange={(v) => onSortOrderChange(v as GroupSortOrder)}
          />
        </div>

        <button
          type="button"
          onClick={onClear}
          aria-label="Remove group"
          className="shrink-0 rounded p-0.5 text-muted hover:bg-muted/15 hover:text-primary"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-secondary hover:text-primary"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <path d="M8 3a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5v-3.5A.75.75 0 0 1 8 3z" />
        </svg>
        {t('tasks.group.addSubgroup')}
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" aria-hidden>
          <path d="M2 4l4 4 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
