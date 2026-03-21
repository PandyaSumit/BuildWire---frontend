import { useParams } from 'react-router-dom';
import { AppPage } from '@/pages/shared/AppPage';

export default function ProjectTasksPage() {
  const { projectId } = useParams<{ projectId: string }>();
  return <AppPage title="Tasks" description={`Project ${projectId} — task list and board.`} />;
}
