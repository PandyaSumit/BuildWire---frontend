import api from '@/lib/api';
import type { BuildWireTask, TaskId, TaskListFilters, TaskPriorityKey, TaskStatus } from '@/types/task';

type Envelope<T> = { data: T };

const base = (projectId: string) => `/projects/${projectId}/tasks`;

export type ListTasksParams = TaskListFilters & {
  search?: string;
  signal?: AbortSignal;
};

export async function listProjectTasks(
  projectId: string,
  params?: ListTasksParams
): Promise<BuildWireTask[]> {
  const { data } = await api.get<Envelope<BuildWireTask[]>>(base(projectId), {
    params: {
      types: params?.types?.join(','),
      priorities: params?.priorities?.join(','),
      assignees: params?.assigneeIds?.join(','),
      trades: params?.trades?.join(','),
      floors: params?.floors?.join(','),
      search: params?.search?.trim() || undefined,
      overdue_only: params?.overdueOnly || undefined,
      blocked_only: params?.blockedOnly || undefined,
      my_work_only: params?.myWorkOnly || undefined,
    },
    signal: params?.signal,
  });
  return data.data;
}

export async function getProjectTask(
  projectId: string,
  taskId: TaskId,
  signal?: AbortSignal
): Promise<BuildWireTask> {
  const { data } = await api.get<Envelope<BuildWireTask>>(`${base(projectId)}/${taskId}`, {
    signal,
  });
  return data.data;
}

export type PatchTaskBody = Partial<
  Omit<BuildWireTask, 'id' | 'display_number' | 'created_at'>
> & { updated_at?: string };

export async function patchProjectTask(
  projectId: string,
  taskId: TaskId,
  body: PatchTaskBody
): Promise<BuildWireTask> {
  const { data } = await api.patch<Envelope<BuildWireTask>>(`${base(projectId)}/${taskId}`, body);
  return data.data;
}

export type CreateTaskBody = Omit<
  BuildWireTask,
  'id' | 'display_number' | 'created_at' | 'updated_at'
> & { display_number?: string };

export async function createProjectTask(
  projectId: string,
  body: CreateTaskBody
): Promise<BuildWireTask> {
  const { data } = await api.post<Envelope<BuildWireTask>>(base(projectId), body);
  return data.data;
}

export async function deleteProjectTask(projectId: string, taskId: TaskId): Promise<BuildWireTask> {
  const { data } = await api.delete<Envelope<BuildWireTask>>(`${base(projectId)}/${taskId}`);
  return data.data;
}

export type BulkTaskAction =
  | { action: 'status'; status: TaskStatus }
  | { action: 'assign'; assignee_ids: string[] }
  | { action: 'priority'; priority: TaskPriorityKey }
  | { action: 'delete' };

export async function bulkProjectTasks(
  projectId: string,
  body: { task_ids: TaskId[] } & BulkTaskAction
): Promise<{ updated: BuildWireTask[] }> {
  const { data } = await api.post<Envelope<{ updated: BuildWireTask[] }>>(
    `${base(projectId)}/bulk`,
    body
  );
  return data.data;
}

export function tasksExportUrl(projectId: string): string {
  const root = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  return `${root}${base(projectId)}/export`;
}
