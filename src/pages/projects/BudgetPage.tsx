import { useParams } from 'react-router-dom';
import { AppPage } from '@/pages/shared/AppPage';

export default function BudgetPage() {
  const { projectId } = useParams<{ projectId: string }>();
  return <AppPage title="Budget" description={`Project ${projectId} — cost and commitments.`} />;
}
