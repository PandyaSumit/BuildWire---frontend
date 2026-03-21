import { useLocation } from 'react-router-dom';

export type SidebarMode =
  | { mode: 'global' }
  | { mode: 'project'; projectId: string };

/**
 * Detects whether the user is in **org (global)** navigation vs **inside a project**.
 * Project routes look like `/projects/:projectId/...`.
 */
export function useSidebarMode(): SidebarMode {
  const { pathname } = useLocation();
  const m = pathname.match(/^\/projects\/([^/]+)/);
  if (m?.[1]) {
    return { mode: 'project', projectId: m[1] };
  }
  return { mode: 'global' };
}
