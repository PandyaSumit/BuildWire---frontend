import type { OrgRole } from '@/types/rbac';

const ORG_ROLES: OrgRole[] = ['org_admin', 'org_member', 'project_manager', 'supervisor', 'worker', 'guest'];

/** Normalize API string to `OrgRole` or null if missing/unknown. */
export function parseOrgRole(role: string | undefined | null): OrgRole | null {
  if (!role) return null;
  return ORG_ROLES.includes(role as OrgRole) ? (role as OrgRole) : null;
}

export function isOrgAdmin(role: OrgRole | null): boolean {
  return role === 'org_admin';
}

/** Settings that are strictly org_admin (Billing, Bot integrations, Roles & permissions per product spec). */
export function canAccessAdminOnlyOrgSettings(role: OrgRole | null): boolean {
  return role === 'org_admin';
}

/** Commercial / financial areas — hide from worker & guest at org scope. */
export function canAccessCommercial(role: OrgRole | null): boolean {
  if (!role) return false;
  return role === 'org_admin' || role === 'project_manager' || role === 'supervisor';
}

/** Org Team management — leads and admins, not workers or guests. */
export function canAccessTeamManagement(role: OrgRole | null): boolean {
  if (!role) return false;
  return role === 'org_admin' || role === 'project_manager' || role === 'supervisor';
}

/** Organization profile/settings screen — admins + PM; supervisor read-oriented could be added later. */
export function canAccessOrganizationSettings(role: OrgRole | null): boolean {
  if (!role) return false;
  return role === 'org_admin' || role === 'project_manager' || role === 'supervisor';
}
