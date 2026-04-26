import type { TaskStatus } from '@/types/task';

/** @deprecated Prefer `TaskStatus` from `@/types/task` */
export type TaskColumn = TaskStatus;

export type TaskType = 'General' | 'Punch List' | 'Safety' | 'Quality' | 'RFI Action' | 'Inspection Item';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type UiTask = {
  id: string;
  number: string;
  title: string;
  type: TaskType;
  status: TaskColumn;
  priority: TaskPriority;
  assignee: string;
  due: string;
  overdue?: boolean;
  photos: number;
  comments: number;
  pinned?: boolean;
  trade: string;
  floor: string;
  createdRelative: string;
  /** 0–100 for list progress column */
  progress?: number;
  /** ISO date (YYYY-MM-DD) for formatted Created column */
  createdAt?: string;
};

export const TASK_COLUMNS: { id: TaskColumn }[] = [
  { id: 'open' },
  { id: 'in_progress' },
  { id: 'in_review' },
  { id: 'blocked' },
  { id: 'awaiting_inspection' },
  { id: 'done' },
];

/** All task types for forms and filters */
export const ALL_TASK_TYPES: TaskType[] = [
  'General',
  'Punch List',
  'Safety',
  'Quality',
  'RFI Action',
  'Inspection Item',
];

const TASK_TYPE_I18N: Record<TaskType, string> = {
  General: 'general',
  'Punch List': 'punchList',
  Safety: 'safety',
  Quality: 'quality',
  'RFI Action': 'rfiAction',
  'Inspection Item': 'inspectionItem',
};

export function taskTypeTKey(type: TaskType): string {
  return `tasks.type.${TASK_TYPE_I18N[type]}`;
}

export function taskWorkflowTKey(status: TaskStatus): string {
  return `tasks.status.${status}`;
}

export function taskPriorityTKey(p: TaskPriority): string {
  return `tasks.priority.${p}`;
}

const TRADE_I18N: Record<string, string> = {
  Waterproofing: 'waterproofing',
  MEP: 'mep',
  Safety: 'safety',
  Civil: 'civil',
  Finishing: 'finishing',
  Structural: 'structural',
  'Site Eng.': 'siteEng',
  QC: 'qc',
  'MEP Lead': 'mepLead',
  'QC Lead': 'qcLead',
  'Safety Off.': 'safetyOff',
};

export function translateTaskTrade(trade: string, t: (key: string) => string): string {
  const slug = TRADE_I18N[trade];
  return slug ? t(`tasks.trade.${slug}`) : trade;
}

/** Demo assignees for the new-task form */
export const DEMO_ASSIGNEES = [
  'Raj Kumar',
  'Priya Shah',
  'Amit Verma',
  'Neha K',
  'QC',
  'Site Eng.',
  'Safety Off.',
  'MEP Lead',
  'QC Lead',
] as const;

/** Trades shown in the new-task dropdown (covers mock data + common picks) */
export const DEMO_TRADES = [
  'Waterproofing',
  'MEP',
  'Safety',
  'Civil',
  'Finishing',
  'Structural',
  'QC',
  'Site Eng.',
  'MEP Lead',
  'QC Lead',
  'Safety Off.',
] as const;

export function nextTaskNumber(tasks: Pick<UiTask, 'number'>[]): string {
  let max = 0;
  for (const x of tasks) {
    const m = /^T-(\d+)$/i.exec(x.number.trim());
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `T-${String(max + 1).padStart(3, '0')}`;
}

export const MOCK_TASKS: UiTask[] = [
  {
    id: '1',
    number: 'T-042',
    title: 'Waterproofing touch-up at core wall',
    type: 'Quality',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Raj Kumar',
    due: '2026-05-08',
    photos: 3,
    comments: 2,
    pinned: true,
    trade: 'Waterproofing',
    floor: 'L3',
    createdRelative: '2d ago',
    createdAt: '2026-04-14',
  },
  {
    id: '2',
    number: 'T-041',
    title: 'MEP sleeve verification — Grid C',
    type: 'General',
    status: 'open',
    priority: 'medium',
    assignee: 'Priya Shah',
    due: '2026-05-15',
    photos: 0,
    comments: 1,
    trade: 'MEP',
    floor: 'L2',
    createdRelative: '3d ago',
    createdAt: '2026-04-20',
  },
  {
    id: '2b',
    number: 'T-040',
    title: 'Scaffold tag inspection — North face',
    type: 'Safety',
    status: 'open',
    priority: 'low',
    assignee: 'Safety Off.',
    due: '2026-05-22',
    photos: 1,
    comments: 0,
    trade: 'Safety',
    floor: 'Ext.',
    createdRelative: '5d ago',
    createdAt: '2026-04-18',
  },
  {
    id: '3',
    number: 'T-038',
    title: 'Safety: re-bar projection barricade',
    type: 'Safety',
    status: 'blocked',
    priority: 'critical',
    assignee: 'Amit Verma',
    due: '2026-04-21',
    overdue: true,
    photos: 6,
    comments: 8,
    trade: 'Civil',
    floor: 'L1',
    createdRelative: '1w ago',
    createdAt: '2026-04-08',
  },
  {
    id: '3b',
    number: 'T-037',
    title: 'Blocked: concrete pour delayed (weather)',
    type: 'General',
    status: 'blocked',
    priority: 'high',
    assignee: 'Site Eng.',
    due: '2026-04-19',
    overdue: true,
    photos: 0,
    comments: 4,
    trade: 'Civil',
    floor: 'Podium',
    createdRelative: '4d ago',
    createdAt: '2026-04-05',
  },
  {
    id: '4',
    number: 'T-035',
    title: 'Punch: ceiling paint at 12A',
    type: 'Punch List',
    status: 'in_review',
    priority: 'low',
    assignee: 'Neha K',
    due: '2026-04-30',
    photos: 1,
    comments: 0,
    trade: 'Finishing',
    floor: 'L12',
    createdRelative: '6d ago',
    createdAt: '2026-04-16',
  },
  {
    id: '4b',
    number: 'T-034',
    title: 'QC photos for tiling — Unit 1102',
    type: 'Quality',
    status: 'in_review',
    priority: 'medium',
    assignee: 'QC',
    due: '2026-04-28',
    photos: 8,
    comments: 2,
    trade: 'Finishing',
    floor: 'L11',
    createdRelative: '1d ago',
    createdAt: '2026-04-21',
  },
  {
    id: '5',
    number: 'T-029',
    title: 'RFI-014 corrective: door frame tolerance',
    type: 'RFI Action',
    status: 'awaiting_inspection',
    priority: 'high',
    assignee: 'Site Eng.',
    due: '2026-05-02',
    photos: 2,
    comments: 3,
    pinned: true,
    trade: 'Finishing',
    floor: 'L12',
    createdRelative: '4d ago',
    createdAt: '2026-04-17',
  },
  {
    id: '5b',
    number: 'T-028',
    title: 'Fire stopping — electrical penetrations L9',
    type: 'Inspection Item',
    status: 'awaiting_inspection',
    priority: 'medium',
    assignee: 'MEP Lead',
    due: '2026-05-06',
    photos: 0,
    comments: 1,
    trade: 'MEP',
    floor: 'L9',
    createdRelative: '3d ago',
    createdAt: '2026-04-19',
  },
  {
    id: '6',
    number: 'T-020',
    title: 'Inspection: waterproofing — Floor 3',
    type: 'Inspection Item',
    status: 'done',
    priority: 'medium',
    assignee: 'QC Lead',
    due: '2026-04-15',
    photos: 4,
    comments: 5,
    trade: 'Waterproofing',
    floor: 'L3',
    createdRelative: '2w ago',
    createdAt: '2026-03-28',
  },
  {
    id: '6b',
    number: 'T-015',
    title: 'Handrail height verification — L5',
    type: 'Safety',
    status: 'done',
    priority: 'low',
    assignee: 'Amit Verma',
    due: '2026-04-10',
    photos: 2,
    comments: 1,
    trade: 'Finishing',
    floor: 'L5',
    createdRelative: '2w ago',
    createdAt: '2026-03-24',
  },
  {
    id: '6c',
    number: 'T-010',
    title: 'Shoring removal sign-off',
    type: 'General',
    status: 'done',
    priority: 'high',
    assignee: 'Raj Kumar',
    due: '2026-04-05',
    photos: 0,
    comments: 3,
    trade: 'Structural',
    floor: 'L2',
    createdRelative: '3w ago',
    createdAt: '2026-03-18',
  },
];

/** Deterministic table fields for demo list (progress ring + created date). */
export function enrichTaskForListTable(t: UiTask, index: number): UiTask {
  const progress =
    t.progress ??
    (Math.min(95, (t.id.charCodeAt(0) * 17 + index * 23) % 96) || 40);
  const createdAt =
    t.createdAt ??
    `2025-${String((index % 9) + 1).padStart(2, '0')}-${String((index % 26) + 1).padStart(2, '0')}`;
  return { ...t, progress, createdAt };
}

const priorityBorder: Record<TaskPriority, string> = {
  low: 'border-l-4 border-border',
  medium: 'border-l-4 border-blue-500',
  high: 'border-l-4 border-amber-500',
  critical: 'border-l-4 border-red-500',
};

export function priorityBorderClass(p: TaskPriority): string {
  return priorityBorder[p] ?? 'border-l-4 border-border';
}

const typeColor: Record<TaskType, string> = {
  General: 'bg-muted/30 text-secondary',
  'Punch List': 'bg-brand/10 text-primary',
  Safety: 'bg-danger/15 text-danger',
  Quality: 'bg-success/15 text-success',
  'RFI Action': 'bg-warning/15 text-warning',
  'Inspection Item': 'bg-brand/15 text-primary',
};

export function typeBadgeClass(t: TaskType): string {
  return typeColor[t] ?? 'bg-muted/30';
}

/** @deprecated Use i18n `t(taskWorkflowTKey(status))` in UI */
export function taskStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    in_review: 'In Review',
    blocked: 'Blocked',
    awaiting_inspection: 'Awaiting Inspection',
    done: 'Done',
    void: 'Void',
  };
  return labels[status];
}

/**
 * Type cell: dark pill, colored text + subtle border (list table — matches project tasks reference).
 */
export function taskTableTypePillClass(t: TaskType): string {
  const map: Record<TaskType, string> = {
    General:
      'border-border/70 bg-muted/20 text-secondary dark:bg-muted/15',
    'Punch List':
      'border-violet-500/30 bg-violet-500/[0.12] text-violet-700 dark:text-violet-300',
    Safety:
      'border-danger/35 bg-danger/10 text-danger',
    Quality:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    'RFI Action':
      'border-amber-500/35 bg-amber-500/10 text-amber-800 dark:text-amber-400',
    'Inspection Item':
      'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  };
  return map[t] ?? 'border-border bg-muted/20 text-secondary';
}

/** Priority as plain colored text (no badge), per tasks list reference */
export function taskTablePriorityClass(p: TaskPriority): string {
  const map: Record<TaskPriority, string> = {
    critical: 'font-medium text-amber-600 dark:text-amber-400',
    high: 'font-medium text-sky-600 dark:text-sky-400',
    medium: 'text-primary',
    low: 'text-primary',
  };
  return map[p];
}

/** Soft priority pills (list view — works in light and dark). */
export function taskTablePriorityPillClass(p: TaskPriority): string {
  const map: Record<TaskPriority, string> = {
    critical:
      'border-red-500/35 bg-red-500/10 text-red-700 dark:text-red-400',
    high: 'border-amber-500/35 bg-amber-500/10 text-amber-800 dark:text-amber-400',
    medium:
      'border-violet-500/35 bg-violet-500/10 text-violet-800 dark:text-violet-300',
    low: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400',
  };
  return map[p];
}
