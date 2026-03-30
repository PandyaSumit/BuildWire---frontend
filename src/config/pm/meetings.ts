import type { BadgeProps } from '@/components/ui/badge';
import { PM_MEETING_STATUS_BADGE, PM_MEETING_TYPE_PILL } from '@/design-system/pm-label-system';

/** @deprecated Prefer `PM_MEETING_STATUS_BADGE` from `@/design-system` */
export const MEETING_STATUS_BADGE: Record<string, NonNullable<BadgeProps['variant']>> =
  PM_MEETING_STATUS_BADGE;

/** @deprecated Prefer `PM_MEETING_TYPE_PILL` from `@/design-system` */
export const MEETING_TYPE_PILL_CLASSES: Record<string, string> = PM_MEETING_TYPE_PILL;
