import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { AddFieldModal } from './AddFieldModal';

export type SubtaskDisplay = 'collapsed' | 'expanded';

export type TaskOptionsState = {
  hiddenColumnIds: Set<string>;
  subtaskDisplay: SubtaskDisplay;
  sortBy: string | null;
  groupBy: string | null;
  activeFilters: string[];
};

export const DEFAULT_TASK_OPTIONS: TaskOptionsState = {
  hiddenColumnIds: new Set<string>(),
  subtaskDisplay: 'collapsed',
  sortBy: null,
  groupBy: null,
  activeFilters: [],
};

// These IDs must match TASK_COLUMN_DEFS ids in TasksPage.tsx
type ColumnDef = { id: string; labelKey: string; icon: string };
const TOGGLEABLE_COLUMNS: ColumnDef[] = [
  { id: 'collaborators', labelKey: 'tasks.options.colCollaborators', icon: 'person' },
  { id: 'due',           labelKey: 'tasks.options.colDue',          icon: 'calendar' },
  { id: 'priority',      labelKey: 'tasks.options.colPriority',     icon: 'circle-check' },
  { id: 'status',        labelKey: 'tasks.options.colStatus',       icon: 'circle-check' },
  { id: 'type',          labelKey: 'tasks.options.colType',         icon: 'circle-check' },
  { id: 'drawing',       labelKey: 'tasks.options.colDrawing',      icon: 'person' },
];

type FieldItem = { key: string; labelKey: string; icon: 'calendar' | 'person' | 'clock' | 'priority' | 'status' | 'like' | 'alpha' };

const SORT_FIELDS: FieldItem[] = [
  { key: 'start_date',     labelKey: 'tasks.options.fieldStartDate',    icon: 'calendar' },
  { key: 'due_date',       labelKey: 'tasks.options.fieldDueDate',      icon: 'calendar' },
  { key: 'assignee',       labelKey: 'tasks.options.fieldAssignee',     icon: 'person' },
  { key: 'created_by',     labelKey: 'tasks.options.fieldCreatedBy',    icon: 'person' },
  { key: 'created_on',     labelKey: 'tasks.options.fieldCreatedOn',    icon: 'clock' },
  { key: 'last_modified',  labelKey: 'tasks.options.fieldLastModified', icon: 'clock' },
  { key: 'completed_on',   labelKey: 'tasks.options.fieldCompletedOn',  icon: 'clock' },
  { key: 'likes',          labelKey: 'tasks.options.fieldLikes',        icon: 'like' },
  { key: 'alphabetical',   labelKey: 'tasks.options.fieldAlphabetical', icon: 'alpha' },
  { key: 'priority',       labelKey: 'tasks.options.fieldPriority',     icon: 'priority' },
  { key: 'status',         labelKey: 'tasks.options.fieldStatus',       icon: 'status' },
];

const GROUP_FIELDS: FieldItem[] = [
  { key: 'start_date',    labelKey: 'tasks.options.fieldStartDate',    icon: 'calendar' },
  { key: 'due_date',      labelKey: 'tasks.options.fieldDueDate',      icon: 'calendar' },
  { key: 'assignee',      labelKey: 'tasks.options.fieldAssignee',     icon: 'person' },
  { key: 'created_by',   labelKey: 'tasks.options.fieldCreatedBy',    icon: 'person' },
  { key: 'created_on',   labelKey: 'tasks.options.fieldCreatedOn',    icon: 'clock' },
  { key: 'last_modified',labelKey: 'tasks.options.fieldLastModified', icon: 'clock' },
  { key: 'completed_on', labelKey: 'tasks.options.fieldCompletedOn',  icon: 'clock' },
  { key: 'project',      labelKey: 'tasks.options.fieldProject',      icon: 'status' },
  { key: 'priority',     labelKey: 'tasks.options.fieldPriority',     icon: 'priority' },
  { key: 'status',       labelKey: 'tasks.options.fieldStatus',       icon: 'status' },
];

const FILTER_FIELDS: FieldItem[] = [
  { key: 'completion_status', labelKey: 'tasks.options.fieldCompletionStatus', icon: 'status' },
  { key: 'assignee',          labelKey: 'tasks.options.fieldAssignee',         icon: 'person' },
  { key: 'start_date',        labelKey: 'tasks.options.fieldStartDate',        icon: 'calendar' },
  { key: 'due_date',          labelKey: 'tasks.options.fieldDueDate',          icon: 'calendar' },
  { key: 'created_by',        labelKey: 'tasks.options.fieldCreatedBy',        icon: 'person' },
  { key: 'created_on',        labelKey: 'tasks.options.fieldCreatedOn',        icon: 'clock' },
  { key: 'last_modified',     labelKey: 'tasks.options.fieldLastModified',     icon: 'clock' },
  { key: 'completed_on',      labelKey: 'tasks.options.fieldCompletedOn',      icon: 'clock' },
  { key: 'task_type',         labelKey: 'tasks.options.fieldTaskType',         icon: 'status' },
  { key: 'priority',          labelKey: 'tasks.options.fieldPriority',         icon: 'priority' },
  { key: 'status',            labelKey: 'tasks.options.fieldStatus',           icon: 'status' },
];

type Panel = 'main' | 'columns' | 'filters' | 'sorts' | 'groups' | 'subtasks';

// --- Small SVG icons ---
function IcCalendar() {
  return (
    <svg className="h-4 w-4 shrink-0 text-muted" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <rect x="2" y="3" width="12" height="11" rx="1.5" />
      <path d="M5 1.5v3M11 1.5v3M2 7h12" strokeLinecap="round" />
    </svg>
  );
}
function IcPerson() {
  return (
    <svg className="h-4 w-4 shrink-0 text-muted" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-4 6s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H4z" />
    </svg>
  );
}
function IcClock() {
  return (
    <svg className="h-4 w-4 shrink-0 text-muted" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3.5l2 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IcCircleCheck() {
  return (
    <svg className="h-4 w-4 shrink-0 text-muted" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <circle cx="8" cy="8" r="6" />
      <path d="M5.5 8.5l2 2 3-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IcLike() {
  return (
    <svg className="h-4 w-4 shrink-0 text-muted" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <path d="M5 14H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h2m0 7V7m0 7h6.5a1 1 0 0 0 .97-.76l1-4A1 1 0 0 0 12.5 7H10V4a1 1 0 0 0-1-1h-.5L5 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IcAlpha() {
  return (
    <svg className="h-4 w-4 shrink-0 text-muted" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <text x="2" y="13" fontSize="11" fontFamily="serif" fontWeight="600">A</text>
    </svg>
  );
}
function IcColumns() {
  return (
    <svg className="h-4 w-4 shrink-0 text-muted" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M2 2.5A.5.5 0 0 1 2.5 2h11a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-2zm0 5A.5.5 0 0 1 2.5 7h11a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-2zm0 5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-2z" />
    </svg>
  );
}
function IcFilter() {
  return (
    <svg className="h-4 w-4 shrink-0 text-muted" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M1.5 3.25a.75.75 0 0 1 .75-.75h11.5a.75.75 0 0 1 0 1.5H2.25a.75.75 0 0 1-.75-.75zM3 7.25a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 3 7.25zm2 4a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 11.25z" />
    </svg>
  );
}
function IcSort() {
  return (
    <svg className="h-4 w-4 shrink-0 text-muted" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M3.5 3.75a.75.75 0 0 0-1.5 0v8.5a.75.75 0 0 0 1.5 0v-8.5zm5.25 0a.75.75 0 0 0-1.5 0v8.5a.75.75 0 0 0 1.5 0V7.5l3.22 5.28a.75.75 0 0 0 1.28-.78V3.75a.75.75 0 0 0-1.5 0v4.75L8.75 3.22z" />
    </svg>
  );
}
function IcGroup() {
  return (
    <svg className="h-4 w-4 shrink-0 text-muted" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M1 2.75A.75.75 0 0 1 1.75 2h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 1 2.75zm0 5A.75.75 0 0 1 1.75 7h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 1 7.75zm0 5a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75zM9.25 2a.75.75 0 0 0 0 1.5h5a.75.75 0 0 0 0-1.5h-5zm0 5a.75.75 0 0 0 0 1.5h5a.75.75 0 0 0 0-1.5h-5zm0 5a.75.75 0 0 0 0 1.5h5a.75.75 0 0 0 0-1.5h-5z" />
    </svg>
  );
}
function IcSubtasks() {
  return (
    <svg className="h-4 w-4 shrink-0 text-muted" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <path d="M2 3h5M2 8h3M2 13h6" strokeLinecap="round" />
      <path d="M4 8v5" strokeLinecap="round" />
    </svg>
  );
}
function IcChevronRight() {
  return (
    <svg className="h-3.5 w-3.5 text-muted" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06z" />
    </svg>
  );
}
function IcChevronDown() {
  return (
    <svg className="h-3.5 w-3.5 text-muted" viewBox="0 0 12 12" fill="none" stroke="currentColor" aria-hidden>
      <path d="M2 4l4 4 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IcBack() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M9.78 12.78a.75.75 0 0 1-1.06 0L4.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 1.06L6.06 8l3.72 3.72a.75.75 0 0 1 0 1.06z" />
    </svg>
  );
}
function IcCheck() {
  return (
    <svg className="h-3.5 w-3.5 text-brand" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 1 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
    </svg>
  );
}

function FieldIcon({ icon }: { icon: FieldItem['icon'] }) {
  switch (icon) {
    case 'calendar': return <IcCalendar />;
    case 'person':   return <IcPerson />;
    case 'clock':    return <IcClock />;
    case 'like':     return <IcLike />;
    case 'alpha':    return <IcAlpha />;
    default:         return <IcCircleCheck />;
  }
}

// Toggle switch
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${checked ? 'bg-brand' : 'bg-zinc-600'}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

// Divider
function Divider() {
  return <div className="mx-4 border-t border-zinc-700/60" />;
}

// Shared panel wrapper
function PanelShell({ children, maxH = true }: { children: React.ReactNode; maxH?: boolean }) {
  return (
    <div className={`w-full rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50 flex flex-col ${maxH ? 'max-h-[80vh]' : ''}`}>
      {children}
    </div>
  );
}

// Sub-panel header with back button
function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3.5 border-b border-zinc-700/60 shrink-0">
      <button type="button" onClick={onBack} className="rounded p-0.5 text-secondary hover:text-primary" aria-label="Back">
        <IcBack />
      </button>
      <span className="text-base font-semibold text-primary">{title}</span>
    </div>
  );
}

// Searchable field list used by Sorts, Groups, Filters sub-panels
function FieldList({
  fields,
  searchPlaceholder,
  selected,
  onSelect,
}: {
  fields: FieldItem[];
  searchPlaceholder: string;
  selected?: string | null;
  onSelect: (key: string) => void;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const filtered = query.trim()
    ? fields.filter((f) => t(f.labelKey).toLowerCase().includes(query.toLowerCase()))
    : fields;

  return (
    <>
      <div className="px-3 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5">
          <svg className="h-3.5 w-3.5 shrink-0 text-muted" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M6.5 1a5.5 5.5 0 1 0 3.535 9.596l3.185 3.184a.75.75 0 1 0 1.06-1.06L11.096 10.03A5.5 5.5 0 0 0 6.5 1zm-4 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0z" />
          </svg>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent text-[13px] text-primary placeholder:text-muted focus:outline-none"
          />
        </div>
      </div>
      <div className="overflow-y-auto flex-1 px-1 pb-2">
        {filtered.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onSelect(f.key)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-primary hover:bg-white/5"
          >
            <FieldIcon icon={f.icon} />
            <span className="flex-1 text-left">{t(f.labelKey)}</span>
            {selected === f.key ? <IcCheck /> : null}
          </button>
        ))}
      </div>
    </>
  );
}

type Props = {
  viewName?: string;
  options: TaskOptionsState;
  onChange: (next: TaskOptionsState) => void;
  onClose?: () => void;
  onSendFeedback?: () => void;
};

export function TaskOptionsPanel({ viewName = 'List', options, onChange, onClose, onSendFeedback }: Props) {
  const { t } = useTranslation();
  const [panel, setPanel] = useState<Panel>('main');
  const [subtasksOpen, setSubtasksOpen] = useState(false);
  const [addFieldOpen, setAddFieldOpen] = useState(false);
  const subtasksRef = useRef<HTMLDivElement>(null);

  const hiddenCount = TOGGLEABLE_COLUMNS.filter((c) => options.hiddenColumnIds.has(c.id)).length;

  function toggleColumn(id: string) {
    const next = new Set(options.hiddenColumnIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    onChange({ ...options, hiddenColumnIds: next });
  }

  // --- Main panel ---
  if (panel === 'main') {
    return (
      <PanelShell maxH={false}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-700/60">
          <span className="text-base font-semibold text-primary">{viewName}</span>
          <button type="button" onClick={onClose} className="rounded p-1 text-muted hover:text-primary" aria-label="Close">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M13.78 3.28a.75.75 0 0 0-1.06-1.06L8 6.94 3.28 2.22a.75.75 0 0 0-1.06 1.06L6.94 8l-4.72 4.72a.75.75 0 1 0 1.06 1.06L8 9.06l4.72 4.72a.75.75 0 1 0 1.06-1.06L9.06 8l4.72-4.72z" />
            </svg>
          </button>
        </div>

        {/* Icon + name row */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-muted">
            <IcPerson />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-muted">{t('tasks.options.iconViewName')}</span>
            <span className="text-sm font-medium text-primary">{viewName}</span>
          </div>
        </div>

        <Divider />

        {/* Show/hide columns */}
        <button type="button" onClick={() => setPanel('columns')} className="flex w-full items-center justify-between px-4 py-3 hover:bg-white/5">
          <span className="flex items-center gap-3 text-sm text-primary">
            <IcColumns />
            {t('tasks.options.showHideColumns')}
          </span>
          <span className="flex items-center gap-2 text-xs text-muted">
            {hiddenCount > 0 ? `${hiddenCount} ${t('tasks.options.hidden')}` : null}
            <IcChevronRight />
          </span>
        </button>

        <Divider />

        {/* Filters */}
        <button type="button" onClick={() => setPanel('filters')} className="flex w-full items-center justify-between px-4 py-3 hover:bg-white/5">
          <span className="flex items-center gap-3 text-sm text-primary">
            <IcFilter />
            {t('tasks.filter')}
          </span>
          <IcChevronRight />
        </button>

        <Divider />

        {/* Sorts */}
        <button type="button" onClick={() => setPanel('sorts')} className="flex w-full items-center justify-between px-4 py-3 hover:bg-white/5">
          <span className="flex items-center gap-3 text-sm text-primary">
            <IcSort />
            {t('tasks.listToolbarSort')}
          </span>
          <IcChevronRight />
        </button>

        <Divider />

        {/* Groups */}
        <button type="button" onClick={() => setPanel('groups')} className="flex w-full items-center justify-between px-4 py-3 hover:bg-white/5">
          <span className="flex items-center gap-3 text-sm text-primary">
            <IcGroup />
            {t('tasks.listToolbarGroup')}
          </span>
          <IcChevronRight />
        </button>

        <Divider />

        {/* Subtasks — dropdown inline */}
        <div className="relative" ref={subtasksRef}>
          <button
            type="button"
            onClick={() => setSubtasksOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 hover:bg-white/5"
          >
            <span className="flex items-center gap-3 text-sm text-primary">
              <IcSubtasks />
              {t('tasks.options.subtasks')}
            </span>
            <span className="flex items-center gap-2 text-xs text-muted">
              {t(options.subtaskDisplay === 'collapsed' ? 'tasks.options.subtasksCollapsed' : 'tasks.options.subtasksExpanded')}
              <IcChevronDown />
            </span>
          </button>

          {subtasksOpen ? (
            <div className="absolute bottom-full right-4 mb-1 z-10 min-w-[200px] rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl shadow-black/40 py-1">
              {(['collapsed', 'expanded'] as SubtaskDisplay[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => { onChange({ ...options, subtaskDisplay: v }); setSubtasksOpen(false); }}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-primary hover:bg-white/5"
                >
                  <span>{t(v === 'collapsed' ? 'tasks.options.subtasksCollapsed' : 'tasks.options.subtasksExpanded')}</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] text-muted">
                      <kbd className="rounded border border-zinc-600 bg-zinc-800 px-1 py-0.5 font-sans text-[10px]">Shift</kbd>
                      <kbd className="rounded border border-zinc-600 bg-zinc-800 px-1 py-0.5 font-sans text-[10px]">Tab</kbd>
                      <kbd className="rounded border border-zinc-600 bg-zinc-800 px-1 py-0.5 font-sans text-[10px]">{v === 'collapsed' ? '↑' : '↓'}</kbd>
                    </span>
                    {options.subtaskDisplay === v ? <IcCheck /> : <span className="h-3.5 w-3.5" />}
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <Divider />

        {/* Send feedback + Save view */}
        <div className="flex items-center justify-between px-4 py-3">
          <button type="button" onClick={onSendFeedback} className="text-xs text-secondary underline hover:text-primary">
            {t('tasks.options.sendFeedback')}
          </button>
          <Button type="button" variant="primary" size="sm">
            {t('tasks.options.saveView')}
          </Button>
        </div>
      </PanelShell>
    );
  }

  // --- Show/hide columns sub-panel ---
  if (panel === 'columns') {
    return (
      <>
        <PanelShell>
          <SubHeader title={t('tasks.options.showHideColumns')} onBack={() => setPanel('main')} />
          <div className="px-4 pt-3 pb-2 shrink-0 flex items-center justify-between">
            <span className="text-xs text-muted">{t('tasks.options.showHideColumnsHint')}</span>
            <Button type="button" variant="secondary" size="sm" onClick={() => setAddFieldOpen(true)}>
              + {t('tasks.options.add')}
            </Button>
          </div>
          <div className="overflow-y-auto flex-1 pb-2">
            {TOGGLEABLE_COLUMNS.map((col, i) => {
              const visible = !options.hiddenColumnIds.has(col.id);
              return (
                <div key={col.id}>
                  {i > 0 ? <div className="mx-4 border-t border-zinc-700/40" /> : null}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <FieldIcon icon={col.icon as FieldItem['icon']} />
                    <span className="flex-1 text-sm font-medium text-primary">{t(col.labelKey)}</span>
                    <Toggle checked={visible} onChange={() => toggleColumn(col.id)} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-4 py-3 border-t border-zinc-700/60 flex justify-end shrink-0">
            <Button type="button" variant="primary" size="sm">
              {t('tasks.options.saveView')}
            </Button>
          </div>
        </PanelShell>
        <AddFieldModal
          open={addFieldOpen}
          onClose={() => setAddFieldOpen(false)}
          onCreateField={() => setAddFieldOpen(false)}
        />
      </>
    );
  }

  // --- Filters sub-panel ---
  if (panel === 'filters') {
    return (
      <PanelShell>
        <SubHeader title={t('tasks.options.addFilter')} onBack={() => setPanel('main')} />
        <FieldList
          fields={FILTER_FIELDS}
          searchPlaceholder={t('tasks.options.filterBy')}
          selected={options.activeFilters[0] ?? null}
          onSelect={(key) => {
            const next = options.activeFilters.includes(key)
              ? options.activeFilters.filter((k) => k !== key)
              : [...options.activeFilters, key];
            onChange({ ...options, activeFilters: next });
          }}
        />
        <div className="px-4 py-3 border-t border-zinc-700/60 flex justify-end shrink-0">
          <Button type="button" variant="primary" size="sm">
            {t('tasks.options.saveView')}
          </Button>
        </div>
      </PanelShell>
    );
  }

  // --- Sorts sub-panel ---
  if (panel === 'sorts') {
    return (
      <PanelShell>
        <SubHeader title={t('tasks.options.addSort')} onBack={() => setPanel('main')} />
        <FieldList
          fields={SORT_FIELDS}
          searchPlaceholder={t('tasks.options.sortBy')}
          selected={options.sortBy}
          onSelect={(key) => onChange({ ...options, sortBy: options.sortBy === key ? null : key })}
        />
        <div className="px-4 py-3 border-t border-zinc-700/60 flex justify-end shrink-0">
          <Button type="button" variant="primary" size="sm">
            {t('tasks.options.saveView')}
          </Button>
        </div>
      </PanelShell>
    );
  }

  // --- Groups sub-panel ---
  if (panel === 'groups') {
    return (
      <PanelShell>
        <SubHeader title={t('tasks.listToolbarGroup')} onBack={() => setPanel('main')} />
        <FieldList
          fields={GROUP_FIELDS}
          searchPlaceholder={t('tasks.options.groupBy')}
          selected={options.groupBy}
          onSelect={(key) => onChange({ ...options, groupBy: options.groupBy === key ? null : key })}
        />
        <div className="px-4 py-3 border-t border-zinc-700/60 flex justify-end shrink-0">
          <Button type="button" variant="primary" size="sm">
            {t('tasks.options.saveView')}
          </Button>
        </div>
      </PanelShell>
    );
  }

  return null;
}
