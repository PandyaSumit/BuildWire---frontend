import type { UnitStatus } from '@/services/project/projectDummyData';

export const INVENTORY_UNIT_STATUS_STYLE: Record<UnitStatus, string> = {
  available: 'border-border bg-muted/15 text-secondary',
  reserved:
    'border-blue-500/50 bg-blue-500/10 text-blue-800 dark:text-blue-100',
  booked:
    'border-amber-500/50 bg-amber-500/15 text-amber-900 dark:text-amber-100',
  sold: 'border-green-500/50 bg-green-500/15 text-green-800 dark:text-green-100',
  handed:
    'border-purple-500/50 bg-purple-500/15 text-purple-900 dark:text-purple-100',
};
