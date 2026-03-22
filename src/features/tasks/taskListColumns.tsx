import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { TFunction } from 'i18next';
import type { DataTableColumn } from '@/components/ui/data-table';
import { Avatar } from '@/components/ui';
import type { BuildWireTask } from '@/types/task';
import { taskPriorityTKey, taskWorkflowTKey } from '@/features/tasks/fixtures';
import { taskTableTypePillClassKey } from '@/features/tasks/taskPresentation';
import { taskTypeKeyTKey, taskTradeKeyTKey } from '@/features/tasks/taskI18nKeys';
import type { DateFormatPref } from '@/lib/userPreferences';
import { formatTaskCreatedDate } from '@/lib/userPreferences';
import { demoPrimaryAssigneeName } from '@/features/tasks/demoUsers';

function TaskProgressRing({ value }: { value: number }) {
  const v = Math.min(100, Math.max(0, value));
  const r = 6;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;
  return (
    <span className="inline-flex items-center justify-center gap-1.5 tabular-nums">
      <svg
        width={18}
        height={18}
        viewBox="0 0 18 18"
        className="shrink-0 -rotate-90 text-sky-500"
        aria-hidden
      >
        <circle cx={9} cy={9} r={r} fill="none" className="stroke-muted/45" strokeWidth={2} />
        <circle
          cx={9}
          cy={9}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-[13px] text-primary">{v}%</span>
    </span>
  );
}

function SelectAllHeader({
  visibleIds,
  selectedIds,
  onToggleAll,
  selectAllLabel,
}: {
  visibleIds: string[];
  selectedIds: Set<string>;
  onToggleAll: (ids: string[]) => void;
  selectAllLabel: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const allSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someSelected = visibleIds.some((id) => selectedIds.has(id));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.indeterminate = someSelected && !allSelected;
  }, [someSelected, allSelected]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={allSelected}
      onChange={() => onToggleAll(visibleIds)}
      className="h-4 w-4 rounded border-border text-brand focus:ring-brand/30"
      aria-label={selectAllLabel}
    />
  );
}

function isOverdueIso(due: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(due)) return false;
  const d = new Date(`${due}T12:00:00`);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return d < t;
}

function PhotosThumbPopover({ task, label }: { task: BuildWireTask; label: string }) {
  const [open, setOpen] = useState(false);
  const n = task.photos.length;
  if (n === 0) {
    return <span className="tabular-nums text-muted">0</span>;
  }
  return (
    <div className="relative inline-block text-start">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="tabular-nums text-primary underline decoration-dotted hover:text-brand"
      >
        {n}
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default bg-transparent"
            aria-label={label}
            onClick={() => setOpen(false)}
          />
          <div className="absolute end-0 top-full z-20 mt-1 flex max-w-[220px] flex-wrap gap-1 rounded-lg border border-border bg-elevated p-2 shadow-xl">
            {task.photos.slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="h-12 w-12 rounded border border-border bg-muted/30"
                title={p.caption || 'Photo'}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function RowMenu({
  taskId,
  labels,
  onAction,
}: {
  taskId: string;
  labels: { edit: string; dup: string; move: string; del: string };
  onAction: (action: 'edit' | 'duplicate' | 'move' | 'delete', id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative text-end">
      <button
        type="button"
        className="rounded p-1 text-muted hover:bg-muted/15 hover:text-primary"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-haspopup="menu"
      >
        ⋮
      </button>
      {open ? (
        <>
          <button type="button" className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul
            role="menu"
            className="absolute end-0 top-full z-20 mt-0.5 min-w-[10rem] rounded-lg border border-border bg-elevated py-1 text-start text-sm shadow-lg"
          >
            <li>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-start hover:bg-muted/10"
                onClick={() => {
                  onAction('edit', taskId);
                  setOpen(false);
                }}
              >
                {labels.edit}
              </button>
            </li>
            <li>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-start hover:bg-muted/10"
                onClick={() => {
                  onAction('duplicate', taskId);
                  setOpen(false);
                }}
              >
                {labels.dup}
              </button>
            </li>
            <li>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-start hover:bg-muted/10"
                onClick={() => {
                  onAction('move', taskId);
                  setOpen(false);
                }}
              >
                {labels.move}
              </button>
            </li>
            <li>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-start text-danger hover:bg-danger/10"
                onClick={() => {
                  onAction('delete', taskId);
                  setOpen(false);
                }}
              >
                {labels.del}
              </button>
            </li>
          </ul>
        </>
      ) : null}
    </div>
  );
}

export type TaskListColumnsOptions = {
  onTaskOpen: (task: BuildWireTask) => void;
  dateFormat: DateFormatPref;
  visibleIds: string[];
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  t: TFunction;
  onRowMenu?: (action: 'edit' | 'duplicate' | 'move' | 'delete', task: BuildWireTask) => void;
};

export function getTaskListColumns({
  onTaskOpen,
  dateFormat,
  visibleIds,
  selectedIds,
  onToggleRow,
  onToggleAll,
  t,
  onRowMenu,
}: TaskListColumnsOptions): DataTableColumn<BuildWireTask>[] {
  const selectHeader: ReactNode = (
    <SelectAllHeader
      visibleIds={visibleIds}
      selectedIds={selectedIds}
      onToggleAll={onToggleAll}
      selectAllLabel={t('tasks.selectAll')}
    />
  );

  return [
    {
      id: 'select',
      header: selectHeader,
      headerClassName: 'w-10 pl-3 pr-0',
      cellClassName: 'pl-3 pr-0',
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.id)}
          onChange={() => onToggleRow(row.id)}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 rounded border-border text-brand focus:ring-brand/30"
          aria-label={t('tasks.selectRow', { id: row.display_number })}
        />
      ),
    },
    {
      id: 'number',
      header: t('tasks.table.number'),
      headerClassName: 'w-[4.75rem] pl-1 pr-2',
      cellClassName: 'pl-1 pr-2 font-mono text-[11px] text-muted',
      cell: (row) => row.display_number,
    },
    {
      id: 'title',
      header: t('tasks.table.title'),
      headerClassName: 'min-w-[12rem] max-w-md pl-3 pr-4',
      cellClassName: 'min-w-[12rem] max-w-md overflow-hidden pl-3 pr-4',
      cell: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTaskOpen(row);
          }}
          title={row.title}
          className="block min-w-0 w-full text-start font-semibold leading-5 text-primary hover:text-brand hover:underline"
        >
          <span className="block truncate">{row.title}</span>
        </button>
      ),
    },
    {
      id: 'type',
      header: t('tasks.table.type'),
      headerClassName: 'w-[8.75rem] px-2',
      cellClassName: 'w-[8.75rem] max-w-[8.75rem] overflow-hidden px-2',
      cell: (row) => {
        const label = t(taskTypeKeyTKey(row.type));
        return (
          <span
            title={label}
            className={`inline-flex h-[22px] max-h-[22px] w-fit max-w-[8.25rem] shrink-0 items-center overflow-hidden rounded-full border px-2 text-[11px] font-medium leading-none ${taskTableTypePillClassKey(row.type)}`}
          >
            <span className="min-w-0 truncate">{label}</span>
          </span>
        );
      },
    },
    {
      id: 'status',
      header: t('tasks.table.status'),
      headerClassName: 'w-[9.25rem] px-2',
      cellClassName: 'w-[9.25rem] max-w-[9.25rem] overflow-hidden px-2',
      cell: (row) => {
        const label = t(taskWorkflowTKey(row.status));
        return (
          <span className="block truncate text-[13px] leading-5 text-primary" title={label}>
            {label}
          </span>
        );
      },
    },
    {
      id: 'priority',
      header: t('tasks.table.priority'),
      headerClassName: 'w-[7rem] px-2',
      cellClassName: 'w-[7rem] max-w-[7rem] overflow-hidden px-2',
      cell: (row) => {
        const label = t(taskPriorityTKey(row.priority));
        return (
          <span className="block truncate capitalize text-[13px] leading-5 text-primary" title={label}>
            {label}
          </span>
        );
      },
    },
    {
      id: 'trade',
      header: t('tasks.table.trade'),
      headerClassName: 'w-[8rem] px-2',
      cellClassName: 'w-[8rem] max-w-[8rem] overflow-hidden px-2',
      cell: (row) => {
        const label = t(taskTradeKeyTKey(row.trade));
        return (
          <span className="block truncate text-[13px] leading-5 text-primary" title={label}>
            {label}
          </span>
        );
      },
    },
    {
      id: 'floor',
      header: t('tasks.table.floor'),
      headerClassName: 'w-[3.75rem] px-2',
      cellClassName: 'px-2 text-secondary',
      cell: (row) => row.floor,
    },
    {
      id: 'assignee',
      header: t('tasks.table.assignee'),
      headerClassName: 'min-w-[9.5rem] max-w-[11rem] px-2',
      cellClassName: 'min-w-0 max-w-[11rem] overflow-hidden px-2',
      cell: (row) => {
        const name = demoPrimaryAssigneeName(row);
        if (name === '—') {
          return <span className="text-[13px] text-muted">—</span>;
        }
        return (
          <span className="flex min-w-0 items-center gap-2 text-[13px] text-primary" title={name}>
            <Avatar name={name} size="sm" className="shrink-0" />
            <span className="min-w-0 flex-1 truncate leading-5">{name}</span>
          </span>
        );
      },
    },
    {
      id: 'progress',
      header: t('tasks.table.progress'),
      align: 'center',
      headerClassName: 'w-[5.5rem] px-2',
      cellClassName: 'px-2',
      cell: (row) => <TaskProgressRing value={row.progress} />,
    },
    {
      id: 'due',
      header: t('tasks.table.due'),
      headerClassName: 'w-[6.5rem] px-2',
      cellClassName: 'px-2 tabular-nums',
      cell: (row) => {
        const overdue =
          isOverdueIso(row.due_date.slice(0, 10)) &&
          row.status !== 'done' &&
          row.status !== 'void';
        const label = formatTaskCreatedDate(row.due_date.slice(0, 10), dateFormat);
        return (
          <span
            className={
              overdue
                ? 'text-[13px] font-medium text-danger'
                : 'text-[13px] text-primary'
            }
          >
            {label}
          </span>
        );
      },
    },
    {
      id: 'created',
      header: t('tasks.table.created'),
      headerClassName: 'w-[6.25rem] px-2',
      cellClassName: 'px-2 text-[12px] text-muted',
      cell: (row) => formatTaskCreatedDate(row.created_at.slice(0, 10), dateFormat),
    },
    {
      id: 'tags',
      header: t('tasks.table.tags'),
      headerClassName: 'w-[7.5rem] px-2',
      cellClassName: 'w-[7.5rem] max-w-[7.5rem] overflow-hidden px-2',
      cell: (row) => {
        if (!row.tags.length) {
          return <span className="text-[11px] text-muted">—</span>;
        }
        const joined = row.tags.join(', ');
        return (
          <span className="block truncate text-[11px] leading-5 text-secondary" title={joined}>
            {joined}
          </span>
        );
      },
    },
    {
      id: 'photos',
      header: t('tasks.table.photos'),
      align: 'right',
      headerClassName: 'w-[3.75rem] pr-3 pl-2',
      cellClassName: 'pr-3 pl-2 text-primary tabular-nums',
      cell: (row) => (
        <PhotosThumbPopover task={row} label={t('tasks.table.photos')} />
      ),
    },
    {
      id: 'actions',
      header: '',
      headerClassName: 'w-10 px-1',
      cellClassName: 'px-1',
      cell: (row) => (
        <RowMenu
          taskId={row.id}
          labels={{
            edit: 'Edit',
            dup: 'Duplicate',
            move: 'Move to project',
            del: 'Delete',
          }}
          onAction={(action) => onRowMenu?.(action, row)}
        />
      ),
    },
  ];
}
