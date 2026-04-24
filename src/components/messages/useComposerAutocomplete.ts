import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  detectComposerTrigger,
  EMOJI_SUGGESTIONS,
  type ComposerTrigger,
} from "./composerAutocomplete";

export type MentionItem = { id: string; label: string };

type UseComposerAutocompleteArgs = {
  composerText: string;
  onComposerTextChange: (value: string) => void;
  mentionCandidates: string[];
};

export function useComposerAutocomplete({
  composerText,
  onComposerTextChange,
  mentionCandidates,
}: UseComposerAutocompleteArgs) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursor, setCursor] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const lastTriggerKey = useRef("");

  const trigger: ComposerTrigger = useMemo(() => {
    if (dismissed) return { kind: "none" };
    return detectComposerTrigger(composerText, cursor);
  }, [composerText, cursor, dismissed]);

  const triggerKey =
    trigger.kind === "none"
      ? ""
      : `${trigger.kind}:${trigger.from}:${trigger.to}:${trigger.query}`;

  useEffect(() => {
    if (triggerKey !== lastTriggerKey.current) {
      lastTriggerKey.current = triggerKey;
      setActiveIndex(0);
    }
  }, [triggerKey]);

  const mentionItems: MentionItem[] = useMemo(() => {
    if (trigger.kind !== "mention") return [];
    const q = trigger.query.toLowerCase();
    const uniq = Array.from(new Set(mentionCandidates.filter(Boolean)));
    const filtered = uniq
      .filter((name) => !q || name.toLowerCase().includes(q))
      .slice(0, 8);
    return filtered.map((label) => ({ id: label, label }));
  }, [mentionCandidates, trigger]);

  const emojiItems = useMemo(() => {
    if (trigger.kind !== "emoji") return [];
    const q = trigger.query.toLowerCase();
    return EMOJI_SUGGESTIONS.filter(
      (row) => !q || row.key.includes(q) || row.emoji.includes(q),
    ).slice(0, 8);
  }, [trigger]);

  const open = trigger.kind !== "none" && (trigger.kind === "mention" ? mentionItems.length > 0 : emojiItems.length > 0);

  const applyTextAndCursor = useCallback(
    (next: string, nextCursor: number) => {
      onComposerTextChange(next);
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (el) {
          el.focus();
          el.setSelectionRange(nextCursor, nextCursor);
        }
        setCursor(nextCursor);
      });
    },
    [onComposerTextChange],
  );

  const insertMention = useCallback(
    (label: string) => {
      if (trigger.kind !== "mention") return;
      const insert = `@${label.replace(/\s+/g, " ")} `;
      const next = composerText.slice(0, trigger.from) + insert + composerText.slice(trigger.to);
      const pos = trigger.from + insert.length;
      setDismissed(false);
      applyTextAndCursor(next, pos);
    },
    [applyTextAndCursor, composerText, trigger],
  );

  const insertEmoji = useCallback(
    (emoji: string) => {
      if (trigger.kind !== "emoji") return;
      const insert = `${emoji} `;
      const next = composerText.slice(0, trigger.from) + insert + composerText.slice(trigger.to);
      const pos = trigger.from + insert.length;
      setDismissed(false);
      applyTextAndCursor(next, pos);
    },
    [applyTextAndCursor, composerText, trigger],
  );

  const handleComposerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (trigger.kind === "none" || dismissed) return false;
      const len = trigger.kind === "mention" ? mentionItems.length : emojiItems.length;
      if (len === 0) return false;

      if (e.key === "Escape") {
        e.preventDefault();
        setDismissed(true);
        return true;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % len);
        return true;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + len) % len);
        return true;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (trigger.kind === "mention") {
          const pick = mentionItems[activeIndex] ?? mentionItems[0];
          if (pick) insertMention(pick.label);
        } else {
          const row = emojiItems[activeIndex] ?? emojiItems[0];
          if (row) insertEmoji(row.emoji);
        }
        return true;
      }
      return false;
    },
    [
      activeIndex,
      dismissed,
      emojiItems,
      insertEmoji,
      insertMention,
      mentionItems,
      trigger.kind,
    ],
  );

  const syncCursorFromDom = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    setCursor(el.selectionStart ?? 0);
    setDismissed(false);
  }, []);

  const onComposerInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onComposerTextChange(e.target.value);
      setCursor(e.target.selectionStart ?? 0);
      setDismissed(false);
    },
    [onComposerTextChange],
  );

  const insertRawAtCursor = useCallback(
    (raw: string) => {
      const el = textareaRef.current;
      const start = el?.selectionStart ?? composerText.length;
      const end = el?.selectionEnd ?? start;
      const next = composerText.slice(0, start) + raw + composerText.slice(end);
      setDismissed(false);
      applyTextAndCursor(next, start + raw.length);
    },
    [applyTextAndCursor, composerText],
  );

  return {
    textareaRef,
    open,
    trigger,
    mentionItems,
    emojiItems,
    activeIndex,
    setActiveIndex,
    handleComposerKeyDown,
    syncCursorFromDom,
    onComposerInput,
    insertMention,
    insertEmoji,
    insertRawAtCursor,
    setDismissed,
  };
}
