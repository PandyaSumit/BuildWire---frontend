import { useEffect } from "react";

type UseMessagesShortcutsArgs = {
  onOpenJumpPalette: () => void;
};

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    el.isContentEditable
  );
}

export function useMessagesShortcuts({ onOpenJumpPalette }: UseMessagesShortcutsArgs) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenJumpPalette();
        return;
      }
      if (isEditableTarget(event.target)) return;
      if (event.key === "k") {
        event.preventDefault();
        onOpenJumpPalette();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenJumpPalette]);
}
