import type { OrgRole } from '@/types/rbac';
import { canAccessCommercial } from '@/lib/rbac';
import type { NavGroupDef } from './nav-types';
import { icons } from './icons';

/**
 * Project-scoped sidebar. Item URLs include `projectId`.
 * Fine-grained visibility should eventually use **project role** from the API (`ProjectMember.role`);
 * until then we use org role to hide commercial/financial areas from workers/guests.
 */
export function getProjectSidebarGroups(projectId: string, orgRole: OrgRole | null): NavGroupDef[] {
  const base = `/projects/${projectId}`;
  const p = (suffix: string) => (suffix ? `${base}${suffix}` : base);

  const ops: NavGroupDef['items'] = [
    { id: 'phome', label: 'Project home', to: p(''), icon: icons.home, endMatch: true },
    { id: 'tasks', label: 'Tasks', to: p('/tasks'), icon: icons.tasks },
    { id: 'files', label: 'Files', to: p('/files'), icon: icons.files },
  ];

  const groups: NavGroupDef[] = [{ label: 'Overview', items: ops }];

  if (canAccessCommercial(orgRole)) {
    groups.push({
      label: 'Commercial',
      items: [
        { id: 'budget', label: 'Budget', to: p('/budget'), icon: icons.budget },
        { id: 'rfi', label: 'RFIs', to: p('/rfis'), icon: icons.rfi },
      ],
    });
  }

  return groups;
}
