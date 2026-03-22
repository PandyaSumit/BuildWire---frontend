/**
 * BuildWire task domain model (construction PM — aligns with REST `/projects/:id/tasks`).
 * UI maps enums to i18n; API payloads use the same string unions.
 */

export type TaskId = string;

export type TaskStatus =
  | 'open'
  | 'in_progress'
  | 'in_review'
  | 'blocked'
  | 'awaiting_inspection'
  | 'done'
  | 'void';

export type TaskPriorityKey = 'critical' | 'high' | 'medium' | 'low';

export type TaskTypeKey =
  | 'general'
  | 'safety'
  | 'quality'
  | 'punch_list'
  | 'rfi_action'
  | 'inspection_action';

export type TaskTradeKey =
  | 'civil'
  | 'mep'
  | 'finishing'
  | 'waterproofing'
  | 'safety'
  | 'structural'
  | 'electrical'
  | 'plumbing'
  | 'qc'
  | 'management';

export interface TaskPhoto {
  id: string;
  url: string;
  thumbnail_url?: string;
  caption?: string;
  uploaded_at: string;
  uploaded_by: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size_bytes: number;
  mime_type: string;
  uploaded_at: string;
  uploaded_by: string;
  url?: string;
}

export interface TaskSheetPin {
  drawing_id: string;
  x: number;
  y: number;
}

/** Canonical task record */
export interface BuildWireTask {
  id: TaskId;
  /** Human-readable id shown in UI, e.g. T-042 */
  display_number: string;
  title: string;
  description: string;
  type: TaskTypeKey;
  priority: TaskPriorityKey;
  trade: TaskTradeKey;
  category: string;
  floor: string;
  location_detail: string;
  sheet_pin: TaskSheetPin | null;
  status: TaskStatus;
  blocked_reason: string;
  is_private: boolean;
  assignees: string[];
  created_by: string;
  watchers: string[];
  due_date: string;
  start_date: string;
  created_at: string;
  updated_at: string;
  related_rfis: string[];
  related_drawings: string[];
  related_files: string[];
  related_inspections: string[];
  parent_task_id: string | null;
  photos: TaskPhoto[];
  attachments: TaskAttachment[];
  root_cause: string;
  root_cause_category: string;
  custom_fields: Record<string, string | number | boolean>;
  tags: string[];
  /** Predecessors for schedule (finish-to-start) */
  depends_on: string[];
  comments_count: number;
  /** 0–100 list / header progress */
  progress: number;
  pinned?: boolean;
  is_milestone?: boolean;
}

export type TaskListFilters = {
  types: TaskTypeKey[];
  priorities: TaskPriorityKey[];
  assigneeIds: string[];
  trades: TaskTradeKey[];
  floors: string[];
};

export const EMPTY_TASK_FILTERS: TaskListFilters = {
  types: [],
  priorities: [],
  assigneeIds: [],
  trades: [],
  floors: [],
};
