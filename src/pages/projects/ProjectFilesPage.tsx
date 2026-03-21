import { useParams } from 'react-router-dom';
import { AppPage } from '@/pages/shared/AppPage';

export default function ProjectFilesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  return <AppPage title="Files" description={`Project ${projectId} — drawings and documents.`} />;
}
