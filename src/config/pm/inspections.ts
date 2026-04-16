import type { BadgeProps } from '@/components/ui/badge';
import type { DummyInspection } from '@/services/project/projectDummyData';
import { PM_INSPECTION_RESULT_BADGE, PM_INSPECTION_TYPE_PILL } from '@/design-system/pm-label-system';

/** @deprecated Prefer `PM_INSPECTION_RESULT_BADGE` from `@/design-system` */
export const INSPECTION_RESULT_BADGE: Record<
  DummyInspection['result'],
  NonNullable<BadgeProps['variant']>
> = PM_INSPECTION_RESULT_BADGE;

/** @deprecated Prefer `PM_INSPECTION_TYPE_PILL` from `@/design-system` */
export const INSPECTION_TYPE_PILL_CLASSES: Record<string, string> = PM_INSPECTION_TYPE_PILL;
