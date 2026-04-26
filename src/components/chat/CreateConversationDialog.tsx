import { Button, Input } from "@/components/ui";
import type { ConversationKind } from "@/types/chat";

type CreateConversationDialogProps = {
  kind: ConversationKind | null;
  name: string;
  onNameChange: (value: string) => void;
  onClose: () => void;
  onCreate: () => void;
};

function titleByKind(kind: ConversationKind): string {
  if (kind === "channel") return "Create channel";
  if (kind === "group") return "Create group";
  return "Create direct message";
}

function descriptionByKind(kind: ConversationKind): string {
  if (kind === "channel") return "Use channels for topic-based collaboration.";
  if (kind === "group") return "Use groups for focused team discussions.";
  return "Start a 1:1 conversation with a teammate.";
}

function placeholderByKind(kind: ConversationKind): string {
  if (kind === "channel") return "e.g. site-ops";
  if (kind === "group") return "e.g. Hiring Taskforce";
  return "e.g. Alex Morgan";
}

export function CreateConversationDialog({
  kind,
  name,
  onNameChange,
  onClose,
  onCreate,
}: CreateConversationDialogProps) {
  if (!kind) return null;

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-md rounded-[10px] border border-border bg-surface p-4 shadow-token-xl">
        <h4 className="text-sm font-semibold text-primary">{titleByKind(kind)}</h4>
        <p className="mt-1 text-xs text-secondary">{descriptionByKind(kind)}</p>
        <div className="mt-3">
          <Input
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder={placeholderByKind(kind)}
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onCreate}>
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
