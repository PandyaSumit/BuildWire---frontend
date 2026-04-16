import type { OrgRole } from '@/types/rbac';
import { canAccessCommercial } from '@/lib/rbac';
import { getMockUiProject } from '@/services/project/projectFixtures';
import type { NavGroupDef } from './nav-types';
import { icons } from './icons';

/**
 * Project-scoped sidebar — full module map (UI-first).
 * Inventory uses mock project type; financial areas still respect org commercial access.
 */
export function getProjectSidebarGroups(projectId: string, orgRole: OrgRole | null): NavGroupDef[] {
  const base = `/projects/${projectId}`;
  const p = (suffix: string) => (suffix ? `${base}${suffix}` : base);
  const { showInventory } = getMockUiProject(projectId);

  const home: NavGroupDef = {
    groupKey: 'home',
    items: [
      { id: 'overview', itemKey: 'overview', to: p('/overview'), icon: icons.home, endMatch: true },
    ],
  };

  const execution: NavGroupDef = {
    groupKey: 'execution',
    items: [
      { id: 'tasks', itemKey: 'tasks', to: p('/tasks'), icon: icons.tasks },
      { id: 'drawings', itemKey: 'drawings', to: p('/drawings'), icon: icons.drawings },
      { id: 'rfis', itemKey: 'rfis', to: p('/rfis'), icon: icons.rfi },
      { id: 'daily-reports', itemKey: 'dailyReports', to: p('/daily-reports'), icon: icons.dailyReports },
      { id: 'inspections', itemKey: 'inspections', to: p('/inspections'), icon: icons.inspections },
      { id: 'files', itemKey: 'files', to: p('/files'), icon: icons.files },
    ],
  };

  const planning: NavGroupDef = {
    groupKey: 'planning',
    items: [
      { id: 'schedule', itemKey: 'schedule', to: p('/schedule'), icon: icons.schedule },
      { id: 'reports', itemKey: 'reports', to: p('/reports'), icon: icons.reports },
      { id: 'meetings', itemKey: 'meetings', to: p('/meetings'), icon: icons.meetings },
    ],
  };

  const management: NavGroupDef = {
    groupKey: 'management',
    items: [
      ...(canAccessCommercial(orgRole)
        ? [{ id: 'financials', itemKey: 'financials', to: p('/financials'), icon: icons.financials } as const]
        : []),
      { id: 'team', itemKey: 'team', to: p('/team'), icon: icons.team },
      { id: 'activity', itemKey: 'activityLog', to: p('/activity'), icon: icons.activity },
    ],
  };

  const groups: NavGroupDef[] = [home, execution, planning, management];

  if (showInventory && canAccessCommercial(orgRole)) {
    groups.push({
      groupKey: 'commercial',
      items: [{ id: 'inventory', itemKey: 'inventory', to: p('/inventory'), icon: icons.inventory }],
    });
  }

  return groups;
}
