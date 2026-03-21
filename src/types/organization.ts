/** Row from `GET /organizations/:organizationId/members` (org membership, not project). */
export interface OrganizationMemberRow {
  id: string;
  org_id: string;
  user_id: string;
  role: string;
  user?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
  } | null;
}

export interface OrganizationRoleTemplate {
  key: string;
  name: string;
  description: string;
  system: boolean;
  permissions: string[];
}

export interface OrganizationRolesResponse {
  templates: OrganizationRoleTemplate[];
  customRoles: OrganizationRoleTemplate[];
  allRoles: OrganizationRoleTemplate[];
  permissionsCatalog: string[];
}

export type OrganizationInviteStatus = 'pending' | 'expired' | 'accepted';

export interface OrganizationInviteRow {
  id: string;
  invitedEmail: string | null;
  role: string | null;
  invitedByName: string | null;
  createdAt?: string;
  expiresAt?: string;
  status: OrganizationInviteStatus;
}
