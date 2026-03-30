import type { BuildWireTask } from '@/types/task';

/** Demo sheet ids align with `DUMMY_DRAWING_PLANS` in project UI. */
const DEMO_DRAWING_META: Record<string, { sheet: string; name: string }> = {
  a101: { sheet: 'A-101', name: 'Ground Floor — Architectural' },
  a102: { sheet: 'A-102', name: 'Typical Floor — Architectural' },
  s201: { sheet: 'S-201', name: 'Roof Slab — Structural' },
  m301: { sheet: 'M-301', name: 'Riser — MEP' },
  p101: { sheet: 'P-101', name: 'Plumbing Riser' },
  e401: { sheet: 'E-401', name: 'Electrical Single Line' },
  fp201: { sheet: 'FP-201', name: 'Sprinkler Riser' },
};

export type TaskDrawingListCell = {
  /** Route param for `/projects/:projectId/drawings/viewer/:planId` */
  planId: string | null;
  label: string;
  title?: string;
};

/** Primary drawing for list column: pin target, else first related drawing. */
export function taskDrawingListCell(task: BuildWireTask): TaskDrawingListCell {
  const id = task.sheet_pin?.drawing_id ?? task.related_drawings[0];
  if (!id) return { planId: null, label: '' };
  const meta = DEMO_DRAWING_META[id];
  if (meta) return { planId: id, label: meta.name, title: meta.sheet };
  return { planId: id, label: id };
}
