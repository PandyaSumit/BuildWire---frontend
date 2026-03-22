export type BreadcrumbItem = { label: string; to?: string };

const SEGMENT_LABEL: Record<string, string> = {
  tasks: 'Tasks',
  drawings: 'Drawings',
  viewer: 'Viewer',
  'daily-reports': 'Daily Reports',
  inspections: 'Inspections',
  files: 'Files',
  schedule: 'Schedule',
  reports: 'Reports',
  meetings: 'Meetings',
  financials: 'Financials',
  team: 'Team',
  activity: 'Activity Log',
  inventory: 'Inventory',
  rfis: 'RFIs',
  budget: 'Budget',
};

function labelForSegment(seg: string): string {
  if (SEGMENT_LABEL[seg]) return SEGMENT_LABEL[seg];
  if (seg.length > 20) return '…';
  if (/^[0-9a-f-]{8,}$/i.test(seg)) return 'Detail';
  return seg.replace(/-/g, ' ');
}

export function getProjectBreadcrumbs(
  pathname: string,
  projectId: string,
  projectName: string
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: 'Projects', to: '/projects' },
    { label: projectName, to: `/projects/${projectId}` },
  ];

  const base = `/projects/${projectId}`;
  const tail = pathname.slice(base.length);
  const segments = tail.split('/').filter(Boolean);

  let acc = base;
  segments.forEach((seg, i) => {
    acc += `/${seg}`;
    const isLast = i === segments.length - 1;
    const label = labelForSegment(seg);
    items.push(isLast ? { label } : { label, to: acc });
  });

  return items;
}
