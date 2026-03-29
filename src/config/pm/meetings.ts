import type { BadgeProps } from '@/components/ui/badge';

export const MEETING_STATUS_BADGE: Record<string, NonNullable<BadgeProps['variant']>> = {
  Completed: 'success',
  Scheduled: 'secondary',
};

export const MEETING_TYPE_PILL_CLASSES: Record<string, string> = {
  'Site Progress Meeting':
    'border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-200',
  'Design Review Meeting':
    'border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-200',
  'Safety Toolbox Talk':
    'border-green-500/25 bg-green-500/10 text-green-700 dark:text-green-200',
  'Owner/Client Meeting':
    'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-200',
  'Subcontractor Coordination':
    'border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200',
};
