import { useParams } from 'react-router-dom';
import { AppPage } from '@/pages/shared/AppPage';

export default function ProjectBudgetPage() {
  const { projectId } = useParams<{ projectId: string }>();
  return <AppPage title="Budget" description={`Project ${projectId} — cost and commitments.`} />;
}
