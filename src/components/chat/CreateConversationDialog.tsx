import { useEffect } from "react";
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
  useEffect(() => {
    if (!kind) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [kind, onClose]);

  useEffect(() => {
    if (!kind) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [kind]);

  if (!kind) return null;

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex w-full max-w-md flex-col rounded-2xl border border-border bg-elevated shadow-2xl shadow-black/60"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-border/60 px-6 pb-4 pt-5">
          <div>
            <h2 className="text-lg font-semibold text-primary">{titleByKind(kind)}</h2>
            <p className="mt-1 text-sm text-secondary">{descriptionByKind(kind)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-primary"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <Input
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder={placeholderByKind(kind)}
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border/60 bg-elevated px-6 py-4">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={onCreate}>
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
