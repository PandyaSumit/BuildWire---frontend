/**
 * Org-level role from the API (`user.org.role`).
 * Source: `organization_members.role` — see BuildWire server `OrganizationMember` model.
 * Used for global sidebar and coarse access; project-scoped actions use project membership (future: enrich from API).
 */
/** Org-level membership role from the API (`user.org.role`). See server `rbac.middleware` ORG_ROLE_WEIGHT. */
export type OrgRole = 'org_admin' | 'org_member' | 'project_manager' | 'supervisor' | 'worker' | 'guest';

/** Project-level roles (RBAC on server). Not yet returned on `/auth/me`; reserved for project sidebar + guards. */
export type ProjectRole = 'project_manager' | 'supervisor' | 'worker' | 'guest';
