import { Outlet, useLocation } from "react-router-dom";
import { Sidebar, SidebarLayoutProvider, useSidebarLayout } from "./sidebar";
import { Header } from "./header";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { ProjectUiProvider } from "@/components/project/ProjectUiProvider";
import { GlobalSearchProvider } from "./search/GlobalSearchContext";
import { GlobalSearchPalette } from "./search/GlobalSearchPalette";
import { MobileSearchMenuDock } from "./dock/MobileSearchMenuDock";
import {
  AiAssistantProvider,
  AiAssistantWorkspace,
} from "@/components/ai-assistant";
import {
  WorkspaceSwitcherProvider,
  useWorkspaceSwitcher,
} from "@/components/workspace-switcher";

function DashboardShell() {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebarLayout();
  const { isSwitching, activeWorkspace, pendingWorkspace, switchVersion } =
    useWorkspaceSwitcher();
  const mobileOverlayVisible = mobileOpen;
  const mobileOverlayOpacity = mobileOpen ? 1 : 0;

  const workspaceRenderKey = `${activeWorkspace}:${switchVersion}`;

  function WorkspaceLoadingState() {
    const target = pendingWorkspace ?? activeWorkspace;
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 lg:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-56 rounded-md bg-surface" />
          <div className="h-4 w-80 rounded-md bg-surface" />
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="h-28 rounded-[10px] bg-surface" />
            <div className="h-28 rounded-[10px] bg-surface" />
            <div className="h-28 rounded-[10px] bg-surface" />
          </div>
          <div className="h-[42vh] rounded-[10px] bg-surface" />
        </div>
        <div className="mt-3 text-xs text-muted">
          Preparing{" "}
          {target === "project"
            ? "Main Workspace"
            : target === "hiring"
              ? "Job Hiring Workspace"
              : "Chat System Workspace"}
          ...
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile backdrop — closes drawer when tapping outside */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden",
          "transition-opacity duration-200",
          mobileOverlayVisible ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        style={{ opacity: mobileOverlayOpacity }}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />

      {activeWorkspace !== "messages" && (
        <>
          <MobileSearchMenuDock />
          <GlobalSearchPalette />
        </>
      )}

      <Sidebar />

      {/* Main content: no left padding on mobile (sidebar is overlay); push only on lg+ */}
      <AiAssistantProvider>
        <div
          className={`flex h-full min-h-0 min-w-0 flex-col overflow-x-hidden transition-[padding] duration-200 ease-out ${
            activeWorkspace === "messages"
              ? "md:ps-0 lg:ps-0"
              : `md:ps-14 ${collapsed ? "lg:ps-14" : "lg:ps-60"}`
          }`}
        >
          <EmailVerificationBanner />
          <Header />
          <div className="flex min-h-0 flex-1 flex-col">
            {isSwitching ? (
              <WorkspaceLoadingState />
            ) : (
              <div
                key={workspaceRenderKey}
                className="flex min-h-0 flex-1 flex-col transition-opacity duration-200 opacity-100 [--bw-main-dock-offset:4.25rem]"
              >
                <AiAssistantWorkspace>
                  <Outlet />
                </AiAssistantWorkspace>
              </div>
            )}
          </div>
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
          <WorkspaceSwitcherProvider>
            {projectId ? (
              <ProjectUiProvider projectId={projectId}>
                <DashboardShell />
              </ProjectUiProvider>
            ) : (
              <DashboardShell />
            )}
          </WorkspaceSwitcherProvider>
        </GlobalSearchProvider>
      </SidebarLayoutProvider>
    </div>
  );
}
