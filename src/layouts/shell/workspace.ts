export const MAIN_WORKSPACE_EDGE_GUTTER_X = "px-4 md:px-6";
export const MAIN_WORKSPACE_EDGE_GUTTER_Y = "py-4 md:py-6";

/**
 * Mobile dock sits above scrolling pages in the main workspace.
 * Keep content clear of the dock by reserving bottom safe space.
 */
export const MAIN_WORKSPACE_DOCK_SAFE_BOTTOM =
  "pb-[calc(var(--bw-main-dock-offset,0px)+env(safe-area-inset-bottom))] md:pb-6";

export function mainWorkspacePageClassName(extra?: string) {
  return [
    "space-y-6",
    MAIN_WORKSPACE_EDGE_GUTTER_X,
    MAIN_WORKSPACE_EDGE_GUTTER_Y,
    MAIN_WORKSPACE_DOCK_SAFE_BOTTOM,
    extra ?? "",
  ]
    .join(" ")
    .trim();
}
