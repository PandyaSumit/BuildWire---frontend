import { useTranslation } from 'react-i18next';
import { PM_PROJECT_STATUS_CAPSULE } from '@/design-system/pm-label-system';
import type { ProjectStatus } from '@/types/project';
import { projectStatusTKey } from '@/features/projects/lib/display';

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${PM_PROJECT_STATUS_CAPSULE[status]}`}
    >
      {t(projectStatusTKey(status))}
    </span>
  );
}
