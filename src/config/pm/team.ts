import type { BadgeProps } from '@/components/ui/badge';

export const TEAM_ROLE_BADGE_VARIANT: Record<
  string,
  NonNullable<BadgeProps['variant']>
> = {
  PM: 'secondary',
  Supervisor: 'default',
  Guest: 'secondary',
  Worker: 'default',
};
