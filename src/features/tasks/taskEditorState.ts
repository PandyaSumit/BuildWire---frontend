import type { BuildWireTask, TaskPriorityKey, TaskStatus, TaskTradeKey, TaskTypeKey } from '@/types/task';
import type { NewTaskFormValues } from '@/features/tasks/taskFactory';
import { FLOOR_OPTIONS } from '@/features/tasks/taskConstants';
import { DEMO_USERS } from '@/features/tasks/demoUsers';

/** Shared form state for create + edit task drawer */
export type TaskEditorDraft = {
  templateId: string;
  title: string;
  description: string;
  type: TaskTypeKey;
  status: TaskStatus;
  priority: TaskPriorityKey;
  trade: TaskTradeKey;
  floor: string;
  location_detail: string;
  assignees: string[];
  watchers: string[];
  start_date: string;
  due_date: string;
  is_private: boolean;
  tagsRaw: string;
  blocked_reason: string;
  parent_task_id: string;
  root_cause: string;
  advancedOpen: boolean;
};

export function defaultDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export function defaultStartDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function emptyTaskDraft(): TaskEditorDraft {
  return {
    templateId: '',
    title: '',
    description: '',
    type: 'general',
    status: 'open',
    priority: 'medium',
    trade: 'civil',
    floor: FLOOR_OPTIONS[2],
    location_detail: '',
    assignees: [DEMO_USERS[0].id],
    watchers: [],
    start_date: defaultStartDate(),
    due_date: defaultDueDate(),
    is_private: false,
    tagsRaw: '',
    blocked_reason: '',
    parent_task_id: '',
    root_cause: '',
    advancedOpen: false,
  };
}

export function taskToDraft(task: BuildWireTask): TaskEditorDraft {
  return {
    templateId: '',
    title: task.title,
    description: task.description,
    type: task.type,
    status: task.status,
    priority: task.priority,
    trade: task.trade,
    floor: task.floor,
    location_detail: task.location_detail,
    assignees: task.assignees.length ? [...task.assignees] : [DEMO_USERS[0].id],
    watchers: [...task.watchers],
    start_date: task.start_date.slice(0, 10),
    due_date: task.due_date.slice(0, 10),
    is_private: task.is_private,
    tagsRaw: task.tags.join(', '),
    blocked_reason: task.blocked_reason,
    parent_task_id: task.parent_task_id ?? '',
    root_cause: task.root_cause,
    advancedOpen: false,
  };
}

export function draftToNewTaskValues(d: TaskEditorDraft): NewTaskFormValues {
  return {
    title: d.title,
    description: d.description,
    type: d.type,
    priority: d.priority,
    trade: d.trade,
    floor: d.floor,
    location_detail: d.location_detail,
    assignees: d.assignees,
    watchers: d.watchers,
    start_date: d.start_date,
    due_date: d.due_date,
    is_private: d.is_private,
    tags: d.tagsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    blocked_reason: d.blocked_reason,
    parent_task_id: d.parent_task_id.trim() || null,
    status: d.status,
  };
}

export function draftToPatch(d: TaskEditorDraft): Partial<BuildWireTask> {
  const now = new Date().toISOString();
  return {
    title: d.title.trim(),
    description: d.description,
    type: d.type,
    status: d.status,
    priority: d.priority,
    trade: d.trade,
    floor: d.floor,
    location_detail: d.location_detail.trim(),
    assignees: [...d.assignees],
    watchers: [...d.watchers],
    start_date: d.start_date,
    due_date: d.due_date,
    is_private: d.is_private,
    tags: d.tagsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    blocked_reason: d.status === 'blocked' ? d.blocked_reason.trim() : '',
    parent_task_id: d.parent_task_id.trim() || null,
    root_cause: d.root_cause.trim(),
    updated_at: now,
  };
}
