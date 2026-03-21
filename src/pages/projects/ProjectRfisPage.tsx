import { useParams } from 'react-router-dom';
import { AppPage } from '@/pages/shared/AppPage';

export default function ProjectRfisPage() {
  const { projectId } = useParams<{ projectId: string }>();
  return <AppPage title="RFIs" description={`Project ${projectId} — requests for information.`} />;
}
