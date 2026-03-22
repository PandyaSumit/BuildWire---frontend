import type { BuildWireTask } from '@/types/task';
import { TaskDrawer } from '@/features/tasks/TaskDrawer';

type Props = {
  task: BuildWireTask;
  projectId: string;
  onClose: () => void;
};

/** Thin wrapper — `projectId` is accepted for call-site clarity; routing links use `useTaskProject().projectId`. */
export function TaskDetailDrawer({ task, onClose }: Props) {
  return <TaskDrawer mode="edit" task={task} onClose={onClose} />;
}
