import { useCallback, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { ProjectUiProvider } from "@/components/project/ProjectUiProvider";
import {
  SidebarLayoutProvider,
  useSidebarLayout,
} from "./SidebarLayoutContext";
import { GlobalSearchProvider } from "@/components/layout/GlobalSearchContext";
import {
  AiAssistantProvider,
  AiAssistantWorkspace,
} from "@/components/ai-assistant";

/** Max horizontal distance from left screen edge to start an edge-swipe (ChatGPT / Claude style). */
const MOBILE_EDGE_SWIPE_START_PX = 40;
/** Drag distance (px) past which the drawer opens on release. */
const MOBILE_DRAWER_OPEN_THRESHOLD_PX = 72;
const MOBILE_DRAG_MAX_PX = 320;

function DashboardShell() {
  const {
    collapsed,
    mobileOpen,
    setMobileOpen,
    mobileDragOffset,
    setMobileDragOffset,
  } = useSidebarLayout();
  const dragStartRef = useRef<number | null>(null);
  const dragOffsetRef = useRef(0);
  const edgeListenersAttachedRef = useRef(false);
  const edgeSwipeCleanupRef = useRef<(() => void) | null>(null);

  const mobileOverlayVisible = mobileOpen || mobileDragOffset > 0;
  const mobileOverlayOpacity = mobileOpen
    ? 1
    : Math.min(mobileDragOffset / 180, 0.9);

  const beginMobileDrag = useCallback((clientX: number) => {
    dragStartRef.current = clientX;
    dragOffsetRef.current = 0;
    setMobileDragOffset(0);
  }, [setMobileDragOffset]);

  const updateMobileDrag = useCallback(
    (clientX: number) => {
      if (dragStartRef.current == null) return;
      const offset = Math.max(
        0,
        Math.min(clientX - dragStartRef.current, MOBILE_DRAG_MAX_PX),
      );
      dragOffsetRef.current = offset;
      setMobileDragOffset(offset);
    },
    [setMobileDragOffset],
  );

  const finishMobileDrag = useCallback(() => {
    if (dragStartRef.current == null) return;
    const shouldOpen = dragOffsetRef.current > MOBILE_DRAWER_OPEN_THRESHOLD_PX;
    dragStartRef.current = null;
    dragOffsetRef.current = 0;
    setMobileOpen(shouldOpen);
    setMobileDragOffset(0);
  }, [setMobileOpen, setMobileDragOffset]);

  useEffect(
    () => () => {
      edgeSwipeCleanupRef.current?.();
      edgeSwipeCleanupRef.current = null;
    },
    [],
  );

  const handleEdgeSwipeTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (mobileOpen) return;
      const x0 = e.touches[0]?.clientX ?? 999;
      if (x0 > MOBILE_EDGE_SWIPE_START_PX) return;
      if (edgeListenersAttachedRef.current) return;
      edgeListenersAttachedRef.current = true;
      beginMobileDrag(x0);

      const onMove = (ev: TouchEvent) => {
        const x = ev.touches[0]?.clientX;
        if (x == null) return;
        updateMobileDrag(x);
      };
      const onEnd = () => {
        edgeListenersAttachedRef.current = false;
        edgeSwipeCleanupRef.current = null;
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onEnd);
        window.removeEventListener("touchcancel", onEnd);
        finishMobileDrag();
      };

      edgeSwipeCleanupRef.current = () => {
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onEnd);
        window.removeEventListener("touchcancel", onEnd);
      };

      window.addEventListener("touchmove", onMove, { passive: true });
      window.addEventListener("touchend", onEnd);
      window.addEventListener("touchcancel", onEnd);
    },
    [mobileOpen, beginMobileDrag, updateMobileDrag, finishMobileDrag],
  );

  const handleThumbStart = (clientX: number) => {
    beginMobileDrag(clientX);
  };

  const handleThumbMove = (clientX: number) => {
    updateMobileDrag(clientX);
  };

  const handleThumbEnd = () => {
    finishMobileDrag();
  };

  return (
    <>
      {/* Mobile backdrop — closes drawer when tapping outside */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden",
          "transition-opacity duration-200",
          mobileOverlayVisible ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        style={{ opacity: mobileOverlayOpacity }}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />

      {/* Left-edge swipe zone (mobile): drag from screen edge to open drawer — ChatGPT / Claude style */}
      {!mobileOpen && (
        <div
          className="fixed inset-y-0 start-0 z-[45] w-10 min-w-[2.25rem] touch-pan-y ps-[env(safe-area-inset-left,0px)] lg:hidden"
          aria-hidden
          onTouchStart={handleEdgeSwipeTouchStart}
        />
      )}

      {/* Mobile edge thumb — tap or short drag to reveal the drawer */}
      {!mobileOpen && (
        <div
          className="fixed left-0 top-1/2 z-[45] -translate-y-1/2 lg:hidden"
          aria-hidden
          onTouchStart={(e) => handleThumbStart(e.touches[0]?.clientX ?? 0)}
          onTouchMove={(e) => handleThumbMove(e.touches[0]?.clientX ?? 0)}
          onTouchEnd={handleThumbEnd}
          onTouchCancel={handleThumbEnd}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="group flex h-16 w-5 items-center justify-center rounded-r-full border border-l-0 border-border/60 bg-sidebar/95 shadow-token-md backdrop-blur-sm transition-colors"
            aria-label="Open sidebar"
          >
            <span className="h-8 w-1 rounded-full bg-border/80 transition-colors group-hover:bg-brand/50" />
          </button>
        </div>
      )}

      <Sidebar />

      {/* Main content: no left padding on mobile (sidebar is overlay); push only on lg+ */}
      <AiAssistantProvider>
        <div
          className={`flex h-full min-h-0 min-w-0 flex-col overflow-x-hidden transition-[padding] duration-200 ease-out ${
            collapsed ? "lg:ps-14" : "lg:ps-60"
          }`}
        >
          <EmailVerificationBanner />
          <Header />
          <AiAssistantWorkspace>
            <Outlet />
          </AiAssistantWorkspace>
        </div>
      </AiAssistantProvider>
    </>
  );
}

export function DashboardLayout() {
  const { pathname } = useLocation();
  const projectMatch = pathname.match(/^\/projects\/([^/]+)/);
  const projectId = projectMatch?.[1];

  return (
    <div className="h-dvh max-h-dvh overflow-hidden bg-bg">
      <SidebarLayoutProvider>
        <GlobalSearchProvider>
          {projectId ? (
            <ProjectUiProvider projectId={projectId}>
              <DashboardShell />
            </ProjectUiProvider>
          ) : (
            <DashboardShell />
          )}
        </GlobalSearchProvider>
      </SidebarLayoutProvider>
    </div>
  );
}
