export const REPORT_CATEGORIES = [
  'Overview',
  'Field',
  'Financial',
  'Quality',
  'Custom',
] as const;

export type ReportCategoryId = (typeof REPORT_CATEGORIES)[number];

export const REPORT_CATEGORY_ICONS: Record<ReportCategoryId, string> = {
  Overview: '◈',
  Field: '⛏',
  Financial: '₹',
  Quality: '✓',
  Custom: '⊞',
};
