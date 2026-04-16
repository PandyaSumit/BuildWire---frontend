import type { BuildWireTask } from '@/types/task';
import { TaskDrawer } from './TaskDrawer';

type Props = {
  onClose: () => void;
  onCreated?: (task: BuildWireTask) => void;
};

/** Thin wrapper — same shell as task details; prefer `TaskDrawer` with `mode="create"` if you need one import. */
export function NewTaskDrawer(props: Props) {
  return <TaskDrawer mode="create" {...props} />;
}
