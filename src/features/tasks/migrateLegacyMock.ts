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
  };
}

export function seedBuildWireTasks(): BuildWireTask[] {
  return MOCK_TASKS.map((u, i) => buildWireTaskFromUi(u, i));
}
