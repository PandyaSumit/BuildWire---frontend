import api from '@/lib/api';
import type { ApiEnvelope } from '@/types/project';

export interface InviteDetailsDto {
  orgName: string;
  invitedByName: string;
  role: string;
  invitedEmail: string;
}

export interface InviteAcceptDto {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  accessToken: string;
  refreshToken?: string;
}

export async function getInviteDetails(token: string): Promise<InviteDetailsDto> {
  const { data } = await api.get<ApiEnvelope<InviteDetailsDto>>(`/auth/invite/${token}`);
  return data.data;
}

export async function acceptInvite(
  token: string,
  body?: { firstName?: string; lastName?: string; password?: string }
): Promise<InviteAcceptDto> {
  const { data } = await api.post<ApiEnvelope<InviteAcceptDto>>(`/auth/invite/${token}/accept`, body || {});
  return data.data;
}
