import { useEffect, useRef, useState, type ReactNode } from "react";
import { BuildWireLogo } from "@/components/brand/BuildWireLogo";
import { WorkspaceSwitcherButton } from "@/components/workspace-switcher";
import type { Conversation } from "@/types/chat";

type ConversationListProps = {
  conversations: Conversation[];
  selectedId: string | null;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSelect: (id: string) => void;
  onCreateChannel: () => void;
  onCreateGroup: () => void;
  onCreateDM: () => void;
  /** Increment from parent (e.g. Ctrl+K) to focus search without opening an overlay. */
  focusSearchSignal?: number;
};

function Avatar({ name, color }: { name: string; color?: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className={`grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[5px] text-[11px] font-bold text-white ${color ?? "bg-brand"}`}
    >
      {initials}
    </span>
  );
}

function Section({
  label,
  onAdd,
  addTooltip,
  children,
}: {
  label: string;
  onAdd?: () => void;
  addTooltip?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-1">
      <div className="group flex h-7 items-center justify-between px-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted/70 transition-colors hover:text-secondary"
        >
          <svg
            className={`h-2.5 w-2.5 shrink-0 transition-transform duration-150 ${open ? "" : "-rotate-90"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          {label}
        </button>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            title={addTooltip}
            className="rounded p-0.5 text-muted opacity-0 transition-all hover:text-primary group-hover:opacity-100"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>
      {open && <div>{children}</div>}
    </div>
  );
}

function ConvItem({
  conv,
  active,
  onSelect,
}: {
  conv: Conversation;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(conv.id)}
      className={[
        "flex w-full items-center gap-2.5 rounded-md px-3 py-[5px] text-left transition-colors duration-100",
        active
          ? "bg-brand/15 text-primary"
          : conv.unread > 0
          ? "text-primary hover:bg-primary/6"
          : "text-secondary/60 hover:bg-primary/5 hover:text-secondary",
      ].join(" ")}
    >
      {conv.kind === "channel" ? (
        <span className="grid h-[26px] w-[26px] shrink-0 place-items-center text-[17px] font-medium text-muted/70">
          #
        </span>
      ) : conv.kind === "dm" ? (
        <div className="relative shrink-0">
          <Avatar name={conv.title} color={conv.avatarColor} />
          <span
            className={[
              "absolute -bottom-0.5 -right-0.5 h-[9px] w-[9px] rounded-full ring-[2px] ring-sidebar",
              conv.online ? "bg-green-500" : "bg-border",
            ].join(" ")}
          />
        </div>
      ) : (
        <Avatar name={conv.title} color={conv.avatarColor} />
      )}

      <div className="flex min-w-0 flex-1 items-center justify-between gap-1">
        <span
          className={[
            "truncate text-[13px] leading-snug",
            conv.unread > 0 ? "font-semibold text-primary" : "font-medium",
          ].join(" ")}
        >
          {conv.title}
        </span>
        {conv.unread > 0 ? (
          <span className="shrink-0 rounded-full bg-brand px-[5px] py-px text-[10px] font-bold leading-tight text-white">
            {conv.unread}
          </span>
        ) : (
          <span className="shrink-0 text-[10.5px] text-muted/50">{conv.updatedAt}</span>
        )}
      </div>
    </button>
  );
}

export function ConversationList({
  conversations,
  selectedId,
  searchQuery,
  onSearchQueryChange,
  onSelect,
  onCreateChannel,
  onCreateGroup,
  onCreateDM,
  focusSearchSignal = 0,
}: ConversationListProps) {
  const channels = conversations.filter((c) => c.kind === "channel");
  const groups = conversations.filter((c) => c.kind === "group");
  const dms = conversations.filter((c) => c.kind === "dm");
  const searching = searchQuery.trim().length > 0;
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusSearchSignal === 0) return;
    const el = searchInputRef.current;
    if (!el) return;
    el.focus();
    el.select();
  }, [focusSearchSignal]);

  return (
    <aside className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-sidebar">
      {/* ── Brand + Workspace Switcher Header ── */}
      <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-border px-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand shadow-token-sm">
            <BuildWireLogo size={16} decorative />
          </div>
          <span className="text-[14px] font-semibold tracking-tight text-primary">
            Messages
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <button
            type="button"
            className="relative grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-primary/8 hover:text-primary"
            aria-label="Notifications"
          >
            <svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute right-1.5 top-1.5 h-[7px] w-[7px] rounded-full bg-danger ring-[1.5px] ring-sidebar" />
          </button>
          {/* 9-dot workspace switcher — the only thing that links back to other workspaces */}
          <WorkspaceSwitcherButton />
        </div>
      </div>

      {/* ── Search ── */}
      <div className="shrink-0 px-3 pb-2 pt-3">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search conversations · Ctrl+K"
            className="h-8 w-full rounded-md border border-border/50 bg-bg/50 pl-8 pr-3 text-[12.5px] text-primary outline-none placeholder:text-muted focus:border-brand/50 focus:bg-bg focus:ring-1 focus:ring-brand/20 transition-all"
          />
        </div>
      </div>

      {/* ── Conversation Sections ── */}
      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto py-1">
        {searching ? (
          <div className="px-2">
            {conversations.length > 0 ? (
              <>
                <p className="px-3 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted/60">
                  Results
                </p>
                {conversations.map((c) => (
                  <ConvItem key={c.id} conv={c} active={selectedId === c.id} onSelect={onSelect} />
                ))}
              </>
            ) : (
              <p className="px-3 py-3 text-[12px] text-muted">No conversations found.</p>
            )}
          </div>
        ) : (
          <>
            {channels.length > 0 && (
              <Section label="Channels" onAdd={onCreateChannel} addTooltip="Add a channel">
                <div className="px-2">
                  {channels.map((c) => (
                    <ConvItem key={c.id} conv={c} active={selectedId === c.id} onSelect={onSelect} />
                  ))}
                </div>
              </Section>
            )}

            {groups.length > 0 && (
              <Section label="Groups" onAdd={onCreateGroup} addTooltip="Create a group">
                <div className="px-2">
                  {groups.map((c) => (
                    <ConvItem key={c.id} conv={c} active={selectedId === c.id} onSelect={onSelect} />
                  ))}
                </div>
              </Section>
            )}

            {dms.length > 0 && (
              <Section label="Direct Messages" onAdd={onCreateDM} addTooltip="New message">
                <div className="px-2">
                  {dms.map((c) => (
                    <ConvItem key={c.id} conv={c} active={selectedId === c.id} onSelect={onSelect} />
                  ))}
                </div>
              </Section>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
