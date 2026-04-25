import type { BuildWireTask, TaskPriorityKey, TaskStatus, TaskTradeKey, TaskTypeKey } from '@/types/task';
import { MOCK_TASKS, type UiTask } from '@/utils/task/fixtures';
import { demoUserIdFromName } from '@/utils/task/demoUsers';

function mapType(t: UiTask['type']): TaskTypeKey {
  switch (t) {
    case 'General':         return 'general';
    case 'Safety':          return 'safety';
    case 'Quality':         return 'quality';
    case 'Punch List':      return 'punch_list';
    case 'RFI Action':      return 'rfi_action';
    case 'Inspection Item': return 'inspection_action';
    default:                return 'general';
  }
}

function mapStatus(s: UiTask['status']): TaskStatus {
  return s;
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

/** Links demo tasks to drawings (ids match floor-plan / drawings demo data). */
const DEMO_TASK_DRAWING_LINK: Record<
  string,
  { drawingId: string; pin?: { x: number; y: number } }
> = {
  'T-042': { drawingId: 'a101', pin: { x: 420, y: 320 } },
  'T-041': { drawingId: 'a101', pin: { x: 720, y: 540 } },
  'T-038': { drawingId: 'a102', pin: { x: 380, y: 410 } },
  'T-020': { drawingId: 's201', pin: { x: 520, y: 380 } },
  'T-029': { drawingId: 'p101', pin: { x: 460, y: 340 } },
  'T-035': { drawingId: 'e401' },
  'T-028': { drawingId: 'm301' },
};

export function buildWireTaskFromUi(u: UiTask, index: number): BuildWireTask {
  const now = new Date().toISOString();
  const due = isoFromDue(u.due);
  // Generate a start_date spread across recent weeks so Gantt bars are visible
  const fallbackStart = new Date();
  fallbackStart.setDate(fallbackStart.getDate() - ((index * 11 + 7) % 45));
  const start = u.createdAt ?? fallbackStart.toISOString().slice(0, 10);
  const photos = Array.from({ length: u.photos }, (_, i) => ({
    id: `${u.id}-p${i}`,
    url: '',
    uploaded_at: now,
    uploaded_by: 'u_system',
  }));

  const drawingLink = DEMO_TASK_DRAWING_LINK[u.number];
  const sheet_pin = drawingLink?.pin
    ? {
        drawing_id: drawingLink.drawingId,
        x: drawingLink.pin.x,
        y: drawingLink.pin.y,
      }
    : null;
  const related_drawings = drawingLink ? [drawingLink.drawingId] : [];

  return {
    id: `task_${u.id}`,
    display_number: u.number,
    title: u.title,
    description: '',
    type: mapType(u.type),
    priority: u.priority as TaskPriorityKey,
    trade: mapTrade(u.trade),
    category: '',
    floor: u.floor,
    location_detail: '',
    sheet_pin,
    status: mapStatus(u.status),
    blocked_reason:
      u.status === 'blocked'
        ? u.title.length > 80
          ? `${u.title.slice(0, 77)}…`
          : u.title
        : '',
    is_private: false,
    assignees: (() => {
      const primary = demoUserIdFromName(u.assignee);
      const extra: string[] =
        index % 5 === 0
          ? ['u_priya']
          : index % 5 === 1
            ? ['u_amit', 'u_neha']
            : index % 7 === 0
              ? ['u_mep', 'u_qclead']
              : [];
      return [...new Set([primary, ...extra])];
    })(),
    created_by: 'u_system',
    watchers: [],
    due_date: due,
    start_date: start,
    created_at: start,
    updated_at: now,
    related_rfis: [],
    related_drawings,
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
