import type { BuildWireTask, TaskPriorityKey, TaskStatus, TaskTradeKey, TaskTypeKey } from '@/types/task';

export type NewTaskFormValues = {
  title: string;
  description: string;
  type: TaskTypeKey;
  priority: TaskPriorityKey;
  trade: TaskTradeKey;
  floor: string;
  location_detail: string;
  assignees: string[];
  watchers: string[];
  start_date: string;
  due_date: string;
  is_private: boolean;
  tags: string[];
  blocked_reason: string;
  parent_task_id: string | null;
  status: TaskStatus;
};

export function createBuildWireTask(
  displayNumber: string,
  values: NewTaskFormValues,
  createdBy: string
): BuildWireTask {
  const now = new Date().toISOString();
  return {
    id: `task_${crypto.randomUUID()}`,
    display_number: displayNumber,
    title: values.title.trim(),
    description: values.description.trim(),
    type: values.type,
    priority: values.priority,
    trade: values.trade,
    category: '',
    floor: values.floor,
    location_detail: values.location_detail.trim(),
    sheet_pin: null,
    status: values.status,
    blocked_reason: values.status === 'blocked' ? values.blocked_reason.trim() : '',
    is_private: values.is_private,
    assignees: [...values.assignees],
    created_by: createdBy,
    watchers: [...values.watchers],
    due_date: values.due_date,
    start_date: values.start_date,
    created_at: now,
    updated_at: now,
    related_rfis: [],
    related_drawings: [],
    related_files: [],
    related_inspections: [],
    parent_task_id: values.parent_task_id,
    photos: [],
    attachments: [],
    root_cause: '',
    root_cause_category: '',
    custom_fields: {},
    tags: [...values.tags],
    depends_on: [],
    comments_count: 0,
    progress: 0,
    pinned: false,
    is_milestone: false,
  };
}
