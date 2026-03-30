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
  const { collapsed } = useSidebarLayout();

  return (
    <>
      <Sidebar />
      <div
        className={`flex h-full min-h-0 min-w-0 flex-col overflow-x-hidden transition-[padding] duration-200 ease-out ${
          collapsed ? "ps-14" : "ps-60"
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
