import api from '@/lib/api';
import type {
  AddProjectMemberBody,
  ApiEnvelope,
  CreateProjectBody,
  ListProjectsParams,
  PaginatedEnvelope,
  ProjectDto,
  ProjectHomeSummaryDto,
  ProjectMemberDto,
  UpdateProjectBody,
} from '@/types/project';

const base = (orgId: string) => `/organizations/${orgId}/projects`;

export async function listProjects(
  orgId: string,
  params?: ListProjectsParams,
  signal?: AbortSignal
): Promise<PaginatedEnvelope<ProjectDto>> {
  const { data } = await api.get<PaginatedEnvelope<ProjectDto>>(base(orgId), {
    params: {
      page: params?.page,
      limit: params?.limit,
      search: params?.search?.trim() || undefined,
      status: params?.status,
    },
    signal,
  });
  return data;
}

export async function getProject(orgId: string, projectId: string): Promise<ProjectDto> {
  const { data } = await api.get<ApiEnvelope<ProjectDto>>(`${base(orgId)}/${projectId}`);
  return data.data;
}

/** Project home: project + task stats + members + org directory in one round-trip. */
export async function getProjectHome(
  orgId: string,
  projectId: string,
  options?: { membersLimit?: number; orgMembersLimit?: number; signal?: AbortSignal }
): Promise<ProjectHomeSummaryDto> {
  const { data } = await api.get<ApiEnvelope<ProjectHomeSummaryDto>>(
    `${base(orgId)}/${projectId}/home`,
    {
      params: {
        membersLimit: options?.membersLimit,
        orgMembersLimit: options?.orgMembersLimit,
      },
      signal: options?.signal,
    }
  );
  return data.data;
}

export async function createProject(
  orgId: string,
  body: CreateProjectBody
): Promise<ProjectDto> {
  const { data } = await api.post<ApiEnvelope<ProjectDto>>(base(orgId), body);
  return data.data;
}

export async function updateProject(
  orgId: string,
  projectId: string,
  body: UpdateProjectBody
): Promise<ProjectDto> {
  const { data } = await api.put<ApiEnvelope<ProjectDto>>(`${base(orgId)}/${projectId}`, body);
  return data.data;
}

export async function deleteProject(orgId: string, projectId: string): Promise<void> {
  await api.delete<ApiEnvelope<null>>(`${base(orgId)}/${projectId}`);
}

export async function listProjectMembers(
  orgId: string,
  projectId: string,
  params?: { page?: number; limit?: number; role?: string }
): Promise<PaginatedEnvelope<ProjectMemberDto>> {
  const { data } = await api.get<PaginatedEnvelope<ProjectMemberDto>>(
    `${base(orgId)}/${projectId}/members`,
    { params }
  );
  return data;
}

export async function addProjectMember(
  orgId: string,
  projectId: string,
  body: AddProjectMemberBody
): Promise<ProjectMemberDto> {
  const { data } = await api.post<ApiEnvelope<ProjectMemberDto>>(
    `${base(orgId)}/${projectId}/members`,
    body
  );
  return data.data;
}

export async function removeProjectMember(
  orgId: string,
  projectId: string,
  memberId: string
): Promise<void> {
  await api.delete<ApiEnvelope<null>>(`${base(orgId)}/${projectId}/members/${memberId}`);
}
