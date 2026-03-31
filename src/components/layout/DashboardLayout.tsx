import { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { ProjectUiProvider } from "@/features/project-ui/ProjectUiContext";
import {
  SidebarLayoutProvider,
  useSidebarLayout,
} from "./SidebarLayoutContext";
import { GlobalSearchProvider } from "@/components/layout/GlobalSearchContext";

function DashboardShell() {
  const {
    collapsed,
    mobileOpen,
    setMobileOpen,
    mobileDragOffset,
    setMobileDragOffset,
  } = useSidebarLayout();
  const dragStartRef = useRef<number | null>(null);

  const mobileOverlayVisible = mobileOpen || mobileDragOffset > 0;
  const mobileOverlayOpacity = mobileOpen
    ? 1
    : Math.min(mobileDragOffset / 180, 0.9);

  const handleThumbStart = (clientX: number) => {
    dragStartRef.current = clientX;
    setMobileDragOffset(0);
  };

  const handleThumbMove = (clientX: number) => {
    if (dragStartRef.current == null) return;
    setMobileDragOffset(Math.max(0, Math.min(clientX - dragStartRef.current, 320)));
  };

  const handleThumbEnd = () => {
    if (dragStartRef.current == null) return;
    const shouldOpen = mobileDragOffset > 72;
    dragStartRef.current = null;
    setMobileOpen(shouldOpen);
    setMobileDragOffset(0);
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

      {/* Mobile edge thumb — swipe/tap to reveal the drawer */}
      {!mobileOpen && (
        <div
          className="fixed left-0 top-1/2 z-40 -translate-y-1/2 lg:hidden"
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
      <div
        className={`flex h-full min-h-0 min-w-0 flex-col overflow-x-hidden transition-[padding] duration-200 ease-out ${
          collapsed ? "lg:ps-14" : "lg:ps-60"
        }`}
      >
        <EmailVerificationBanner />
        <Header />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
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
