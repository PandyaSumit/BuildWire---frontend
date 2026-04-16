import type { BadgeProps } from '@/components/ui/badge';
import type { CalendarDot } from '@/services/project/projectDummyData';
import {
  PM_DAILY_REPORT_CALENDAR_LEGEND,
  PM_DAILY_REPORT_STATUS_BADGE,
} from '@/design-system/pm-label-system';

/** @deprecated Prefer `PM_DAILY_REPORT_CALENDAR_LEGEND` from `@/design-system` */
export const DAILY_REPORT_CALENDAR_LEGEND: Record<
  CalendarDot,
  { className: string; label: string }
> = PM_DAILY_REPORT_CALENDAR_LEGEND;

/** @deprecated Prefer `PM_DAILY_REPORT_STATUS_BADGE` from `@/design-system` */
export const DAILY_REPORT_STATUS_BADGE: Record<
  'Approved' | 'Pending' | 'Rejected' | 'Draft',
  NonNullable<BadgeProps['variant']>
> = PM_DAILY_REPORT_STATUS_BADGE;

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
