import type { TaskTradeKey, TaskTypeKey } from '@/types/task';

export function taskTypeKeyTKey(type: TaskTypeKey): string {
  const m: Record<TaskTypeKey, string> = {
    general: 'tasks.type.general',
    punch_list: 'tasks.type.punchList',
    safety: 'tasks.type.safety',
    quality: 'tasks.type.quality',
    rfi_action: 'tasks.type.rfiAction',
    inspection_action: 'tasks.type.inspectionAction',
  };
  return m[type];
}

export function taskTradeKeyTKey(trade: TaskTradeKey): string {
  const map: Record<TaskTradeKey, string> = {
    civil: 'tasks.trade.civil',
    mep: 'tasks.trade.mep',
    finishing: 'tasks.trade.finishing',
    waterproofing: 'tasks.trade.waterproofing',
    safety: 'tasks.trade.safety',
    structural: 'tasks.trade.structural',
    electrical: 'tasks.trade.electrical',
    plumbing: 'tasks.trade.plumbing',
    qc: 'tasks.trade.qc',
    management: 'tasks.trade.management',
  };
  return map[trade];
}
