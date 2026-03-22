import type { OrgRole } from '@/types/rbac';
import {
  canAccessAdminOnlyOrgSettings,
  canAccessCommercial,
  canAccessOrganizationSettings,
  canAccessTeamManagement,
} from '@/lib/rbac';
import type { NavGroupDef } from './nav-types';
import { icons } from './icons';

const base = (role: OrgRole | null): NavGroupDef[] => {
  const overview: NavGroupDef = {
    groupKey: 'overview',
    items: [
      {
        id: 'dash',
        itemKey: 'dashboard',
        to: '/dashboard',
        icon: icons.dashboard,
        endMatch: true,
      },
      { id: 'projects', itemKey: 'projects', to: '/projects', icon: icons.projects },
    ],
  };

  const groups: NavGroupDef[] = [overview];

  if (canAccessCommercial(role)) {
    groups.push({
      groupKey: 'commercial',
      items: [
        { id: 'sales', itemKey: 'salesCrm', to: '/sales', icon: icons.sales },
        { id: 'brokers', itemKey: 'brokers', to: '/brokers', icon: icons.brokers },
      ],
    });
  }

  groups.push({
    groupKey: 'intelligence',
    items: [
      {
        id: 'ai-map',
        itemKey: 'aiMap',
        to: '/intelligence/ai-map',
        icon: icons.map,
        showAiBadge: true,
      },
    ],
  });

  const settingsItems: NavGroupDef['items'] = [
    {
      id: 'preferences',
      itemKey: 'preferences',
      to: '/settings/preferences',
      icon: icons.preferences,
    },
  ];

  if (canAccessTeamManagement(role)) {
    settingsItems.push({ id: 'team', itemKey: 'team', to: '/team', icon: icons.team });
  }

  if (canAccessAdminOnlyOrgSettings(role)) {
    settingsItems.push({
      id: 'roles',
      itemKey: 'rolesPermissions',
      to: '/settings/roles',
      icon: icons.roles,
    });
  }

  if (canAccessOrganizationSettings(role)) {
    settingsItems.push({
      id: 'org',
      itemKey: 'organization',
      to: '/settings/organization',
      icon: icons.organization,
    });
  }

  if (canAccessAdminOnlyOrgSettings(role)) {
    settingsItems.push({
      id: 'billing',
      itemKey: 'billing',
      to: '/settings/billing',
      icon: icons.billing,
    });
    settingsItems.push({
      id: 'bots',
      itemKey: 'botIntegrations',
      to: '/settings/bot-integrations',
      icon: icons.bot,
    });
  }

  if (settingsItems.length > 0) {
    groups.push({ groupKey: 'settings', items: settingsItems });
  }

  return groups;
};

/** Global (org-level) sidebar — not inside a project. */
export function getGlobalSidebarGroups(role: OrgRole | null): NavGroupDef[] {
  return base(role);
}
