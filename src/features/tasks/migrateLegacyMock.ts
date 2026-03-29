import type { BuildWireTask, TaskPriorityKey, TaskStatus, TaskTradeKey, TaskTypeKey } from '@/types/task';
import { MOCK_TASKS, type UiTask } from '@/features/tasks/fixtures';
import { demoUserIdFromName } from '@/features/tasks/demoUsers';

function mapType(t: UiTask['type']): TaskTypeKey {
  switch (t.type) {
    case 'General':
      return 'general';
    case 'Safety':
      return 'safety';
    case 'Quality':
      return 'quality';
    case 'Punch List':
      return 'punch_list';
    case 'RFI Action':
      return 'rfi_action';
    case 'Inspection Item':
      return 'inspection_action';
    default:
      return 'general';
  }
}

function mapStatus(s: UiTask['status']): TaskStatus {
  return s === 'completed' ? 'done' : s;
}

function mapTrade(raw: string): TaskTradeKey {
  const k = raw.trim().toLowerCase();
  const table: Record<string, TaskTradeKey> = {
    waterproofing: 'waterproofing',
    mep: 'mep',
    safety: 'safety',
    civil: 'civil',
    finishing: 'finishing',
    structural: 'structural',
    qc: 'qc',
    'site eng.': 'management',
    'mep lead': 'mep',
    'qc lead': 'qc',
    'safety off.': 'safety',
  };
  return table[k] ?? 'management';
}

function isoFromDue(due: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(due)) return due;
  return new Date().toISOString().slice(0, 10);
}

export function buildWireTaskFromUi(u: UiTask, index: number): BuildWireTask {
  const now = new Date().toISOString();
  const due = isoFromDue(u.due);
  const start =
    u.createdAt ??
    `2025-${String((index % 9) + 1).padStart(2, '0')}-${String((index % 26) + 1).padStart(2, '0')}`;
  const photos = Array.from({ length: u.photos }, (_, i) => ({
    id: `${u.id}-p${i}`,
    url: '',
    uploaded_at: now,
    uploaded_by: 'u_system',
  }));

  return {
    id: `task_${u.id}`,
    display_number: u.number,
    title: u.title,
    description: '',
    type: mapType(u),
    priority: u.priority as TaskPriorityKey,
    trade: mapTrade(u.trade),
    category: '',
    floor: u.floor,
    location_detail: '',
    sheet_pin: null,
    status: mapStatus(u.status),
    blocked_reason:
      u.status === 'blocked'
        ? u.title.length > 80
          ? `${u.title.slice(0, 77)}…`
          : u.title
        : '',
    is_private: false,
    assignees: [demoUserIdFromName(u.assignee)],
    created_by: 'u_system',
    watchers: [],
    due_date: due,
    start_date: start,
    created_at: start,
    updated_at: now,
    related_rfis: [],
    related_drawings: [],
    related_files: [],
    related_inspections: [],
    parent_task_id: null,
    photos,
    attachments: [],
    root_cause: '',
    root_cause_category: '',
    custom_fields: {},
    tags: index % 5 === 0 ? ['facade'] : index % 5 === 1 ? ['mep', 'review'] : [],
    depends_on: [],
    comments_count: u.comments,
    progress:
      u.progress ??
      (Math.min(95, (u.id.charCodeAt(0) * 17 + index * 23) % 96) || 40),
    pinned: u.pinned,
    is_milestone: u.number.endsWith('0') && u.number.includes('T-0'),
    kanban_section_id: 'recent',
    kanban_order: 0,
  };
}

function kanbanSectionIdForTask(
  task: BuildWireTask,
  index: number,
): 'recent' | 'today' | 'next-week' | 'later' {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7Days = new Date(today);
  in7Days.setDate(today.getDate() + 7);
  const in14Days = new Date(today);
  in14Days.setDate(today.getDate() + 14);
  if (index < 2) return 'recent';
  const dueRaw = task.due_date.slice(0, 10);
  const due = new Date(`${dueRaw}T12:00:00`);
  if (Number.isNaN(due.getTime()) || due <= today) return 'today';
  if (due <= in7Days || due <= in14Days) return 'next-week';
  return 'later';
}

function assignKanbanPlacements(tasks: BuildWireTask[]): BuildWireTask[] {
  const perSection: Record<string, string[]> = {
    recent: [],
    today: [],
    'next-week': [],
    later: [],
  };
  tasks.forEach((task, index) => {
    const sid = kanbanSectionIdForTask(task, index);
    perSection[sid].push(task.id);
  });
  return tasks.map((task, index) => {
    const sid = kanbanSectionIdForTask(task, index);
    const ord = perSection[sid].indexOf(task.id);
    return { ...task, kanban_section_id: sid, kanban_order: Math.max(0, ord) };
  });
}

export function seedBuildWireTasks(): BuildWireTask[] {
  const base = MOCK_TASKS.map((u, i) => buildWireTaskFromUi(u, i));
  return assignKanbanPlacements(base);
}
