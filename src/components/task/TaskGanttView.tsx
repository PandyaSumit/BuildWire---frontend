import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BuildWireTask, TaskStatus } from '@/types/task';
import { useTaskProject } from '@/hooks/task/TaskProjectContext';
import { ganttBarFill, GANTT_OVERDUE_STROKE } from '@/utils/task/taskPresentation';
import { demoPrimaryAssigneeName } from '@/utils/task/demoUsers';
import { EmptyState, Select } from '@/components/ui';
import type { SelectOption } from '@/components/ui/select';

// ── Types ─────────────────────────────────────────────────────────────────────
type Zoom   = 'hours' | 'days' | 'weeks' | 'months' | 'quarters' | 'half-year' | 'years';
type SortBy = 'none' | 'start_date' | 'due_date' | 'assignee';

interface TimelineSection {
  id: string;
  label: string;
  status: TaskStatus | 'custom';
  tasks: BuildWireTask[];
  collapsed: boolean;
}

interface HeaderUnit {
  label: string;
  monthLabel: string;
  dayStart: number;
  dayEnd: number;
}

// ── Date helpers ──────────────────────────────────────────────────────────────
function parseIso(d: string): Date {
  const x = new Date(`${d.slice(0, 10)}T12:00:00`);
  return Number.isNaN(x.getTime()) ? new Date() : x;
}
function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}
function startOfWeek(d: Date): Date {
  const r = new Date(d); r.setDate(r.getDate() - r.getDay()); r.setHours(12, 0, 0, 0); return r;
}
function startOfMonth(d: Date)    { return new Date(d.getFullYear(), d.getMonth(), 1, 12); }
function startOfQuarter(d: Date)  { return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1, 12); }
function startOfHalfYear(d: Date) { return new Date(d.getFullYear(), d.getMonth() < 6 ? 0 : 6, 1, 12); }
function startOfYear(d: Date)     { return new Date(d.getFullYear(), 0, 1, 12); }

function fmtUnitLabel(d: Date, zoom: Zoom): string {
  if (zoom === 'hours')     return `${String(d.getHours()).padStart(2, '0')}:00`;
  if (zoom === 'days')      return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  if (zoom === 'weeks') {
    const end = addDays(d, 6);
    const sm  = d.toLocaleDateString('en', { month: 'short' });
    const em  = end.toLocaleDateString('en', { month: 'short' });
    return sm === em ? `${sm} ${d.getDate()}–${end.getDate()}` : `${sm} ${d.getDate()} – ${em} ${end.getDate()}`;
  }
  if (zoom === 'months')    return d.toLocaleDateString('en', { month: 'short', year: 'numeric' });
  if (zoom === 'quarters')  return `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
  if (zoom === 'half-year') return `${d.getMonth() < 6 ? 'H1' : 'H2'} ${d.getFullYear()}`;
  return String(d.getFullYear());
}
function fmtMonthLabel(d: Date, zoom: Zoom): string {
  if (zoom === 'hours' || zoom === 'days' || zoom === 'weeks')
    return d.toLocaleDateString('en', { month: 'long', year: 'numeric' });
  if (zoom === 'months' || zoom === 'quarters' || zoom === 'half-year')
    return String(d.getFullYear());
  return '';
}

function zoomPxPerDay(zoom: Zoom): number {
  switch (zoom) {
    case 'hours':     return 60 * 24;
    case 'days':      return 36;
    case 'weeks':     return 120 / 7;
    case 'months':    return 80 / 30;
    case 'quarters':  return 80 / 91;
    case 'half-year': return 80 / 182;
    case 'years':     return 100 / 365;
  }
}

function buildHeaderUnits(anchor: Date, totalDays: number, zoom: Zoom): HeaderUnit[] {
  const units: HeaderUnit[] = [];
  if (zoom === 'hours') {
    for (let h = 0; h < totalDays * 24; h++) {
      const d = new Date(anchor); d.setHours(d.getHours() + h);
      units.push({ label: `${d.getHours()}:00`, monthLabel: fmtMonthLabel(d, zoom), dayStart: h / 24, dayEnd: (h + 1) / 24 });
    }
    return units;
  }
  let cur: Date;
  if      (zoom === 'days')       cur = new Date(anchor);
  else if (zoom === 'weeks')      cur = startOfWeek(anchor);
  else if (zoom === 'months')     cur = startOfMonth(anchor);
  else if (zoom === 'quarters')   cur = startOfQuarter(anchor);
  else if (zoom === 'half-year')  cur = startOfHalfYear(anchor);
  else                            cur = startOfYear(anchor);

  const endDate = addDays(anchor, totalDays);
  while (cur < endDate) {
    let next: Date;
    if      (zoom === 'days')       next = addDays(cur, 1);
    else if (zoom === 'weeks')      next = addDays(cur, 7);
    else if (zoom === 'months')     next = new Date(cur.getFullYear(), cur.getMonth() + 1, 1, 12);
    else if (zoom === 'quarters')   next = new Date(cur.getFullYear(), cur.getMonth() + 3, 1, 12);
    else if (zoom === 'half-year')  next = new Date(cur.getFullYear(), cur.getMonth() + 6, 1, 12);
    else                            next = new Date(cur.getFullYear() + 1, 0, 1, 12);
    const ds = Math.max(0, daysBetween(anchor, cur));
    const de = Math.min(totalDays, daysBetween(anchor, next));
    if (de > ds) units.push({ label: fmtUnitLabel(cur, zoom), monthLabel: fmtMonthLabel(cur, zoom), dayStart: ds, dayEnd: de });
    cur = next;
  }
  return units;
}

// ── Section builder ───────────────────────────────────────────────────────────
function buildSections(tasks: BuildWireTask[], sortBy: SortBy): Omit<TimelineSection, 'collapsed'>[] {
  const todo: BuildWireTask[] = [], doing: BuildWireTask[] = [], done: BuildWireTask[] = [];
  for (const t of tasks) {
    if (t.status === 'void') continue;
    if (t.status === 'done')        done.push(t);
    else if (t.status === 'open')   todo.push(t);
    else                            doing.push(t);
  }
  const sort = (arr: BuildWireTask[]) => sortBy === 'none' ? arr : [...arr].sort((a, b) => {
    if (sortBy === 'start_date') return a.start_date.localeCompare(b.start_date);
    if (sortBy === 'due_date')   return a.due_date.localeCompare(b.due_date);
    if (sortBy === 'assignee')   return demoPrimaryAssigneeName(a).localeCompare(demoPrimaryAssigneeName(b));
    return 0;
  });
  return [
    { id: 'todo',  label: 'To do',  status: 'open' as TaskStatus,        tasks: sort(todo) },
    { id: 'doing', label: 'Doing',  status: 'in_progress' as TaskStatus, tasks: sort(doing) },
    { id: 'done',  label: 'Done',   status: 'done' as TaskStatus,        tasks: sort(done) },
  ];
}

// ── Filter state ──────────────────────────────────────────────────────────────
interface FilterState {
  incomplete: boolean; completed: boolean; myTasks: boolean;
  dueThisWeek: boolean; dueNextWeek: boolean;
}
const EMPTY_FILTERS: FilterState = { incomplete: false, completed: false, myTasks: false, dueThisWeek: false, dueNextWeek: false };

function applyGanttFilters(tasks: BuildWireTask[], f: FilterState): BuildWireTask[] {
  let out = tasks;
  if (f.incomplete) out = out.filter((t) => t.status !== 'done' && t.status !== 'void');
  if (f.completed)  out = out.filter((t) => t.status === 'done');
  if (f.myTasks)    out = out.filter((t) => t.assignees.length > 0);
  if (f.dueThisWeek || f.dueNextWeek) {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const in7  = addDays(now, 7);
    const in14 = addDays(now, 14);
    out = out.filter((t) => {
      const due = parseIso(t.due_date);
      if (f.dueThisWeek && due >= now && due < in7)  return true;
      if (f.dueNextWeek && due >= in7 && due < in14) return true;
      return false;
    });
  }
  return out;
}

// ── Select option arrays (used with existing Select component) ────────────────
const ZOOM_OPTIONS: SelectOption[] = [
  { value: 'hours',     label: 'Hours' },
  { value: 'days',      label: 'Days' },
  { value: 'weeks',     label: 'Weeks' },
  { value: 'months',    label: 'Months' },
  { value: 'quarters',  label: 'Quarters' },
  { value: 'half-year', label: 'Half-year' },
  { value: 'years',     label: 'Years' },
];

const SORT_OPTIONS: SelectOption[] = [
  { value: 'none',       label: 'None' },
  { value: 'start_date', label: 'Start date' },
  { value: 'due_date',   label: 'Due date' },
  { value: 'assignee',   label: 'Assignee' },
];

// ── SVG layout constants ──────────────────────────────────────────────────────
const HDR_TOP        = 32;   // month row height
const HDR_BOT        = 30;   // unit row height
const HDR_H          = HDR_TOP + HDR_BOT;
const ROW_H          = 48;   // task row height
const SEC_H          = 40;   // section header height
const BAR_H          = 22;   // gantt bar height
const SIDEBAR        = 300;  // sidebar width on ≥sm
const SIDEBAR_MOBILE = 72;   // sidebar width on mobile — number only, no title

// ── Section accent colors ─────────────────────────────────────────────────────
function sectionAccentColor(id: string): { bar: string; svgFill: string; dot: string } {
  switch (id) {
    case 'todo':  return { bar: 'bg-sky-500/70',   svgFill: 'rgba(14,165,233,0.55)',  dot: '#0ea5e9' };
    case 'doing': return { bar: 'bg-brand/70',     svgFill: 'rgba(59,130,246,0.55)',  dot: '#3b82f6' };
    case 'done':  return { bar: 'bg-success/70',   svgFill: 'rgba(34,197,94,0.45)',   dot: '#22c55e' };
    default:      return { bar: 'bg-muted/50',     svgFill: 'rgba(107,114,128,0.40)', dot: '#6b7280' };
  }
}

// ── Tiny icon helpers ─────────────────────────────────────────────────────────
function ChevronDown({ cls = 'h-3.5 w-3.5' }: { cls?: string }) {
  return (
    <svg className={cls} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06z" />
    </svg>
  );
}
function FilterIcon({ cls = 'h-3.5 w-3.5' }: { cls?: string }) {
  return (
    <svg className={cls} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M1.5 3.25a.75.75 0 0 1 .75-.75h11.5a.75.75 0 0 1 0 1.5H2.25a.75.75 0 0 1-.75-.75zM3 7.25a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 3 7.25zm2 4a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 11.25z" />
    </svg>
  );
}
function SortIcon({ cls = 'h-3.5 w-3.5' }: { cls?: string }) {
  return (
    <svg className={cls} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M3.5 3.75a.75.75 0 0 0-1.5 0v8.5a.75.75 0 0 0 1.5 0v-8.5zm5.25 0a.75.75 0 0 0-1.5 0v8.5a.75.75 0 0 0 1.5 0V7.5l3.22 5.28a.75.75 0 0 0 1.28-.78V3.75a.75.75 0 0 0-1.5 0v4.75L8.75 3.22z" />
    </svg>
  );
}
function PlusIcon({ cls = 'h-3.5 w-3.5' }: { cls?: string }) {
  return (
    <svg className={cls} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 3a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5v-3.5A.75.75 0 0 1 8 3z" />
    </svg>
  );
}
function CloseIcon({ cls = 'h-4 w-4' }: { cls?: string }) {
  return (
    <svg className={cls} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" />
    </svg>
  );
}

// ── Filter panel ──────────────────────────────────────────────────────────────
function FilterPanel({ filters, onChange, onClose }: { filters: FilterState; onChange: (f: FilterState) => void; onClose: () => void }) {
  const hasAny = Object.values(filters).some(Boolean);
  const toggle = (k: keyof FilterState) => onChange({ ...filters, [k]: !filters[k] });

  function Chip({ k, label, icon }: { k: keyof FilterState; label: string; icon: string }) {
    return (
      <button
        type="button"
        onClick={() => toggle(k)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] transition-colors ${
          filters[k]
            ? 'border-brand/60 bg-brand/10 text-brand'
            : 'border-border/60 bg-surface text-secondary hover:border-brand/40 hover:text-primary'
        }`}
      >
        <span aria-hidden>{icon}</span>{label}
      </button>
    );
  }

  return (
    <div className="absolute right-0 top-full z-50 mt-1 w-[min(420px,calc(100vw-1rem))] rounded-xl border border-border/60 bg-elevated shadow-lg shadow-black/20">
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <span className="text-[14px] font-semibold text-primary">Filters</span>
        <div className="flex items-center gap-3">
          {hasAny && <button type="button" onClick={() => onChange(EMPTY_FILTERS)} className="text-[12px] text-muted hover:text-primary">Clear</button>}
          <button type="button" onClick={onClose} className="text-muted hover:text-primary"><CloseIcon /></button>
        </div>
      </div>
      <div className="p-4">
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted">Quick filters</p>
        <div className="flex flex-wrap gap-2">
          <Chip k="incomplete"  label="Incomplete tasks"  icon="⊙" />
          <Chip k="completed"   label="Completed tasks"   icon="✓" />
          <Chip k="myTasks"     label="Just my tasks"     icon="⊛" />
          <Chip k="dueThisWeek" label="Due this week"     icon="⊡" />
          <Chip k="dueNextWeek" label="Due next week"     icon="⊞" />
        </div>
        <button type="button" className="mt-4 flex items-center gap-1.5 text-[12px] text-muted hover:text-primary">
          <PlusIcon /><span>Add filter</span><ChevronDown cls="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ── Sort panel ────────────────────────────────────────────────────────────────
function SortPanel({ value, onChange, onClose }: { value: SortBy; onChange: (v: SortBy) => void; onClose: () => void }) {
  return (
    <div className="absolute right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border/60 bg-elevated shadow-lg shadow-black/20">
      {SORT_OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => { onChange(o.value as SortBy); onClose(); }}
          className={`flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-left hover:bg-muted/10 ${value === o.value ? 'text-brand font-medium' : 'text-primary'}`}
        >
          <span className="w-3.5">{value === o.value ? '✓' : ''}</span>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Options side panel ────────────────────────────────────────────────────────
function OptionsPanel({ zoom, sortBy, onZoomChange, onSortChange, onClose, asSheet = false }: {
  zoom: Zoom; sortBy: SortBy;
  onZoomChange: (z: Zoom) => void; onSortChange: (s: SortBy) => void; onClose: () => void;
  asSheet?: boolean;
}) {
  return (
    <div className={asSheet
      ? 'flex flex-col bg-elevated'
      : 'flex h-full w-[300px] shrink-0 flex-col border-l border-border/50 bg-elevated'}>
      <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
        <span className="text-[15px] font-semibold text-primary">Timeline</span>
        <button type="button" onClick={onClose} className="text-muted hover:text-primary">
          <CloseIcon />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
        {/* View name */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-surface text-lg">☺</div>
          <input type="text" defaultValue="Timeline" className="flex-1 rounded-lg border border-border/60 bg-surface px-3 py-1.5 text-[13px] text-primary focus:border-brand focus:outline-none" />
        </div>

        <button type="button" className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[13px] text-primary hover:bg-muted/10">
          <span className="flex items-center gap-2.5"><span aria-hidden>⌖</span> Layout options</span>
          <ChevronDown cls="h-3.5 w-3.5 -rotate-90 text-muted" />
        </button>
        <button type="button" className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[13px] text-primary hover:bg-muted/10">
          <span className="flex items-center gap-2.5"><span aria-hidden>⊟</span> Dependency settings</span>
          <ChevronDown cls="h-3.5 w-3.5 -rotate-90 text-muted" />
        </button>

        {/* Zoom — use existing Select component */}
        <div className="rounded-lg px-3 py-2">
          <Select
            label="Zoom"
            options={ZOOM_OPTIONS}
            value={zoom}
            onValueChange={(v) => onZoomChange(v as Zoom)}
            size="sm"
            fullWidth
          />
        </div>

        <div className="my-2 border-t border-border/30" />

        <button type="button" className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[13px] text-primary hover:bg-muted/10">
          <span className="flex items-center gap-2.5"><FilterIcon /> Filters</span>
          <ChevronDown cls="h-3.5 w-3.5 -rotate-90 text-muted" />
        </button>

        {/* Sort — use existing Select component */}
        <div className="rounded-lg px-3 py-2">
          <Select
            label="Sort"
            options={SORT_OPTIONS}
            value={sortBy}
            onValueChange={(v) => onSortChange(v as SortBy)}
            size="sm"
            fullWidth
          />
        </div>

        <div className="my-2 border-t border-border/30" />
        <button type="button" className="px-3 text-[12px] text-muted underline-offset-2 hover:text-primary hover:underline">Send feedback</button>
      </div>
    </div>
  );
}

// ── Toolbar button helper ─────────────────────────────────────────────────────
function TBtn({ active = false, onClick, children, label }: {
  active?: boolean; onClick: () => void; children: React.ReactNode; label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-medium transition-colors hover:bg-muted/10 hover:text-primary ${active ? 'bg-muted/10 text-primary' : 'text-secondary'}`}
    >
      {children}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function TaskGanttView() {
  const { t } = useTranslation();
  const { filteredTasks } = useTaskProject();

  const [zoom,         setZoom]         = useState<Zoom>('weeks');
  const [sortBy,       setSortBy]       = useState<SortBy>('none');
  const [ganttFilters, setGanttFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [filtersOpen,  setFiltersOpen]  = useState(false);
  const [sortOpen,     setSortOpen]     = useState(false);
  const [optionsOpen,  setOptionsOpen]  = useState(false);
  const [collapsed,    setCollapsed]    = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      // switch to months zoom on mobile for denser view
      if (e.matches) setZoom('months');
    };
    mq.addEventListener('change', handler);
    // apply on first mount if already mobile
    if (mq.matches) setZoom('months');
    return () => mq.removeEventListener('change', handler);
  }, []);

  const sidebarW = isMobile ? SIDEBAR_MOBILE : SIDEBAR;

  const closeDropdowns = useCallback(() => { setFiltersOpen(false); setSortOpen(false); }, []);

  const visible = useMemo(
    () => applyGanttFilters(filteredTasks.filter((x) => x.status !== 'void'), ganttFilters),
    [filteredTasks, ganttFilters],
  );

  const sections = useMemo<TimelineSection[]>(
    () => buildSections(visible, sortBy).map((s) => ({ ...s, collapsed: Boolean(collapsed[s.id]) })),
    [visible, sortBy, collapsed],
  );

  const flatTasks = useMemo(() => sections.flatMap((s) => s.collapsed ? [] : s.tasks), [sections]);

  const pxPerDay = zoomPxPerDay(zoom);

  const { totalDays, anchor, todayX, barMap } = useMemo(() => {
    const today = new Date(); today.setHours(12, 0, 0, 0);
    const tasks = visible;
    if (!tasks.length) return { totalDays: 30, anchor: today, todayX: 0, barMap: new Map<string, { x: number; w: number; overdue: boolean }>() };

    let minD = parseIso(tasks[0].start_date), maxD = parseIso(tasks[0].due_date);
    tasks.forEach((x) => { const s = parseIso(x.start_date), e = parseIso(x.due_date); if (s < minD) minD = s; if (e > maxD) maxD = e; });

    const pad = zoom === 'hours' ? 0 : zoom === 'days' ? 3 : zoom === 'weeks' ? 7 : 14;
    const a = new Date(minD); a.setDate(a.getDate() - pad); a.setHours(12, 0, 0, 0);
    const endD = new Date(maxD); endD.setDate(endD.getDate() + pad);
    const tDays = Math.max(14, daysBetween(a, endD) + 1);

    const bm = new Map<string, { x: number; w: number; overdue: boolean }>();
    for (const task of flatTasks) {
      const s = Math.max(0, daysBetween(a, parseIso(task.start_date)));
      const e = Math.min(tDays, daysBetween(a, parseIso(task.due_date)) + 1);
      bm.set(task.id, { x: s, w: Math.max(1, e - s), overdue: task.status !== 'done' && parseIso(task.due_date) < today });
    }
    return { totalDays: tDays, anchor: a, todayX: daysBetween(a, today), barMap: bm };
  }, [visible, flatTasks, zoom]);

  const svgMinW = isMobile ? Math.max(0, window.innerWidth - SIDEBAR_MOBILE - 2) : 400;
  const svgW = Math.max(svgMinW, Math.round(totalDays * pxPerDay));

  const headerUnits = useMemo(() => buildHeaderUnits(anchor, totalDays, zoom), [anchor, totalDays, zoom]);

  const monthGroups = useMemo(() => {
    const groups: Array<{ label: string; startDay: number; endDay: number }> = [];
    for (const u of headerUnits) {
      if (!groups.length || groups[groups.length - 1].label !== u.monthLabel)
        groups.push({ label: u.monthLabel, startDay: u.dayStart, endDay: u.dayEnd });
      else groups[groups.length - 1].endDay = u.dayEnd;
    }
    return groups;
  }, [headerUnits]);

  // Map each visible taskId → its SVG Y position for the bar
  const rowY = useMemo(() => {
    const m = new Map<string, number>();
    let y = HDR_H;
    for (const s of sections) {
      y += SEC_H;
      if (!s.collapsed) { for (const t of s.tasks) { m.set(t.id, y + (ROW_H - BAR_H) / 2); y += ROW_H; } }
    }
    return m;
  }, [sections]);

  const svgH = useMemo(() => {
    let h = HDR_H;
    for (const s of sections) { h += SEC_H; if (!s.collapsed) h += s.tasks.length * ROW_H; }
    return Math.max(h, 200);
  }, [sections]);

  const scrollToToday = useCallback(() => {
    scrollRef.current?.scrollTo({ left: Math.max(0, todayX * pxPerDay - 200), behavior: 'smooth' });
  }, [todayX, pxPerDay]);

  const zoomStep = useCallback((dir: 1 | -1) => {
    const idx = ZOOM_OPTIONS.findIndex((o) => o.value === zoom);
    const next = idx + dir;
    if (next >= 0 && next < ZOOM_OPTIONS.length) setZoom(ZOOM_OPTIONS[next].value as Zoom);
  }, [zoom]);

  const toggleSection = useCallback((id: string) => setCollapsed((p) => ({ ...p, [id]: !p[id] })), []);
  const activeFilterCount = Object.values(ganttFilters).filter(Boolean).length;
  const currentZoomLabel  = ZOOM_OPTIONS.find((o) => o.value === zoom)?.label ?? 'Weeks';

  if (!visible.length && !activeFilterCount) {
    return (
      <div className="flex min-h-[min(40vh,320px)] flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-surface">
        <EmptyState title={t('tasks.gantt.emptyTitle')} description={t('tasks.gantt.emptyDesc')} />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
      style={optionsOpen && !isMobile ? { display: 'grid', gridTemplateColumns: '1fr 300px' } : undefined}>

      {/* ── Main area ─────────────────────────────────────────────────────── */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">

        {/* ── Toolbar ───────────────────────────────────────────────────── */}
        <div className="relative shrink-0 border-b border-border/50 bg-elevated">
          {/* Single compact row — no wrapping */}
          <div className="flex items-center gap-1.5 overflow-x-auto px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

            {/* Add task */}
            <button type="button"
              className="flex shrink-0 items-center gap-1 rounded-lg border border-border/60 bg-surface px-2.5 py-1.5 text-[12px] font-medium text-primary hover:bg-muted/10">
              <PlusIcon /><span className="hidden xs:inline sm:inline">Add task</span>
              <ChevronDown cls="h-3 w-3 text-muted" />
            </button>

            {/* Prev / Today / Next */}
            <div className="flex shrink-0 items-center overflow-hidden rounded-lg border border-border/60 bg-surface">
              <button type="button"
                onClick={() => scrollRef.current && (scrollRef.current.scrollLeft -= svgW * 0.3)}
                aria-label="Previous"
                className="flex h-7 w-7 items-center justify-center border-r border-border/40 text-muted hover:bg-muted/10 hover:text-primary">
                <ChevronDown cls="h-3.5 w-3.5 rotate-90" />
              </button>
              <button type="button" onClick={scrollToToday}
                className="px-2.5 py-1 text-[12px] font-medium text-secondary hover:bg-muted/10 hover:text-primary">
                Today
              </button>
              <button type="button"
                onClick={() => scrollRef.current && (scrollRef.current.scrollLeft += svgW * 0.3)}
                aria-label="Next"
                className="flex h-7 w-7 items-center justify-center border-l border-border/40 text-muted hover:bg-muted/10 hover:text-primary">
                <ChevronDown cls="h-3.5 w-3.5 -rotate-90" />
              </button>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Zoom –/label/+ */}
            <div className="flex shrink-0 items-center gap-0.5">
              <button type="button" onClick={() => zoomStep(1)} aria-label="Zoom out"
                className="flex h-7 w-7 items-center justify-center rounded-l-lg border border-border/60 bg-surface text-muted hover:bg-muted/10 hover:text-primary">
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
                  <path d="M2.75 8a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9A.75.75 0 0 1 2.75 8z" />
                </svg>
              </button>
              <button type="button"
                onClick={() => { setOptionsOpen((v) => !v); closeDropdowns(); }}
                className="border-y border-border/60 bg-surface px-2 py-1 text-[11px] font-semibold text-secondary hover:bg-muted/10 hover:text-primary"
                style={{ minWidth: 48, textAlign: 'center' }}>
                {currentZoomLabel}
              </button>
              <button type="button" onClick={() => zoomStep(-1)} aria-label="Zoom in"
                className="flex h-7 w-7 items-center justify-center rounded-r-lg border border-border/60 bg-surface text-muted hover:bg-muted/10 hover:text-primary">
                <PlusIcon />
              </button>
            </div>

            <div className="h-5 w-px shrink-0 bg-border/40" />

            {/* Filter */}
            <TBtn active={filtersOpen || activeFilterCount > 0}
              onClick={() => { setFiltersOpen((v) => !v); setSortOpen(false); setOptionsOpen(false); }}>
              <FilterIcon />
              <span className="hidden sm:inline">Filter</span>
              {activeFilterCount > 0 && (
                <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}
            </TBtn>

            {/* Sort */}
            <TBtn active={sortOpen || sortBy !== 'none'}
              onClick={() => { setSortOpen((v) => !v); setFiltersOpen(false); setOptionsOpen(false); }}>
              <SortIcon />
              <span className="hidden sm:inline">Sort{sortBy !== 'none' ? ': 1' : ''}</span>
            </TBtn>

            {/* Options */}
            <TBtn active={optionsOpen} onClick={() => { setOptionsOpen((v) => !v); closeDropdowns(); }}>
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
                <path d="M8 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM1.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm13 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
              </svg>
              <span className="hidden sm:inline">Options</span>
            </TBtn>
          </div>

          {/* Floating panels */}
          {filtersOpen && (
            <FilterPanel filters={ganttFilters} onChange={(f) => setGanttFilters(f)} onClose={() => setFiltersOpen(false)} />
          )}
          {sortOpen && (
            <SortPanel value={sortBy} onChange={setSortBy} onClose={() => setSortOpen(false)} />
          )}
        </div>

        {/* ── Scroll container ─────────────────────────────────────────── */}
        <div className="relative min-h-0 flex-1" role="region" aria-label={t('tasks.scheduleTitle')}>
          <div ref={scrollRef} className="h-full min-h-[min(280px,55vh)] overflow-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <div className="inline-flex min-w-min flex-row items-stretch">

              {/* ── Sticky sidebar ─────────────────────────────────────── */}
              <div className="sticky start-0 z-30 shrink-0 border-e border-border bg-surface shadow-[4px_0_16px_-6px_rgba(0,0,0,0.18)] dark:shadow-[4px_0_16px_-6px_rgba(0,0,0,0.5)]"
                style={{ width: sidebarW }}>

                {/* ── Header spacer — matches SVG header height ── */}
                <div className="sticky top-0 z-10 flex items-end border-b border-border bg-elevated pb-2"
                  style={{ height: HDR_H, paddingLeft: isMobile ? 8 : 12 }}>
                  {!isMobile && (
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Task name</span>
                  )}
                </div>

                {/* ── Sections ── */}
                {sections.map((sec) => {
                  const accent = sectionAccentColor(sec.id);
                  return (
                    <div key={sec.id}>
                      {/* Section header row */}
                      <div
                        className="flex cursor-pointer items-center border-b border-border/50 bg-bg hover:bg-muted/[0.05]"
                        style={{ height: SEC_H, borderLeft: `3px solid ${accent.dot}`, gap: isMobile ? 4 : 6, paddingLeft: isMobile ? 4 : 8, paddingRight: isMobile ? 4 : 8 }}
                        onClick={() => toggleSection(sec.id)}
                        role="button" tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && toggleSection(sec.id)}
                        aria-expanded={!sec.collapsed}
                      >
                        <ChevronDown cls={`h-3 w-3 shrink-0 text-muted transition-transform duration-150 ${sec.collapsed ? '-rotate-90' : ''}`} />
                        {isMobile ? (
                          /* Mobile: colored dot + count only */
                          <>
                            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: accent.dot }} />
                            <span className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
                              style={{ background: `${accent.dot}22`, color: accent.dot }}>
                              {sec.tasks.length}
                            </span>
                          </>
                        ) : (
                          /* Desktop: label + count */
                          <>
                            <span className="min-w-0 truncate text-[13px] font-bold text-primary tracking-tight">{sec.label}</span>
                            <span className="ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
                              style={{ background: `${accent.dot}22`, color: accent.dot }}>
                              {sec.tasks.length}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Task rows */}
                      {!sec.collapsed && sec.tasks.map((task) => (
                        <div key={task.id}
                          className="flex items-center border-b border-border/25 hover:bg-muted/[0.04]"
                          style={{ minHeight: ROW_H, gap: isMobile ? 4 : 8, paddingLeft: isMobile ? 4 : 12, paddingRight: isMobile ? 4 : 8 }}>
                          {isMobile ? (
                            /* Mobile: short number only (e.g. "042") centered in the narrow column */
                            <span className="w-full truncate text-center font-mono text-[9px] text-muted">
                              {task.display_number.replace(/^T-0*/, '')}
                            </span>
                          ) : (
                            /* Desktop: number + title + assignee */
                            <>
                              <span className="shrink-0 font-mono text-[10px] text-muted">{task.display_number}</span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[12px] font-medium leading-snug text-primary">{task.title}</p>
                                <p className="truncate text-[11px] text-muted">{demoPrimaryAssigneeName(task)}</p>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}

                {/* Add section — desktop only */}
                {!isMobile && (
                  <div className="border-t border-border/30 py-2">
                    <button type="button" className="flex items-center gap-1.5 px-3 text-[12px] text-muted hover:text-secondary">
                      <PlusIcon /><span>Add section</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ── SVG canvas ─────────────────────────────────────────── */}
              <div className="relative z-0 min-w-0">
                <svg width={svgW} height={svgH} className="block select-none" role="img" aria-label={t('tasks.gantt.chartAria')}>

                  {/* ── Background fill for full chart ── */}
                  <rect x={0} y={0} width={svgW} height={svgH} fill="hsl(var(--surface))" />

                  {/* ── Month header row ── */}
                  <rect x={0} y={0} width={svgW} height={HDR_TOP} fill="hsl(var(--elevated))" />
                  {monthGroups.map((g, i) => (
                    <g key={i}>
                      {i > 0 && (
                        <line x1={g.startDay * pxPerDay} y1={0} x2={g.startDay * pxPerDay} y2={HDR_TOP}
                          stroke="hsl(var(--border))" strokeOpacity={0.5} strokeWidth={1} />
                      )}
                      <text x={g.startDay * pxPerDay + 10} y={HDR_TOP / 2 + 4}
                        fill="hsl(var(--text-secondary))" fontSize={11} fontWeight={700} fontFamily="system-ui,sans-serif">
                        {g.label}
                      </text>
                    </g>
                  ))}

                  {/* ── Unit header row ── */}
                  <rect x={0} y={HDR_TOP} width={svgW} height={HDR_BOT} fill="hsl(var(--elevated))" />
                  <line x1={0} y1={HDR_H} x2={svgW} y2={HDR_H} stroke="hsl(var(--border))" strokeOpacity={0.7} strokeWidth={1} />
                  {headerUnits.map((u, i) => {
                    const x  = u.dayStart * pxPerDay;
                    const uw = (u.dayEnd - u.dayStart) * pxPerDay;
                    return (
                      <g key={i}>
                        <line x1={x} y1={HDR_TOP} x2={x} y2={svgH}
                          stroke="hsl(var(--border))" strokeOpacity={0.25} strokeWidth={0.75} />
                        {uw > 32 && (
                          <text x={x + uw / 2} y={HDR_TOP + HDR_BOT / 2 + 4} textAnchor="middle"
                            fill="hsl(var(--text-muted))" fontSize={10} fontFamily="system-ui,sans-serif">
                            {u.label}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* ── Section & row bands ── */}
                  {(() => {
                    const els: React.ReactNode[] = [];
                    let y = HDR_H;
                    for (const sec of sections) {
                      const accent = sectionAccentColor(sec.id);
                      els.push(
                        <rect key={`sb-${sec.id}`} x={0} y={y} width={svgW} height={SEC_H} fill="hsl(var(--bg))" />,
                        // thin left accent stripe on section row
                        <rect key={`sa-${sec.id}`} x={0} y={y} width={3} height={SEC_H} fill={accent.dot} opacity={0.7} />,
                        <line key={`sl-${sec.id}`} x1={0} y1={y + SEC_H} x2={svgW} y2={y + SEC_H}
                          stroke="hsl(var(--border))" strokeOpacity={0.5} strokeWidth={0.75} />,
                      );
                      y += SEC_H;
                      if (!sec.collapsed) {
                        sec.tasks.forEach((task, ti) => {
                          els.push(
                            <rect key={`rb-${task.id}`} x={0} y={y} width={svgW} height={ROW_H}
                              fill={ti % 2 === 0 ? 'hsl(var(--surface))' : 'hsl(var(--elevated))'} opacity={0.6} />,
                            <line key={`rl-${task.id}`} x1={0} y1={y + ROW_H} x2={svgW} y2={y + ROW_H}
                              stroke="hsl(var(--border))" strokeOpacity={0.18} strokeWidth={0.5} />,
                          );
                          y += ROW_H;
                        });
                      }
                    }
                    return els;
                  })()}

                  {/* ── Today column highlight ── */}
                  {todayX >= 0 && todayX < totalDays && (
                    <rect x={todayX * pxPerDay - 1} y={HDR_H} width={3} height={svgH - HDR_H}
                      fill="rgba(239,68,68,0.07)" />
                  )}

                  {/* ── Today line ── */}
                  {todayX >= 0 && todayX < totalDays && (
                    <g>
                      <line x1={todayX * pxPerDay} y1={0} x2={todayX * pxPerDay} y2={svgH}
                        stroke="rgba(239,68,68,0.75)" strokeDasharray="3 3" strokeWidth={1.5} />
                      <rect x={todayX * pxPerDay - 20} y={4} width={40} height={18} rx={5}
                        fill="rgba(239,68,68,0.92)" />
                      <text x={todayX * pxPerDay} y={17} textAnchor="middle"
                        fill="white" fontSize={9.5} fontWeight={700} fontFamily="system-ui,sans-serif">
                        Today
                      </text>
                    </g>
                  )}

                  {/* ── Task bars ── */}
                  {flatTasks.map((task) => {
                    const bar  = barMap.get(task.id);
                    const barY = rowY.get(task.id);
                    if (!bar || barY === undefined) return null;
                    const bx     = bar.x * pxPerDay + 3;
                    const bw     = Math.max(8, bar.w * pxPerDay - 6);
                    const fill   = ganttBarFill(task.status);
                    const stroke = bar.overdue ? GANTT_OVERDUE_STROKE : undefined;
                    const progW  = Math.max(6, bw * (task.progress / 100));

                    return (
                      <g key={task.id} className="cursor-pointer group">
                        {/* bar shadow */}
                        <rect x={bx + 1} y={barY + 2} width={bw} height={BAR_H} rx={5}
                          fill="rgba(0,0,0,0.18)" />
                        {/* main bar */}
                        <rect x={bx} y={barY} width={bw} height={BAR_H} rx={5}
                          fill={fill}
                          stroke={stroke} strokeWidth={stroke ? 1.5 : 0}
                        />
                        {/* progress fill overlay */}
                        {task.progress > 0 && (
                          <rect x={bx} y={barY} width={progW} height={BAR_H} rx={5}
                            fill="rgba(255,255,255,0.15)" />
                        )}
                        {/* progress bottom stripe */}
                        {task.progress > 0 && (
                          <rect x={bx + 2} y={barY + BAR_H - 5} width={Math.max(4, progW - 4)} height={3} rx={1.5}
                            fill="rgba(255,255,255,0.45)" />
                        )}
                        {/* progress % label */}
                        {bw > 44 && (
                          <text x={bx + bw / 2} y={barY + BAR_H / 2 + 4} textAnchor="middle"
                            fill="rgba(255,255,255,0.95)" fontSize={10} fontWeight={700} fontFamily="system-ui,sans-serif">
                            {task.progress}%
                          </text>
                        )}
                        <title>{`${task.display_number} — ${task.title}\n${demoPrimaryAssigneeName(task)}\n${task.start_date.slice(0, 10)} → ${task.due_date.slice(0, 10)}`}</title>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Options panel — side panel on desktop, bottom sheet on mobile ─── */}
      {optionsOpen && isMobile && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOptionsOpen(false)} />
          <div className="relative z-10 rounded-t-2xl border-t border-border bg-elevated shadow-2xl">
            <div className="mx-auto mt-2 mb-3 h-1 w-10 rounded-full bg-border/60" />
            <OptionsPanel asSheet zoom={zoom} sortBy={sortBy} onZoomChange={setZoom} onSortChange={setSortBy} onClose={() => setOptionsOpen(false)} />
          </div>
        </div>
      )}
      {optionsOpen && !isMobile && (
        <OptionsPanel zoom={zoom} sortBy={sortBy} onZoomChange={setZoom} onSortChange={setSortBy} onClose={() => setOptionsOpen(false)} />
      )}
    </div>
  );
}
