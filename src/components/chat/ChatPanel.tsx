import { useEffect, useMemo, useRef, useState } from "react";
import { getMessageActionItems, type MessageActionId } from "@/utils/chat/messageActions";
import { buildMentionCandidates } from "@/utils/chat/mentionCandidates";
import type { Conversation, Message, MessageAttachment } from "@/types/chat";
import { useComposerAutocomplete } from "@/hooks/chat/useComposerAutocomplete";

type MessageGroup = {
  groupId: string;
  author: string;
  avatarColor?: string;
  mine: boolean;
  messages: Message[];
};

function buildGroups(messages: Message[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  for (const msg of messages) {
    const last = groups[groups.length - 1];
    if (last && last.author === msg.author && last.mine === !!msg.mine) {
      last.messages.push(msg);
    } else {
      groups.push({
        groupId: msg.id,
        author: msg.author,
        avatarColor: msg.avatarColor,
        mine: !!msg.mine,
        messages: [msg],
      });
    }
  }
  return groups;
}

function Avatar({ name, color, size = "md" }: { name: string; color?: string; size?: "sm" | "md" }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const dim = size === "sm" ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-[13px]";
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-lg font-bold text-white ${dim} ${color ?? "bg-brand"}`}
    >
      {initials}
    </span>
  );
}

function ToolbarBtn({
  children,
  title,
  onClick,
  onKeyDown,
  ariaExpanded,
  ariaHaspopup,
  dataMessageMenuTrigger,
  buttonRef,
}: {
  children: React.ReactNode;
  title?: string;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  ariaExpanded?: boolean;
  ariaHaspopup?: "menu" | "dialog" | "listbox";
  dataMessageMenuTrigger?: boolean;
  buttonRef?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      title={title}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHaspopup}
      data-message-menu-trigger={dataMessageMenuTrigger ? "true" : undefined}
      className="grid h-7 w-7 place-items-center rounded text-muted transition-colors hover:bg-primary/8 hover:text-primary"
    >
      {children}
    </button>
  );
}

type ChatPanelProps = {
  conversation: Conversation | null;
  messages: Message[];
  composerText: string;
  onComposerTextChange: (value: string) => void;
  onSend: () => void;
  onReact: (messageId: string, emoji: string) => void;
  onToggleSaved: (messageId: string) => void;
  onTogglePinned: (messageId: string) => void;
  onEditMessage: (messageId: string, text: string) => void;
  onDeleteMessage: (messageId: string) => void;
  typingLabel?: string | null;
  isMobile?: boolean;
  onBackToConversationList?: () => void;
  /** When details panel is closed, channel/group can show an info control to reopen it */
  detailsOpen?: boolean;
  onOpenDetails?: () => void;
};

type UploadItem = {
  id: string;
  name: string;
  progress: number;
};

type SlashCommand = {
  id: string;
  label: string;
  description: string;
  insert: string;
};

const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: "assign",
    label: "/assign",
    description: "Assign a task to a teammate",
    insert: "/assign @team ",
  },
  {
    id: "rfi",
    label: "/rfi",
    description: "Create an RFI follow-up message",
    insert: "/rfi Please share clarification for ",
  },
  {
    id: "meeting",
    label: "/meeting",
    description: "Schedule a coordination call",
    insert: "/meeting Let's schedule a quick sync at ",
  },
];

function statusIcon(status?: Message["status"]) {
  if (!status) return null;
  const color = status === "read" ? "text-brand" : "text-muted";
  return (
    <span className={`inline-flex items-center gap-1 ${color}`}>
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      {status === "sent" ? "Sent" : status === "delivered" ? "Delivered" : "Read"}
    </span>
  );
}

function presenceLine(conversation: Conversation): string {
  if (conversation.kind === "dm") return conversation.subtitle;
  return `${conversation.members} members`;
}

export function ChatPanel({
  conversation,
  messages,
  composerText,
  onComposerTextChange,
  onSend,
  onReact,
  onToggleSaved,
  onTogglePinned,
  onEditMessage,
  onDeleteMessage,
  typingLabel,
  isMobile = false,
  onBackToConversationList,
  detailsOpen = false,
  onOpenDetails,
}: ChatPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const unreadRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showSlashHint, setShowSlashHint] = useState(false);
  const [threadMessage, setThreadMessage] = useState<Message | null>(null);
  const [threadDraft, setThreadDraft] = useState("");
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [menuMessageId, setMenuMessageId] = useState<string | null>(null);
  const [menuActiveIndex, setMenuActiveIndex] = useState(0);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [slashActiveIndex, setSlashActiveIndex] = useState(0);
  const uploadTimersRef = useRef<number[]>([]);
  const menuItemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const shouldAutoScrollRef = useRef(true);

  const mentionCandidates = useMemo(
    () => buildMentionCandidates(conversation, messages),
    [conversation, messages],
  );

  const ac = useComposerAutocomplete({
    composerText,
    onComposerTextChange,
    mentionCandidates,
  });

  const updateScrollFlags = () => {
    const node = scrollRef.current;
    if (!node) return;
    const distanceFromBottom = node.scrollHeight - node.scrollTop - node.clientHeight;
    const nearBottom = distanceFromBottom < 80;
    setIsNearBottom(nearBottom);
    shouldAutoScrollRef.current = nearBottom;
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  };

  const scrollToUnread = () => {
    unreadRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  useEffect(() => {
    updateScrollFlags();
  }, []);

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      uploadTimersRef.current.forEach((id) => window.clearInterval(id));
      uploadTimersRef.current = [];
    };
  }, []);

  const handleComposerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (ac.handleComposerKeyDown(e)) return;
    if (showSlashHint && slashCommands.length > 0) {
      if (e.key === "Escape") {
        e.preventDefault();
        setShowSlashHint(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashActiveIndex((i) => (i + 1) % slashCommands.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashActiveIndex((i) => (i - 1 + slashCommands.length) % slashCommands.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const picked = slashCommands[slashActiveIndex] ?? slashCommands[0];
        if (picked) {
          onComposerTextChange(picked.insert);
          setShowSlashHint(false);
        }
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleComposerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    ac.onComposerInput(e);
    const value = e.target.value.trimStart();
    setShowSlashHint(value.startsWith("/"));
  };

  const quickEmojis = ["👍", "✅", "🔥", "🎯", "🙏", "👏", "🚧", "📌"];
  const quickTemplates = [
    "Daily update: Work completed, blockers, and next steps.",
    "RFI follow-up: Please provide clarification by EOD.",
    "Assigned task: @team please review and confirm owner.",
  ];

  const unreadStartIndex = useMemo(() => {
    if (!conversation || conversation.unread <= 0) return -1;
    return Math.max(0, messages.length - conversation.unread);
  }, [conversation, messages.length]);

  const pinnedMessages = useMemo(() => messages.filter((m) => m.pinned), [messages]);
  const slashCommands = useMemo(() => {
    if (!showSlashHint) return [];
    const query = composerText.trimStart().slice(1).toLowerCase();
    return SLASH_COMMANDS.filter((cmd) =>
      !query || cmd.id.includes(query) || cmd.label.toLowerCase().includes(query)
    );
  }, [composerText, showSlashHint]);
  const unreadAnchorGroupId = useMemo(() => {
    if (unreadStartIndex < 0) return null;
    let cursor = 0;
    for (const group of buildGroups(messages)) {
      const nextCursor = cursor + group.messages.length;
      if (unreadStartIndex >= cursor && unreadStartIndex < nextCursor) {
        return group.groupId;
      }
      cursor = nextCursor;
    }
    return null;
  }, [messages, unreadStartIndex]);

  const startMockUpload = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files).slice(0, 3);
    fileArray.forEach((file) => {
      const id = `up-${Date.now()}-${file.name}`;
      setUploads((prev) => [...prev, { id, name: file.name, progress: 0 }]);
      const timer = window.setInterval(() => {
        setUploads((prev) =>
          prev
            .map((u) =>
              u.id === id ? { ...u, progress: Math.min(100, u.progress + 18) } : u
            )
            .filter((u) => !(u.id === id && u.progress >= 100))
        );
      }, 240);
      uploadTimersRef.current.push(timer);
      window.setTimeout(() => window.clearInterval(timer), 1800);
    });
  };

  useEffect(() => {
    setSlashActiveIndex(0);
  }, [composerText, showSlashHint]);

  useEffect(() => {
    if (!menuMessageId) return;
    setMenuActiveIndex(0);
  }, [menuMessageId]);

  useEffect(() => {
    if (!menuMessageId) return;
    menuItemRefs.current[menuActiveIndex]?.focus();
  }, [menuActiveIndex, menuMessageId]);

  const closeMessageMenu = (focusTrigger = false) => {
    setMenuMessageId((prev) => {
      if (prev && focusTrigger) {
        menuTriggerRefs.current[prev]?.focus();
      }
      return null;
    });
  };

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const withinPanel = !!panelRef.current?.contains(target);
      if (!withinPanel) {
        closeMessageMenu(false);
        setShowTemplatePicker(false);
        setShowEmojiPicker(false);
        setShowSlashHint(false);
        ac.setDismissed(true);
        return;
      }
      if (!target.closest("[data-message-menu],[data-message-menu-trigger]")) {
        closeMessageMenu(false);
      }
      if (!target.closest("[data-composer-area]")) {
        setShowSlashHint(false);
        ac.setDismissed(true);
      }
    };
    const onEsc = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      closeMessageMenu(true);
      setShowTemplatePicker(false);
      setShowEmojiPicker(false);
      setShowSlashHint(false);
      ac.setDismissed(true);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [ac]);

  const handleAction = async (message: Message, actionId: MessageActionId) => {
    if (actionId === "copyText") {
      await navigator.clipboard.writeText(message.text);
      closeMessageMenu(false);
      return;
    }
    if (actionId === "copyLink") {
      const url = `${window.location.origin}/messages?chat=${message.conversationId}&message=${message.id}`;
      await navigator.clipboard.writeText(url);
      closeMessageMenu(false);
      return;
    }
    if (actionId === "quoteReply") {
      onComposerTextChange(`> ${message.text}\n${composerText}`.trim());
      closeMessageMenu(false);
      return;
    }
    if (actionId === "editMessage") {
      setEditingMessageId(message.id);
      setEditingText(message.text);
      closeMessageMenu(false);
      return;
    }
    if (actionId === "deleteMessage") {
      onDeleteMessage(message.id);
      closeMessageMenu(false);
    }
  };

  const openThread = (message: Message) => {
    setThreadMessage(message);
    setThreadDraft("");
  };

  const threadReplies = useMemo(() => {
    if (!threadMessage) return [];
    return [
      {
        id: `${threadMessage.id}-r1`,
        author: threadMessage.mine ? "Project Ops" : "You",
        text: "Acknowledged. Adding this to the thread for follow-up.",
        time: "now",
      },
      {
        id: `${threadMessage.id}-r2`,
        author: "System",
        text: "Thread created from channel message.",
        time: "now",
      },
    ];
  }, [threadMessage]);

  const toggleMessageMenu = (messageId: string) => {
    setMenuMessageId((prev) => {
      if (prev === messageId) return null;
      return messageId;
    });
  };

  const onMenuTriggerKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    messageId: string
  ) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (menuMessageId !== messageId) setMenuActiveIndex(0);
      setMenuMessageId(messageId);
    }
    if (e.key === "Escape") {
      e.preventDefault();
      closeMessageMenu(true);
    }
  };

  const onMenuKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    message: Message,
    mine: boolean
  ) => {
    const items = getMessageActionItems(mine);
    if (items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setMenuActiveIndex((i) => (i + 1) % items.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setMenuActiveIndex((i) => (i - 1 + items.length) % items.length);
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      setMenuActiveIndex(0);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      setMenuActiveIndex(items.length - 1);
      return;
    }
    if (e.key === "Escape" || e.key === "Tab") {
      closeMessageMenu(e.key === "Escape");
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const item = items[menuActiveIndex] ?? items[0];
      if (item) void handleAction(message, item.id);
    }
  };

  if (!conversation) {
    return (
      <section className="flex min-h-0 flex-1 flex-col items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-8 py-10 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand/10">
            <svg className="h-6 w-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-primary">Select a conversation</p>
          <p className="text-xs text-muted">Pick a channel or direct message to start chatting</p>
        </div>
      </section>
    );
  }

  const groups = buildGroups(messages);
  const isChannel = conversation.kind === "channel";
  const channelPrefix = isChannel ? "# " : "";
  const showDetailsTrigger =
    (conversation.kind === "channel" || conversation.kind === "group") &&
    !detailsOpen &&
    typeof onOpenDetails === "function";

  return (
    <section ref={panelRef} className="relative flex min-h-0 flex-1 flex-col bg-bg">
      {/* ── Header (52px — matches Messages sidebar + Details column) ── */}
      <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-border bg-surface px-4">
        <div className="flex min-h-0 min-w-0 flex-1 items-center gap-2.5">
          {isMobile ? (
            <button
              type="button"
              onClick={onBackToConversationList}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border bg-bg text-muted transition-colors hover:border-brand/40 hover:text-primary"
              aria-label="Back to conversations"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : null}
          {conversation.kind === "channel" ? (
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-bg text-[15px] font-bold text-muted">
              #
            </div>
          ) : (
            <div className="relative shrink-0">
              <Avatar name={conversation.title} color={conversation.avatarColor} size="sm" />
              {conversation.kind === "dm" && (
                <span
                  className={[
                    "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-surface",
                    conversation.online ? "bg-green-500" : "bg-border",
                  ].join(" ")}
                />
              )}
            </div>
          )}
          <div className="min-h-0 min-w-0 flex-1 py-0.5">
            <p className="truncate text-[14px] font-semibold leading-tight text-primary">
              {channelPrefix}
              {conversation.title}
            </p>
            <p className="truncate text-[11px] leading-tight text-muted">{presenceLine(conversation)}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {unreadStartIndex >= 0 ? (
            <button
              type="button"
              title="Jump to unread"
              onClick={scrollToUnread}
              className="hidden h-8 items-center rounded-md border border-brand/35 bg-brand/10 px-2.5 text-[11px] font-medium text-brand transition-colors hover:bg-brand/15 lg:flex"
            >
              Unread
            </button>
          ) : null}
          {/* Members */}
          <button
            type="button"
            title="Members"
            className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-bg px-2 text-[11.5px] text-secondary transition-colors hover:border-brand/40 hover:text-primary"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{conversation.members}</span>
          </button>

          {/* Search */}
          <button
            type="button"
            title="Search"
            className="grid h-8 w-8 place-items-center rounded-md border border-border bg-bg text-muted transition-colors hover:border-brand/40 hover:text-primary"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
          </button>

          {showDetailsTrigger ? (
            <button
              type="button"
              title="Open details"
              onClick={onOpenDetails}
              className="grid h-8 w-8 place-items-center rounded-md border border-border bg-bg text-muted transition-colors hover:border-brand/40 hover:text-primary"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          ) : null}
        </div>
      </header>

      {/* ── Messages ── */}
      <div
        ref={scrollRef}
        onScroll={updateScrollFlags}
        className="scrollbar-none min-h-0 flex-1 overflow-y-auto"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-2xl">
              {isChannel ? "🗂️" : "💬"}
            </div>
            <p className="mt-4 text-[14px] font-semibold text-primary">
              {isChannel ? `Welcome to #${conversation.title}` : `Chat with ${conversation.title}`}
            </p>
            <p className="mt-1 text-[13px] text-muted">{conversation.subtitle}</p>
          </div>
        ) : (
          <div className="space-y-0.5 py-4">
            {unreadStartIndex >= 0 ? (
              <div className="pointer-events-none sticky top-2 z-[2] mx-5 mb-2 inline-flex rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 text-[10px] font-semibold text-brand">
                New messages
              </div>
            ) : null}
            {groups.map((group, gi) => {
              const prevGroup = groups[gi - 1];
              const showDateSep =
                group.messages[0].date &&
                group.messages[0].date !== prevGroup?.messages[prevGroup.messages.length - 1]?.date;

              return (
                <div key={group.groupId}>
                  {unreadAnchorGroupId === group.groupId ? (
                    <div ref={unreadRef} className="px-5 pb-1 pt-2">
                      <div className="rounded-md border border-brand/30 bg-brand/10 px-2.5 py-1 text-[10px] font-semibold text-brand">
                        Start of unread messages
                      </div>
                    </div>
                  ) : null}
                  {showDateSep && (
                    <div className="flex items-center gap-3 px-5 py-3">
                      <div className="h-px flex-1 bg-border/60" />
                      <span className="rounded-full border border-border px-3 py-0.5 text-[11px] font-medium text-muted">
                        {group.messages[0].date}
                      </span>
                      <div className="h-px flex-1 bg-border/60" />
                    </div>
                  )}

                  {/* Message group */}
                  <div className="group relative flex items-start gap-3 px-5 py-1.5 transition-colors hover:bg-primary/[0.025]">
                    {/* Avatar column */}
                    <div className="mt-0.5 shrink-0">
                      <Avatar
                        name={group.mine ? "You" : group.author}
                        color={group.mine ? "bg-brand" : group.avatarColor}
                        size="md"
                      />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[13.5px] font-semibold text-primary">
                          {group.mine ? "You" : group.author}
                        </span>
                        <span className="text-[11px] text-muted">{group.messages[0].time}</span>
                      </div>

                      <div className="mt-0.5 space-y-0.5">
                        {group.messages.map((msg) => (
                          <div key={msg.id}>
                            {editingMessageId === msg.id ? (
                              <div className="mt-1 rounded-lg border border-brand/30 bg-surface p-2">
                                <textarea
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  rows={2}
                                  className="w-full resize-none bg-transparent text-[13px] text-primary outline-none"
                                />
                                <div className="mt-1.5 flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingMessageId(null);
                                      setEditingText("");
                                    }}
                                    className="rounded-md border border-border px-2 py-1 text-[11px] text-secondary"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onEditMessage(msg.id, editingText);
                                      setEditingMessageId(null);
                                      setEditingText("");
                                    }}
                                    className="rounded-md bg-brand px-2 py-1 text-[11px] font-semibold text-white"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[14px] leading-[1.55] text-primary/90">
                                {msg.text}
                              </p>
                            )}
                            {msg.attachments?.length ? (
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {msg.attachments.map((a: MessageAttachment) => (
                                  <span
                                    key={a.id}
                                    className="rounded-md border border-border bg-bg px-2 py-1 text-[11px] text-secondary"
                                  >
                                    {a.name} ({a.sizeKb} KB)
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {group.messages[group.messages.length - 1]?.reactions?.map((reaction) => (
                          <button
                            key={`${group.groupId}-${reaction.emoji}`}
                            type="button"
                            onClick={() => onReact(group.messages[group.messages.length - 1].id, reaction.emoji)}
                            className={[
                              "rounded-full border px-2 py-0.5 text-[11px] transition-colors",
                              reaction.mine
                                ? "border-brand/35 bg-brand/10 text-brand"
                                : "border-border bg-bg text-secondary hover:text-primary",
                            ].join(" ")}
                          >
                            {reaction.emoji} {reaction.count}
                          </button>
                        ))}
                        {group.mine ? (
                          <span className="text-[10.5px]">{statusIcon(group.messages[group.messages.length - 1]?.status)}</span>
                        ) : null}
                        {group.messages[group.messages.length - 1]?.threadCount ? (
                          <button
                            type="button"
                            onClick={() => openThread(group.messages[group.messages.length - 1])}
                            className="rounded-full border border-border bg-bg px-2 py-0.5 text-[11px] text-secondary hover:text-primary"
                          >
                            Reply in thread ({group.messages[group.messages.length - 1].threadCount})
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {/* Hover actions */}
                    <div className="absolute right-4 top-1 hidden items-center gap-0.5 rounded-lg border border-border bg-surface px-1.5 py-1 shadow-token-sm group-hover:flex">
                      <ToolbarBtn title="React">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden
                          onClick={() => onReact(group.messages[group.messages.length - 1].id, "👍")}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.75}
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </ToolbarBtn>
                      <ToolbarBtn title="Reply">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden
                          onClick={() => openThread(group.messages[group.messages.length - 1])}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.75}
                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                          />
                        </svg>
                      </ToolbarBtn>
                      <ToolbarBtn
                        title="More options"
                        dataMessageMenuTrigger
                        ariaHaspopup="menu"
                        ariaExpanded={
                          menuMessageId === group.messages[group.messages.length - 1].id
                        }
                        buttonRef={(el) => {
                          menuTriggerRefs.current[group.messages[group.messages.length - 1].id] = el;
                        }}
                        onClick={() =>
                          toggleMessageMenu(group.messages[group.messages.length - 1].id)
                        }
                        onKeyDown={(e) =>
                          onMenuTriggerKeyDown(
                            e,
                            group.messages[group.messages.length - 1].id
                          )
                        }
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.75}
                            d="M5 12h.01M12 12h.01M19 12h.01"
                          />
                        </svg>
                      </ToolbarBtn>
                      <ToolbarBtn title="Save message">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden
                          onClick={() => onToggleSaved(group.messages[group.messages.length - 1].id)}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </ToolbarBtn>
                      <ToolbarBtn title="Pin message">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden
                          onClick={() => onTogglePinned(group.messages[group.messages.length - 1].id)}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 4l4 4-4 4v5l-4-2-4 2v-5L4 8l4-4h8z" />
                        </svg>
                      </ToolbarBtn>
                    </div>
                    {menuMessageId === group.messages[group.messages.length - 1].id ? (
                      <div
                        data-message-menu
                        onKeyDown={(e) =>
                          onMenuKeyDown(
                            e,
                            group.messages[group.messages.length - 1],
                            !!group.mine
                          )
                        }
                        role="menu"
                        className="absolute right-4 top-10 z-[15] w-44 rounded-lg border border-border bg-surface p-1 shadow-token-xl"
                      >
                        {getMessageActionItems(!!group.mine).map((item, i) => (
                          <button
                            key={`${group.groupId}-${item.id}`}
                            type="button"
                            ref={(el) => {
                              menuItemRefs.current[i] = el;
                            }}
                            onClick={() =>
                              handleAction(group.messages[group.messages.length - 1], item.id)
                            }
                            role="menuitem"
                            tabIndex={i === menuActiveIndex ? 0 : -1}
                            className={[
                              "w-full rounded-md px-2.5 py-1.5 text-left text-[12px] transition-colors",
                              item.danger
                                ? "text-danger hover:bg-danger/10"
                                : "text-secondary hover:bg-bg hover:text-primary",
                            ].join(" ")}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
            {typingLabel ? (
              <div className="px-5 pb-2 text-[12px] text-muted">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
                  {typingLabel}
                </span>
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
      {!isNearBottom ? (
        <button
          type="button"
          onClick={() => scrollToBottom()}
          className="absolute bottom-28 right-5 z-[5] inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-surface px-3 py-1.5 text-[11px] font-medium text-brand shadow-token-sm transition-colors hover:bg-brand/10"
        >
          Jump to latest
        </button>
      ) : null}

      {/* ── Composer ── */}
      <div className="shrink-0 border-t border-border px-4 py-3">
        {pinnedMessages.length > 0 ? (
          <div className="mb-2 flex items-center justify-between rounded-lg border border-brand/25 bg-brand/10 px-3 py-1.5 text-[11px]">
            <span className="text-brand">Pinned: {pinnedMessages[0].text.slice(0, 54)}...</span>
            <button
              type="button"
              onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="text-brand/90 hover:text-brand"
            >
              Jump
            </button>
          </div>
        ) : null}
        <div className="overflow-hidden rounded-xl border border-border bg-surface transition-all focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/10">
          {/* Formatting toolbar */}
          <div className="flex items-center gap-0.5 border-b border-border/60 px-2.5 py-1.5">
            <ToolbarBtn title="Bold">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"
                />
              </svg>
            </ToolbarBtn>
            <ToolbarBtn title="Italic">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4M8 20h4M14 4l-4 16" />
              </svg>
            </ToolbarBtn>
            <ToolbarBtn title="Strikethrough">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M9 6s-.5 3 3 3 4.5 3 3 6-4 3-4 3M9 6c0 0 .5-2 3-2s3 2 3 2"
                />
              </svg>
            </ToolbarBtn>

            <div className="mx-1 h-4 w-px bg-border" />

            <ToolbarBtn title="Link">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                />
              </svg>
            </ToolbarBtn>
            <ToolbarBtn title="Bullet list">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </ToolbarBtn>
            <ToolbarBtn title="Code block">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </ToolbarBtn>
            <ToolbarBtn title="Quick templates">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
                onClick={() => setShowTemplatePicker((v) => !v)}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 8h10M7 12h10M7 16h7M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
              </svg>
            </ToolbarBtn>
          </div>
          {showTemplatePicker ? (
            <div className="border-b border-border/60 bg-bg px-2.5 py-2">
              <div className="space-y-1">
                {quickTemplates.map((template) => (
                  <button
                    key={template}
                    type="button"
                    onClick={() => {
                      onComposerTextChange(template);
                      setShowTemplatePicker(false);
                    }}
                    className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-left text-[12px] text-secondary hover:text-primary"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Text area + @ / : autocomplete */}
          <div data-composer-area className="relative">
            <textarea
              ref={ac.textareaRef}
              value={composerText}
              onChange={handleComposerChange}
              onKeyDown={handleComposerKeyDown}
              onSelect={ac.syncCursorFromDom}
              onKeyUp={ac.syncCursorFromDom}
              onClick={ac.syncCursorFromDom}
              placeholder={
                conversation.kind === "channel"
                  ? `Message #${conversation.title}`
                  : `Message ${conversation.title}`
              }
              rows={2}
              className="w-full resize-none bg-transparent px-4 py-2.5 text-[14px] leading-[1.5] text-primary outline-none placeholder:text-muted"
              aria-autocomplete={ac.open ? "list" : undefined}
              aria-controls={ac.open ? "composer-autocomplete" : undefined}
              aria-expanded={ac.open}
            />
            {ac.open ? (
              <ul
                id="composer-autocomplete"
                role="listbox"
                className="absolute bottom-full left-2 right-2 z-30 mb-1 max-h-40 overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-token-lg"
              >
                {ac.trigger.kind === "mention"
                  ? ac.mentionItems.map((row, i) => (
                      <li key={row.id} role="option" aria-selected={i === ac.activeIndex}>
                        <button
                          type="button"
                          className={[
                            "flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12.5px]",
                            i === ac.activeIndex ? "bg-brand/12 text-primary" : "text-secondary hover:bg-bg",
                          ].join(" ")}
                          onMouseEnter={() => ac.setActiveIndex(i)}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => ac.insertMention(row.label)}
                        >
                          <span className="font-medium">@{row.label}</span>
                        </button>
                      </li>
                    ))
                  : ac.emojiItems.map((row, i) => (
                      <li key={row.key} role="option" aria-selected={i === ac.activeIndex}>
                        <button
                          type="button"
                          className={[
                            "flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-[12.5px]",
                            i === ac.activeIndex ? "bg-brand/12 text-primary" : "text-secondary hover:bg-bg",
                          ].join(" ")}
                          onMouseEnter={() => ac.setActiveIndex(i)}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => ac.insertEmoji(row.emoji)}
                        >
                          <span className="text-base">{row.emoji}</span>
                          <span className="font-mono text-[11px] text-muted">:{row.key}</span>
                        </button>
                      </li>
                    ))}
              </ul>
            ) : null}
          </div>
          {showSlashHint && slashCommands.length > 0 ? (
            <div
              data-composer-area
              className="border-t border-border/60 bg-bg px-2 py-2"
            >
              <div className="space-y-1">
                {slashCommands.map((cmd, idx) => (
                  <button
                    key={cmd.id}
                    type="button"
                    onMouseEnter={() => setSlashActiveIndex(idx)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onComposerTextChange(cmd.insert);
                      setShowSlashHint(false);
                    }}
                    className={[
                      "w-full rounded-md px-2.5 py-1.5 text-left transition-colors",
                      idx === slashActiveIndex
                        ? "bg-brand/12 text-primary"
                        : "text-secondary hover:bg-surface hover:text-primary",
                    ].join(" ")}
                  >
                    <p className="text-[12px] font-medium">{cmd.label}</p>
                    <p className="text-[10.5px] text-muted">{cmd.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {uploads.length > 0 ? (
            <div className="border-t border-border/60 bg-bg px-3 py-2">
              <div className="space-y-1">
                {uploads.map((u) => (
                  <div key={u.id} className="flex items-center gap-2">
                    <span className="w-36 truncate text-[11px] text-secondary">{u.name}</span>
                    <div className="h-1.5 flex-1 rounded-full bg-border">
                      <div
                        className="h-1.5 rounded-full bg-brand transition-all"
                        style={{ width: `${u.progress}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-[10px] text-muted">{u.progress}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Bottom actions */}
          <div className="flex items-center justify-between border-t border-border/60 px-2.5 py-1.5">
            <div className="flex items-center gap-0.5">
              <ToolbarBtn title="Emoji">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                  onClick={() => setShowEmojiPicker((v) => !v)}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </ToolbarBtn>
              <ToolbarBtn title="Attach file">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => startMockUpload(e.target.files)}
                  />
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                </label>
              </ToolbarBtn>
              <ToolbarBtn title="Insert mention">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                  onClick={() => ac.insertRawAtCursor("@")}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              </ToolbarBtn>
            </div>

            <button
              type="button"
              onClick={onSend}
              disabled={!composerText.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-1.5 text-[12.5px] font-semibold text-white shadow-sm transition-all hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>Send</span>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
          {showEmojiPicker ? (
            <div className="border-t border-border/60 bg-bg px-3 py-2">
              <div className="flex flex-wrap gap-1.5">
                {quickEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onComposerTextChange(`${composerText}${emoji}`);
                      setShowEmojiPicker(false);
                    }}
                    className="rounded-md border border-border bg-surface px-2 py-1 text-[14px] hover:border-brand/30"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <p className="mt-1.5 text-center text-[10.5px] text-muted/50">
          <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift+Enter</kbd> new line ·{" "}
          <kbd className="font-mono">@</kbd> people · <kbd className="font-mono">:</kbd> emoji
        </p>
      </div>
      {threadMessage ? (
        <>
          <button
            type="button"
            className="absolute inset-x-0 bottom-0 top-[52px] z-[22] bg-black/35 xl:hidden"
            onClick={() => setThreadMessage(null)}
            aria-label="Close thread panel"
          />
          <aside
            className={[
              "absolute bottom-0 right-0 top-[52px] z-[23] flex w-full max-w-[420px] flex-col border-l border-border bg-surface shadow-token-xl transition-transform duration-200",
              threadMessage ? "translate-x-0" : "translate-x-full",
            ].join(" ")}
          >
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-3">
              <div>
                <p className="text-[13px] font-semibold text-primary">Thread</p>
                <p className="text-[10.5px] text-muted">Focused conversation</p>
              </div>
              <button
                type="button"
                onClick={() => setThreadMessage(null)}
                className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-bg hover:text-primary"
                aria-label="Close thread panel"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-3 py-3">
              <div className="rounded-lg border border-border bg-bg p-2.5">
                <p className="text-[11px] font-semibold text-primary">{threadMessage.author}</p>
                <p className="mt-1 text-[12px] text-secondary">{threadMessage.text}</p>
              </div>
              <div className="mt-3 space-y-2">
                {threadReplies.map((reply) => (
                  <div key={reply.id} className="rounded-lg border border-border/80 bg-surface px-2.5 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold text-primary">{reply.author}</p>
                      <p className="text-[10px] text-muted">{reply.time}</p>
                    </div>
                    <p className="mt-1 text-[12px] text-secondary">{reply.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0 border-t border-border px-3 py-2.5">
              <textarea
                value={threadDraft}
                onChange={(e) => setThreadDraft(e.target.value)}
                rows={2}
                placeholder="Reply in thread"
                className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 text-[12.5px] text-primary outline-none placeholder:text-muted focus:border-brand/40"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!threadDraft.trim()) return;
                    setThreadDraft("");
                  }}
                  className="rounded-md bg-brand px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-40"
                  disabled={!threadDraft.trim()}
                >
                  Reply
                </button>
              </div>
            </div>
          </aside>
        </>
      ) : null}
    </section>
  );
}
