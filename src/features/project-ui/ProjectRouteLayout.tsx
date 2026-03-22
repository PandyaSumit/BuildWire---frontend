import { useEffect } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { writeLastProjectPath } from './lastRoute';

/**
 * Syncs last visited path under `/projects/:projectId/*` for restore-on-entry.
 */
export function ProjectRouteLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!projectId) return;
    const base = `/projects/${projectId}`;
    const suffix = pathname === base ? '' : pathname.slice(base.length) || '';
    writeLastProjectPath(projectId, suffix);
  }, [pathname, projectId]);

  return <Outlet />;
}
