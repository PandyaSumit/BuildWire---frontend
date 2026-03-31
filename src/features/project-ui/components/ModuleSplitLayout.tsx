import type { ReactNode } from 'react';

type ModuleSplitLayoutProps = {
  sidebar: ReactNode;
  children: ReactNode;
  sidebarLabel?: string;
};

/**
 * Two-pane module layout: sidebar stacks on narrow screens; sidebar scrolls
 * independently from the main content pane.
 */
export function ModuleSplitLayout({
  sidebar,
  children,
  sidebarLabel,
}: ModuleSplitLayoutProps) {
  return (
    <div className="flex min-h-full min-w-0 flex-col md:flex-row">
      <aside className="shrink-0 border-b border-border/60 bg-surface md:w-64 md:border-b-0 md:border-e">
        <div className="overflow-y-auto p-3 md:p-4">
          {sidebarLabel ? (
            <p className="mb-2.5 px-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted">
              {sidebarLabel}
            </p>
          ) : null}
          {sidebar}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
