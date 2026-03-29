import type { BadgeProps } from '@/components/ui/badge';

/** Maps RFI workflow status to shared `Badge` variants */
export const RFI_STATUS_BADGE_VARIANT: Record<
  string,
  NonNullable<BadgeProps['variant']>
> = {
  Open: 'warning',
  'Under Review': 'secondary',
  Answered: 'success',
  Closed: 'default',
  Draft: 'secondary',
  Void: 'danger',
};

export const RFI_PRIORITY_BADGE_VARIANT: Record<
  'Normal' | 'Urgent',
  NonNullable<BadgeProps['variant']>
> = {
  Normal: 'secondary',
  Urgent: 'danger',
};

/** Soft-bordered pills for trade / discipline columns (RFI table) */
export const RFI_TRADE_PILL_CLASSES: Record<string, string> = {
  Structural:
    'bg-amber-500/10 text-amber-800 dark:text-amber-200 border-amber-500/25',
  MEP: 'bg-cyan-500/10 text-cyan-800 dark:text-cyan-200 border-cyan-500/25',
  Finishing:
    'bg-violet-500/10 text-violet-800 dark:text-violet-200 border-violet-500/25',
  Waterproofing:
    'bg-blue-500/10 text-blue-800 dark:text-blue-200 border-blue-500/25',
  Architectural:
    'bg-indigo-500/10 text-indigo-800 dark:text-indigo-200 border-indigo-500/25',
  Electrical:
    'bg-yellow-500/10 text-yellow-800 dark:text-yellow-200 border-yellow-500/25',
};
