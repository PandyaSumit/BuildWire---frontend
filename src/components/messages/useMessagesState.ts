import { useEffect, useMemo, useRef, useState } from "react";
import { initialConversations, initialMessages } from "./mockData";
import type {
  Conversation,
  ConversationKind,
  Message,
  MessagesWorkspaceMode,
} from "./types";

function allowedKinds(mode: MessagesWorkspaceMode): ConversationKind[] {
  if (mode === "channels") return ["channel", "group"];
  if (mode === "dms") return ["dm"];
  return ["channel", "group", "dm"];
}

function nowHHMM(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
}

export function useMessagesState(mode: MessagesWorkspaceMode) {
  const [conversations, setConversations] = useState<Conversation[]>(
    initialConversations
  );
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [selectedConversationId, setSelectedConversationId] = useState<string>(
    mode === "dms" ? "dm-hillary" : "ch-general"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [composerText, setComposerText] = useState("");
  const [typingByConversation, setTypingByConversation] = useState<Record<string, string>>({
    "ch-general": "Project Ops is typing...",
    "dm-hillary": "Hillary is typing...",
  });
  const typingTimeoutRef = useRef<number | null>(null);
  const statusTimeoutRef = useRef<number | null>(null);

  const visibleConversations = useMemo(() => {
    const allowed = allowedKinds(mode);
    const q = searchQuery.trim().toLowerCase();
    return conversations.filter((c) => {
      if (!allowed.includes(c.kind)) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q)
      );
    });
  }, [conversations, mode, searchQuery]);

  const selectedConversation =
    conversations.find((c) => c.id === selectedConversationId) ??
    visibleConversations[0] ??
    null;

  const selectedMessages = useMemo(() => {
    if (!selectedConversation) return [];
    return messages.filter((m) => m.conversationId === selectedConversation.id);
  }, [messages, selectedConversation]);

  const sendMessage = () => {
    if (!selectedConversation) return;
    const text = composerText.trim();
    if (!text) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversation.id,
      author: "You",
      text,
      time: nowHHMM(),
      mine: true,
      status: "sent",
    };

    setMessages((prev) => [...prev, message]);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversation.id
          ? { ...c, lastMessage: text, updatedAt: "now" }
          : c
      )
    );
    setComposerText("");

    if (statusTimeoutRef.current) window.clearTimeout(statusTimeoutRef.current);
    statusTimeoutRef.current = window.setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === message.id ? { ...m, status: selectedConversation.kind === "dm" ? "read" : "delivered" } : m
        )
      );
    }, 850);

    setTypingByConversation((prev) => ({
      ...prev,
      [selectedConversation.id]:
        selectedConversation.kind === "dm"
          ? `${selectedConversation.title.split(" ")[0]} is typing...`
          : "Someone is typing...",
    }));
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => {
      setTypingByConversation((prev) => {
        const next = { ...prev };
        delete next[selectedConversation.id];
        return next;
      });
    }, 1800);
  };

  const toggleReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((message) => {
        if (message.id !== messageId) return message;
        const reactions = message.reactions ?? [];
        const idx = reactions.findIndex((r) => r.emoji === emoji);
        if (idx === -1) {
          return {
            ...message,
            reactions: [...reactions, { emoji, count: 1, mine: true }],
          };
        }
        const existing = reactions[idx];
        const updated = [...reactions];
        if (existing.mine) {
          if (existing.count <= 1) {
            updated.splice(idx, 1);
          } else {
            updated[idx] = { ...existing, count: existing.count - 1, mine: false };
          }
        } else {
          updated[idx] = { ...existing, count: existing.count + 1, mine: true };
        }
        return { ...message, reactions: updated };
      })
    );
  };

  const toggleSaved = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, saved: !m.saved } : m))
    );
  };

  const togglePinned = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, pinned: !m.pinned } : m))
    );
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
      if (statusTimeoutRef.current) window.clearTimeout(statusTimeoutRef.current);
    };
  }, []);

  const createConversation = (kind: ConversationKind, name: string) => {
    const label = name.trim();
    if (!label) return;

    const id = `${kind}-${Date.now()}`;
    const title = kind === "channel" && !label.startsWith("#") ? `# ${label}` : label;
    const item: Conversation = {
      id,
      kind,
      title,
      subtitle:
        kind === "channel"
          ? "New channel"
          : kind === "group"
          ? "New group chat"
          : "New direct message",
      members: kind === "dm" ? 2 : 3,
      unread: 0,
      updatedAt: "now",
      lastMessage: "Conversation created",
    };

    const firstMsg: Message = {
      id: `seed-${id}`,
      conversationId: id,
      author: "System",
      text:
        kind === "channel"
          ? "Channel created. Invite teammates and start collaborating."
          : kind === "group"
          ? "Group created. Add members and start discussing."
          : "Direct conversation started.",
      time: "now",
    };

    setConversations((prev) => [item, ...prev]);
    setMessages((prev) => [...prev, firstMsg]);
    setSelectedConversationId(id);
  };

  return {
    visibleConversations,
    selectedConversation,
    selectedMessages,
    selectedConversationId,
    setSelectedConversationId,
    searchQuery,
    setSearchQuery,
    composerText,
    setComposerText,
    sendMessage,
    toggleReaction,
    toggleSaved,
    togglePinned,
    createConversation,
    typingLabel: selectedConversation ? typingByConversation[selectedConversation.id] ?? null : null,
  };
}
