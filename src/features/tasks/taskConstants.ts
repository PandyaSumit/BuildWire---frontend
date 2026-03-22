import type { TaskStatus, TaskTradeKey, TaskTypeKey } from '@/types/task';

/** Kanban columns (void tasks hidden from board — shown in list filter) */
export const KANBAN_STATUSES: TaskStatus[] = [
  'open',
  'in_progress',
  'in_review',
  'blocked',
  'awaiting_inspection',
  'done',
];

export const ALL_TASK_TYPE_KEYS: TaskTypeKey[] = [
  'general',
  'safety',
  'quality',
  'punch_list',
  'rfi_action',
  'inspection_action',
];

export const ALL_TRADE_KEYS: TaskTradeKey[] = [
  'civil',
  'mep',
  'finishing',
  'waterproofing',
  'safety',
  'structural',
  'electrical',
  'plumbing',
  'qc',
  'management',
];

/** WIP limit per column (amber badge when count >= limit) */
export const KANBAN_WIP_LIMIT: Partial<Record<TaskStatus, number>> = {
  in_progress: 8,
  in_review: 6,
  blocked: 10,
};

export const FLOOR_OPTIONS = [
  'Basement',
  'L1',
  'L2',
  'L3',
  'L4',
  'L5',
  'L6',
  'L7',
  'L8',
  'L9',
  'L10',
  'L11',
  'L12',
  'Podium',
  'Roof',
  'Ext.',
] as const;
