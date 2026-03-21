import type { ReactNode } from 'react';

export interface NavItemDef {
  id: string;
  label: string;
  to: string;
  icon: ReactNode;
  /** Small pill (e.g. unread) */
  badge?: string;
  /** “AI” product badge on the row */
  showAiBadge?: boolean;
  /** If true, only highlight when pathname equals `to` (e.g. project home vs sub-routes). */
  endMatch?: boolean;
}

export interface NavGroupDef {
  label: string;
  items: NavItemDef[];
}
