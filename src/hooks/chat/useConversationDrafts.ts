import { useCallback, useEffect, useMemo, useState } from "react";

const DRAFTS_STORAGE_KEY = "bw.messages.drafts";

function readDraftsFromStorage(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DRAFTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function useConversationDrafts(activeConversationId: string | null) {
  const [draftsByConversation, setDraftsByConversation] = useState<Record<string, string>>(
    () => readDraftsFromStorage(),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(draftsByConversation));
  }, [draftsByConversation]);

  const composerText = useMemo(() => {
    if (!activeConversationId) return "";
    return draftsByConversation[activeConversationId] ?? "";
  }, [activeConversationId, draftsByConversation]);

  const setComposerText = useCallback(
    (value: string) => {
      if (!activeConversationId) return;
      setDraftsByConversation((prev) => ({
        ...prev,
        [activeConversationId]: value,
      }));
    },
    [activeConversationId],
  );

  const clearComposerText = useCallback(() => {
    if (!activeConversationId) return;
    setDraftsByConversation((prev) => ({
      ...prev,
      [activeConversationId]: "",
    }));
  }, [activeConversationId]);

  return { composerText, setComposerText, clearComposerText };
}
