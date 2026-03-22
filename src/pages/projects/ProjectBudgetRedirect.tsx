import { Navigate, useParams } from 'react-router-dom';

export default function ProjectBudgetRedirect() {
  const { projectId } = useParams<{ projectId: string }>();
  if (!projectId) return <Navigate to="/projects" replace />;
  return <Navigate to={`/projects/${projectId}/financials`} replace />;
}
