import type { TaskPriorityKey, TaskTradeKey, TaskTypeKey } from '@/types/task';

export type TaskTemplate = {
  id: string;
  name: string;
  type: TaskTypeKey;
  priority: TaskPriorityKey;
  trade: TaskTradeKey;
  floor: string;
  description: string;
  assignees: string[];
};

export const BUILTIN_TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'tpl_safety_followup',
    name: 'Safety inspection follow-up',
    type: 'safety',
    priority: 'high',
    trade: 'safety',
    floor: 'L1',
    description: 'Follow up on open safety observations from the last site walk.',
    assignees: [],
  },
  {
    id: 'tpl_quality_punch',
    name: 'Quality punch item',
    type: 'punch_list',
    priority: 'medium',
    trade: 'finishing',
    floor: 'L12',
    description: 'Document and close punch list item with photos.',
    assignees: [],
  },
  {
    id: 'tpl_concrete_pour',
    name: 'Concrete pour check',
    type: 'general',
    priority: 'high',
    trade: 'civil',
    floor: 'Podium',
    description: 'Pre-pour checklist: embeds, vibration plan, curing.',
    assignees: [],
  },
];

const LS_RECENT = 'buildwire-task-templates-recent';

export function getRecentTemplateIds(): string[] {
  try {
    const raw = localStorage.getItem(LS_RECENT);
    if (!raw) return [];
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) ? arr.slice(0, 10) : [];
  } catch {
    return [];
  }
}

export function recordTemplateUse(templateId: string): void {
  const cur = getRecentTemplateIds().filter((id) => id !== templateId);
  cur.unshift(templateId);
  localStorage.setItem(LS_RECENT, JSON.stringify(cur.slice(0, 10)));
}

export function orderedTemplatesForPicker(all: TaskTemplate[]): TaskTemplate[] {
  const recent = getRecentTemplateIds();
  const byId = Object.fromEntries(all.map((t) => [t.id, t])) as Record<string, TaskTemplate>;
  const seen = new Set<string>();
  const out: TaskTemplate[] = [];
  for (const id of recent) {
    const t = byId[id];
    if (t && !seen.has(t.id)) {
      out.push(t);
      seen.add(t.id);
    }
  }
  for (const t of all) {
    if (!seen.has(t.id)) out.push(t);
  }
  return out;
}
