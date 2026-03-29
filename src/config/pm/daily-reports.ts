import type { BadgeProps } from '@/components/ui/badge';
import type { CalendarDot } from '@/features/project-ui/projectDummyData';

export const DAILY_REPORT_CALENDAR_LEGEND: Record<
  CalendarDot,
  { className: string; label: string }
> = {
  approved: { className: 'bg-success', label: 'Approved' },
  pending: { className: 'bg-blue-500', label: 'Pending' },
  draft: { className: 'bg-warning', label: 'Draft' },
  missing: { className: 'bg-danger', label: 'Missing' },
  weekend: { className: 'bg-muted/40', label: 'Weekend' },
};

export const DAILY_REPORT_STATUS_BADGE: Record<
  'Approved' | 'Pending' | 'Rejected' | 'Draft',
  NonNullable<BadgeProps['variant']>
> = {
  Approved: 'success',
  Pending: 'warning',
  Rejected: 'danger',
  Draft: 'secondary',
};

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
