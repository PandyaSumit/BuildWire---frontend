import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { ChatPanel } from "./ChatPanel";
import { ChatDetailsPanel } from "./ChatDetailsPanel";
import { ConversationList } from "./ConversationList";
import { CreateConversationDialog } from "./CreateConversationDialog";
import type { ConversationKind, MessagesWorkspaceMode } from "./types";
import { useMessagesState } from "./useMessagesState";

const SIDEBAR_MIN = 200;
const SIDEBAR_MAX = 400;
const SIDEBAR_DEFAULT = 272;
const STORAGE_KEY = "bw.messages.sidebarWidth";

function useResizableSidebar() {
  const [width, setWidth] = useState<number>(() => {
    if (typeof window === "undefined") return SIDEBAR_DEFAULT;
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    return saved >= SIDEBAR_MIN && saved <= SIDEBAR_MAX
      ? saved
      : SIDEBAR_DEFAULT;
  });

  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);
  const latestWidth = useRef(width);
  latestWidth.current = width;

  const onHandleMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = latestWidth.current;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    e.preventDefault();
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const next = Math.min(
        SIDEBAR_MAX,
        Math.max(SIDEBAR_MIN, startW.current + (e.clientX - startX.current)),
      );
      setWidth(next);
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      localStorage.setItem(STORAGE_KEY, String(latestWidth.current));
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, []);

  return { width, onHandleMouseDown };
}

export function MessagesWorkspace({ mode }: { mode: MessagesWorkspaceMode }) {
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  const selectedIdFromUrl = useMemo(
    () => new URLSearchParams(location.search).get("chat"),
    [location.search],
  );

  const {
    visibleConversations,
    selectedConversation,
    selectedMessages,
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
    typingLabel,
  } = useMessagesState(mode);

  const [dialogKind, setDialogKind] = useState<ConversationKind | null>(null);
  const [dialogName, setDialogName] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const { width: sidebarWidth, onHandleMouseDown } = useResizableSidebar();

  useEffect(() => {
    const fallbackId = visibleConversations[0]?.id;
    if (!fallbackId) return;

    const normalizedId =
      selectedIdFromUrl &&
      visibleConversations.some((c) => c.id === selectedIdFromUrl)
        ? selectedIdFromUrl
        : fallbackId;

    setSelectedConversationId(normalizedId);

    if (selectedIdFromUrl !== normalizedId) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("chat", normalizedId);
          return next;
        },
        { replace: true },
      );
    }
  }, [
    selectedIdFromUrl,
    visibleConversations,
    setSearchParams,
    setSelectedConversationId,
  ]);

  useEffect(() => {
    if (selectedConversation?.kind === "dm") {
      setDetailsOpen(false);
    }
  }, [selectedConversation?.id, selectedConversation?.kind]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Use a wider breakpoint so split-view doesn't feel cramped on tablets/smaller laptops.
    const apply = () => setIsMobileViewport(window.innerWidth < 1024);
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  useEffect(() => {
    if (!isMobileViewport) return;
    // On mobile, show list first (no drawer).
    setMobileView("list");
  }, [isMobileViewport]);

  const handleSelect = (id: string) => {
    setSelectedConversationId(id);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("chat", id);
      return next;
    });
    const conv = visibleConversations.find((c) => c.id === id);
    if (conv?.kind === "channel" || conv?.kind === "group") {
      setDetailsOpen(true);
    } else {
      setDetailsOpen(false);
    }
    if (isMobileViewport) {
      setMobileView("chat");
    }
  };

  const handleCreate = () => {
    if (!dialogKind) return;
    createConversation(dialogKind, dialogName);
    setDialogName("");
    setDialogKind(null);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-row overflow-hidden">
      {isMobileViewport && mobileView === "list" ? (
        <div className="flex min-h-0 w-full flex-1 flex-col">
          <ConversationList
            conversations={visibleConversations}
            selectedId={selectedConversation?.id ?? null}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSelect={handleSelect}
            onCreateChannel={() => setDialogKind("channel")}
            onCreateGroup={() => setDialogKind("group")}
            onCreateDM={() => setDialogKind("dm")}
          />
        </div>
      ) : null}

      {/* ── LEFT: Resizable Conversation Sidebar ── */}
      <div
        className="relative hidden min-h-0 shrink-0 lg:flex lg:flex-col"
        style={{ width: sidebarWidth }}
      >
        <ConversationList
          conversations={visibleConversations}
          selectedId={selectedConversation?.id ?? null}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSelect={handleSelect}
          onCreateChannel={() => setDialogKind("channel")}
          onCreateGroup={() => setDialogKind("group")}
          onCreateDM={() => setDialogKind("dm")}
        />

        {/* Resize handle */}
        <div
          onMouseDown={onHandleMouseDown}
          className="group absolute right-0 top-0 z-10 flex h-full cursor-col-resize items-center justify-center"
          title="Drag to resize"
        >
          <div className="h-full w-px bg-border/60 transition-all group-hover:w-[3px] group-hover:bg-brand/50 group-active:w-[3px] group-active:bg-brand/70" />
        </div>
      </div>

      {/* ── CENTER: Chat Panel ── */}
      <div
        className={`${isMobileViewport && mobileView !== "chat" ? "hidden" : "flex"} min-w-0 flex-1 flex-col overflow-hidden`}
      >
        <ChatPanel
          conversation={selectedConversation}
          messages={selectedMessages}
          composerText={composerText}
          onComposerTextChange={setComposerText}
          onSend={sendMessage}
          onReact={toggleReaction}
          onToggleSaved={toggleSaved}
          onTogglePinned={togglePinned}
          typingLabel={typingLabel}
          isMobile={isMobileViewport}
          onBackToConversationList={() => setMobileView("list")}
          detailsOpen={detailsOpen}
          onOpenDetails={() => setDetailsOpen(true)}
        />
      </div>

      {/* ── RIGHT: Details Panel (xl+) — opens from channel/group list selection or info control ── */}
      {detailsOpen ? (
        <div className="hidden min-h-0 w-[268px] shrink-0 xl:flex xl:flex-col">
          <ChatDetailsPanel
            conversation={selectedConversation}
            onClose={() => setDetailsOpen(false)}
          />
        </div>
      ) : null}

      {/* Mobile details drawer intentionally removed.
          Mobile flow is now list -> full conversation, with explicit back navigation. */}

      <CreateConversationDialog
        kind={dialogKind}
        name={dialogName}
        onNameChange={setDialogName}
        onClose={() => {
          setDialogKind(null);
          setDialogName("");
        }}
        onCreate={handleCreate}
      />
    </div>
  );
}
