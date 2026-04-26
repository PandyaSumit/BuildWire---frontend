import { useLocation } from 'react-router-dom';

export type SidebarMode =
  | { mode: 'global' }
  | { mode: 'project'; projectId: string };

export function useSidebarMode(): SidebarMode {
  const { pathname } = useLocation();
  const m = pathname.match(/^\/projects\/([^/]+)/);
  if (m?.[1]) {
    return { mode: 'project', projectId: m[1] };
  }
  return { mode: 'global' };
}
