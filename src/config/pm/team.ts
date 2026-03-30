import type { BadgeProps } from '@/components/ui/badge';
import { PM_TEAM_ROLE_BADGE } from '@/design-system/pm-label-system';

/** @deprecated Prefer `PM_TEAM_ROLE_BADGE` from `@/design-system` */
export const TEAM_ROLE_BADGE_VARIANT: Record<
  string,
  NonNullable<BadgeProps['variant']>
> = PM_TEAM_ROLE_BADGE;
