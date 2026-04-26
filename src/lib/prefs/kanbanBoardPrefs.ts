export type KanbanBoardSectionPersisted = {
  id: string;
  title: string;
  collapsed?: boolean;
};

const storageKey = (projectId: string) =>
  `buildwire-kanban-sections-v1-${encodeURIComponent(projectId || '_')}`;

export const DEFAULT_KANBAN_SECTION_BLUEPRINT: Omit<KanbanBoardSectionPersisted, 'collapsed'>[] =
  [
    { id: 'recent', title: '' },
    { id: 'today', title: '' },
    { id: 'next-week', title: '' },
    { id: 'later', title: '' },
  ];

export function cloneDefaultKanbanSections(): KanbanBoardSectionPersisted[] {
  return DEFAULT_KANBAN_SECTION_BLUEPRINT.map((s) => ({
    id: s.id,
    title: s.title,
    collapsed: false,
  }));
}

export function readKanbanSections(projectId: string): KanbanBoardSectionPersisted[] | null {
  try {
    const raw = localStorage.getItem(storageKey(projectId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const out: KanbanBoardSectionPersisted[] = [];
    for (const x of parsed) {
      if (
        x &&
        typeof x === 'object' &&
        'id' in x &&
        typeof (x as { id: unknown }).id === 'string' &&
        'title' in x &&
        typeof (x as { title: unknown }).title === 'string'
      ) {
        const rec = x as KanbanBoardSectionPersisted;
        out.push({
          id: rec.id,
          title: rec.title,
          collapsed: Boolean(rec.collapsed),
        });
      }
    }
    return out.length ? out : null;
  } catch {
    return null;
  }
}

export function writeKanbanSections(
  projectId: string,
  sections: KanbanBoardSectionPersisted[],
) {
  try {
    localStorage.setItem(storageKey(projectId), JSON.stringify(sections));
  } catch {
    /* storage unavailable */
  }
}
