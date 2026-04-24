import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { ChatPanel } from "./ChatPanel";
import { ChatDetailsPanel } from "./ChatDetailsPanel";
import { ConversationList } from "./ConversationList";
import { CreateConversationDialog } from "./CreateConversationDialog";
import { MESSAGES_LAYOUT } from "./layoutConfig";
import type { ConversationKind, MessagesWorkspaceMode } from "./types";
import { useMessagesState } from "./useMessagesState";
import { useMessagesViewport } from "./useMessagesViewport";
import { useMessagesShortcuts } from "./useMessagesShortcuts";

function useResizableSidebar() {
  const [width, setWidth] = useState<number>(() => {
    if (typeof window === "undefined") return MESSAGES_LAYOUT.sidebar.default;
    const saved = Number(localStorage.getItem(MESSAGES_LAYOUT.sidebar.storageKey));
    return (
      saved >= MESSAGES_LAYOUT.sidebar.min && saved <= MESSAGES_LAYOUT.sidebar.max
    )
      ? saved
      : MESSAGES_LAYOUT.sidebar.default;
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
        MESSAGES_LAYOUT.sidebar.max,
        Math.max(
          MESSAGES_LAYOUT.sidebar.min,
          startW.current + (e.clientX - startX.current),
        ),
      );
      setWidth(next);
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      localStorage.setItem(
        MESSAGES_LAYOUT.sidebar.storageKey,
        String(latestWidth.current),
      );
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
    editMessage,
    deleteMessage,
    createConversation,
    typingLabel,
  } = useMessagesState(mode);

  const [dialogKind, setDialogKind] = useState<ConversationKind | null>(null);
  const [dialogName, setDialogName] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [openPaletteSignal, setOpenPaletteSignal] = useState(0);
  const { isCompact: isMobileViewport } = useMessagesViewport();

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

  useMessagesShortcuts({
    onOpenJumpPalette: () => {
      if (isMobileViewport) setMobileView("list");
      setOpenPaletteSignal((v) => v + 1);
    },
  });

  const listProps = {
    conversations: visibleConversations,
    selectedId: selectedConversation?.id ?? null,
    searchQuery,
    onSearchQueryChange: setSearchQuery,
    onSelect: handleSelect,
    onCreateChannel: () => setDialogKind("channel"),
    onCreateGroup: () => setDialogKind("group"),
    onCreateDM: () => setDialogKind("dm"),
    openPaletteSignal,
  } as const;

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-row overflow-hidden">
      {isMobileViewport && mobileView === "list" ? (
        <div className="flex min-h-0 w-full flex-1 flex-col">
          <ConversationList {...listProps} />
        </div>
      ) : null}

      {/* ── LEFT: Resizable Conversation Sidebar ── */}
      <div
        className="relative hidden min-h-0 shrink-0 lg:flex lg:flex-col"
        style={{ width: sidebarWidth }}
      >
        <ConversationList {...listProps} />

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
          onEditMessage={editMessage}
          onDeleteMessage={deleteMessage}
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
