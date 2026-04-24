import { useEffect, useMemo, useRef, useState } from "react";
import type { Conversation, Message, MessageAttachment } from "./types";

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
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
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
  typingLabel,
  isMobile = false,
  onBackToConversationList,
  detailsOpen = false,
  onOpenDetails,
}: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showSlashHint, setShowSlashHint] = useState(false);
  const [threadMessage, setThreadMessage] = useState<Message | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const uploadTimersRef = useRef<number[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      uploadTimersRef.current.forEach((id) => window.clearInterval(id));
      uploadTimersRef.current = [];
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleComposerChange = (value: string) => {
    onComposerTextChange(value);
    setShowSlashHint(value.trimStart().startsWith("/"));
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
    <section className="relative flex min-h-0 flex-1 flex-col bg-bg">
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
      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto">
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
                            <p className="text-[14px] leading-[1.55] text-primary/90">
                              {msg.text}
                            </p>
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
                            onClick={() => setThreadMessage(group.messages[group.messages.length - 1])}
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
                          onClick={() => setThreadMessage(group.messages[group.messages.length - 1])}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.75}
                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                          />
                        </svg>
                      </ToolbarBtn>
                      <ToolbarBtn title="More options">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
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

          {/* Text area */}
          <textarea
            value={composerText}
            onChange={(e) => handleComposerChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              conversation.kind === "channel"
                ? `Message #${conversation.title}`
                : `Message ${conversation.title}`
            }
            rows={2}
            className="w-full resize-none bg-transparent px-4 py-2.5 text-[14px] leading-[1.5] text-primary outline-none placeholder:text-muted"
          />
          {showSlashHint ? (
            <div className="border-t border-border/60 bg-bg px-3 py-2 text-[11px] text-secondary">
              Commands: <code>/assign</code>, <code>/rfi</code>, <code>/meeting</code>
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
              <ToolbarBtn title="Mention">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
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
          <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift+Enter</kbd> for new line
        </p>
      </div>
      {threadMessage ? (
        <aside className="absolute right-4 top-16 z-[20] hidden w-[320px] rounded-xl border border-border bg-surface p-3 shadow-token-xl xl:block">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-primary">Thread</h4>
            <button
              type="button"
              onClick={() => setThreadMessage(null)}
              className="text-[11px] text-muted hover:text-primary"
            >
              Close
            </button>
          </div>
          <p className="text-[12px] text-secondary">{threadMessage.text}</p>
          <div className="mt-2 rounded-md border border-dashed border-border p-2 text-[11px] text-muted">
            Thread replies (mock): add focused discussion here.
          </div>
        </aside>
      ) : null}
    </section>
  );
}
