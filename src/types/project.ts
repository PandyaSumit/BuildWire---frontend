import type { OrganizationMemberRow } from './organization';

/** Aligns with `server/src/models/pg/Project.js` and project controller responses. */

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';

export interface ProjectBudget {
  estimated?: number;
  spent?: number;
  currency?: string;
}

export interface ProjectUserSnippet {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}

export interface ProjectTaskStats {
  total: number;
  open: number;
  in_progress: number;
  completed: number;
  blocked: number;
}

/** Raw project row from Sequelize `toJSON()` (snake_case fields). */
export interface ProjectDto {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  address: Record<string, unknown>;
  budget: ProjectBudget;
  cover_image_url: string | null;
  created_by_id: string;
  settings: Record<string, unknown>;
  task_counter?: number;
  created_at?: string;
  updated_at?: string;
  createdBy?: ProjectUserSnippet | null;
  taskStats?: ProjectTaskStats;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasMore: boolean;
}

export interface PaginatedEnvelope<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ListProjectsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
}

export interface CreateProjectBody {
  name: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  address?: Record<string, unknown>;
  budget?: ProjectBudget;
  settings?: Record<string, unknown>;
}

/** `PUT /projects/:projectId` — camelCase body per server `project.controller` fieldMap. */
export interface UpdateProjectBody {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  address?: Record<string, unknown>;
  budget?: ProjectBudget;
  coverImage?: string | null;
  settings?: Record<string, unknown>;
}

export type ProjectMemberRole = 'project_manager' | 'supervisor' | 'worker' | 'guest';

export interface ProjectMemberDto {
  id: string;
  project_id: string;
  org_id: string;
  user_id: string;
  role: ProjectMemberRole;
  is_active?: boolean;
  created_at?: string;
  user?: (ProjectUserSnippet & { phone?: string | null; avatar_url?: string | null }) | null;
  addedBy?: ProjectUserSnippet | null;
}

export interface AddProjectMemberBody {
  userId: string;
  role: ProjectMemberRole;
}

/** `GET .../projects/:projectId/home` — one payload for project home screen. */
export interface ProjectHomeSummaryDto {
  project: ProjectDto;
  members: ProjectMemberDto[];
  membersTotal: number;
  orgMembers: OrganizationMemberRow[];
  orgMembersTotal: number;
}
