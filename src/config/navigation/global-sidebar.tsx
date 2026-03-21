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
    label: 'Overview',
    items: [
      {
        id: 'dash',
        label: 'Dashboard',
        to: '/dashboard',
        icon: icons.dashboard,
        endMatch: true,
      },
      { id: 'projects', label: 'Projects', to: '/projects', icon: icons.projects },
    ],
  };

  const groups: NavGroupDef[] = [overview];

  if (canAccessCommercial(role)) {
    groups.push({
      label: 'Commercial',
      items: [
        { id: 'sales', label: 'Sales & CRM', to: '/sales', icon: icons.sales },
        { id: 'brokers', label: 'Brokers', to: '/brokers', icon: icons.brokers },
      ],
    });
  }

  groups.push({
    label: 'Intelligence',
    items: [
      {
        id: 'ai-map',
        label: 'AI Map',
        to: '/intelligence/ai-map',
        icon: icons.map,
        showAiBadge: true,
      },
    ],
  });

  const settingsItems: NavGroupDef['items'] = [];

  if (canAccessTeamManagement(role)) {
    settingsItems.push({ id: 'team', label: 'Team', to: '/team', icon: icons.team });
  }

  if (canAccessAdminOnlyOrgSettings(role)) {
    settingsItems.push({
      id: 'roles',
      label: 'Roles & permissions',
      to: '/settings/roles',
      icon: icons.roles,
    });
  }

  if (canAccessOrganizationSettings(role)) {
    settingsItems.push({
      id: 'org',
      label: 'Organization',
      to: '/settings/organization',
      icon: icons.organization,
    });
  }

  if (canAccessAdminOnlyOrgSettings(role)) {
    settingsItems.push({
      id: 'billing',
      label: 'Billing',
      to: '/settings/billing',
      icon: icons.billing,
    });
    settingsItems.push({
      id: 'bots',
      label: 'Bot integrations',
      to: '/settings/bot-integrations',
      icon: icons.bot,
    });
  }

  if (settingsItems.length > 0) {
    groups.push({ label: 'Settings', items: settingsItems });
  }

  return groups;
};

/** Global (org-level) sidebar — not inside a project. */
export function getGlobalSidebarGroups(role: OrgRole | null): NavGroupDef[] {
  return base(role);
}
