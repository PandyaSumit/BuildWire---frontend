import type { BadgeProps } from '@/components/ui/badge';
import type { DummyInspection } from '@/features/project-ui/projectDummyData';

export const INSPECTION_RESULT_BADGE: Record<
  DummyInspection['result'],
  NonNullable<BadgeProps['variant']>
> = {
  Pass: 'success',
  Fail: 'danger',
  Conditional: 'warning',
};

export const INSPECTION_TYPE_PILL_CLASSES: Record<string, string> = {
  Quality:
    'border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-200',
  MEP: 'border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200',
  Structural:
    'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-200',
  Safety:
    'border-green-500/25 bg-green-500/10 text-green-700 dark:text-green-200',
  Fire: 'border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-200',
};
