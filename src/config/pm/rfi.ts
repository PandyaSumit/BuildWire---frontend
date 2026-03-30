import type { BadgeProps } from '@/components/ui/badge';
import {
  PM_RFI_PRIORITY_BADGE,
  PM_RFI_STATUS_BADGE,
  PM_RFI_TRADE_PILL,
} from '@/design-system/pm-label-system';

/** @deprecated Prefer `PM_RFI_STATUS_BADGE` from `@/design-system` */
export const RFI_STATUS_BADGE_VARIANT: Record<
  string,
  NonNullable<BadgeProps['variant']>
> = PM_RFI_STATUS_BADGE;

/** @deprecated Prefer `PM_RFI_PRIORITY_BADGE` from `@/design-system` */
export const RFI_PRIORITY_BADGE_VARIANT: Record<
  'Normal' | 'Urgent',
  NonNullable<BadgeProps['variant']>
> = PM_RFI_PRIORITY_BADGE;

/** @deprecated Prefer `PM_RFI_TRADE_PILL` from `@/design-system` */
export const RFI_TRADE_PILL_CLASSES: Record<string, string> = PM_RFI_TRADE_PILL;
