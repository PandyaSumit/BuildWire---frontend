import api from '@/lib/api';
import type {
  OrganizationInviteRow,
  OrganizationMemberRow,
  OrganizationRolesResponse,
} from '@/types/organization';
import type { ApiEnvelope, PaginatedEnvelope } from '@/types/project';

export async function listOrganizationMembers(
  orgId: string,
  params?: { page?: number; limit?: number; role?: string }
): Promise<PaginatedEnvelope<OrganizationMemberRow>> {
  const { data } = await api.get<PaginatedEnvelope<OrganizationMemberRow>>(
    `/organizations/${orgId}/members`,
    { params }
  );
  return data;
}

export async function inviteOrganizationMember(
  orgId: string,
  body: { email: string; role: string }
): Promise<{ invitedEmail: string; role: string }> {
  const { data } = await api.post<ApiEnvelope<{ invitedEmail: string; role: string }>>(
    `/organizations/${orgId}/members/invite`,
    body
  );
  return data.data;
}

export async function listOrganizationInvites(orgId: string): Promise<OrganizationInviteRow[]> {
  const { data } = await api.get<ApiEnvelope<OrganizationInviteRow[]>>(
    `/organizations/${orgId}/members/invites`
  );
  return data.data;
}

export async function resendOrganizationInvite(orgId: string, inviteId: string) {
  const { data } = await api.post<ApiEnvelope<{ invitedEmail: string; role: string }>>(
    `/organizations/${orgId}/members/invites/${inviteId}/resend`
  );
  return data.data;
}

export async function updateOrganizationMemberRole(
  orgId: string,
  memberId: string,
  role: string
): Promise<OrganizationMemberRow> {
  const { data } = await api.put<ApiEnvelope<OrganizationMemberRow>>(
    `/organizations/${orgId}/members/${memberId}`,
    { role }
  );
  return data.data;
}

export async function removeOrganizationMember(orgId: string, memberId: string): Promise<void> {
  await api.delete(`/organizations/${orgId}/members/${memberId}`);
}

export async function listOrganizationRoles(orgId: string): Promise<OrganizationRolesResponse> {
  const { data } = await api.get<ApiEnvelope<OrganizationRolesResponse>>(`/organizations/${orgId}/roles`);
  return data.data;
}

export async function createOrganizationRole(
  orgId: string,
  body: { name: string; description?: string; basedOn?: string; permissions?: string[] }
) {
  const { data } = await api.post<ApiEnvelope<{ key: string; name: string; description: string; permissions: string[] }>>(
    `/organizations/${orgId}/roles`,
    body
  );
  return data.data;
}

export async function updateOrganizationRole(
  orgId: string,
  roleKey: string,
  body: { name?: string; description?: string; permissions?: string[] }
) {
  const { data } = await api.put<ApiEnvelope<{ key: string; name: string; description: string; permissions: string[] }>>(
    `/organizations/${orgId}/roles/${roleKey}`,
    body
  );
  return data.data;
}

export async function deleteOrganizationRole(orgId: string, roleKey: string): Promise<void> {
  await api.delete(`/organizations/${orgId}/roles/${roleKey}`);
}
