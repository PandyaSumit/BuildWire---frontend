import type { WorkspaceId } from "@/components/workspace-switcher";
import type { SidebarMode } from "@/hooks/useSidebarMode";
import type { OrgRole } from "@/types/rbac";
import type { NavGroupDef } from "./types";
import { getGlobalSidebarGroups } from "./global";
import { getProjectSidebarGroups } from "./project";
import { getHiringSidebarGroups } from "./hiring/sidebar";

export type ResolveSidebarArgs = {
  activeWorkspace: WorkspaceId;
  sidebarMode: SidebarMode;
  orgRole: OrgRole | null;
};

/**
 * Central resolver for sidebar groups by workspace + route mode.
 * Future role/permission engines should plug in here.
 */
export function resolveSidebarGroups({
  activeWorkspace,
  sidebarMode,
  orgRole,
}: ResolveSidebarArgs): NavGroupDef[] {
  if (activeWorkspace === "messages") return [];
  if (activeWorkspace === "hiring") return getHiringSidebarGroups();
  if (sidebarMode.mode === "project") {
    return getProjectSidebarGroups(sidebarMode.projectId, orgRole);
  }
  return getGlobalSidebarGroups(orgRole);
}
