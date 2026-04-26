import type { OrgRole } from '@/types/rbac';

const ORG_ROLES: OrgRole[] = ['org_admin', 'org_member', 'project_manager', 'supervisor', 'worker', 'guest'];

export function parseOrgRole(role: string | undefined | null): OrgRole | null {
  if (!role) return null;
  return ORG_ROLES.includes(role as OrgRole) ? (role as OrgRole) : null;
}

export function isOrgAdmin(role: OrgRole | null): boolean {
  return role === 'org_admin';
}

export function canAccessAdminOnlyOrgSettings(role: OrgRole | null): boolean {
  return role === 'org_admin';
}

export function canAccessCommercial(role: OrgRole | null): boolean {
  if (!role) return false;
  return role === 'org_admin' || role === 'project_manager' || role === 'supervisor';
}

export function canAccessTeamManagement(role: OrgRole | null): boolean {
  if (!role) return false;
  return role === 'org_admin' || role === 'project_manager' || role === 'supervisor';
}

export function canAccessOrganizationSettings(role: OrgRole | null): boolean {
  if (!role) return false;
  return role === 'org_admin' || role === 'project_manager' || role === 'supervisor';
}
