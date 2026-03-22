import { Navigate, useParams } from 'react-router-dom';
import { readLastProjectPath } from './lastRoute';

/**
 * `/projects/:projectId` — restores last visited child route, otherwise opens Overview.
 */
export function ProjectIndexEntry() {
  const { projectId } = useParams<{ projectId: string }>();
  if (!projectId) return null;
  const last = readLastProjectPath(projectId);
  if (last && last !== '/' && last !== '') {
    return <Navigate to={`/projects/${projectId}${last}`} replace />;
  }
  return <Navigate to={`/projects/${projectId}/overview`} replace />;
}
