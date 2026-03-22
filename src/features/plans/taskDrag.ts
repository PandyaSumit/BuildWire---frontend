import type { UiTask } from "@/features/tasks/fixtures";

/** MIME type for HTML5 drag data (task → plan pin). */
export const BUILDWIRE_TASK_DRAG_TYPE = "application/buildwire-task+json";

export type TaskDragPayload = {
  taskId: string;
  number: string;
  status: string;
};

export function buildTaskDragPayload(task: UiTask): string {
  const payload: TaskDragPayload = {
    taskId: task.id,
    number: task.number,
    status: task.status,
  };
  return JSON.stringify(payload);
}

export function parseTaskDragPayload(raw: string): TaskDragPayload | null {
  try {
    const parsed = JSON.parse(raw) as TaskDragPayload;
    if (
      typeof parsed?.taskId === "string" &&
      typeof parsed?.number === "string" &&
      typeof parsed?.status === "string"
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}
