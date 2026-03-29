import type { ReactNode } from 'react';

type ModuleSplitLayoutProps = {
  sidebar: ReactNode;
  children: ReactNode;
  sidebarLabel?: string;
};

/**
 * Two-pane module layout: sidebar stacks on narrow screens; place
 * `flex flex-row overflow-x-auto md:flex-col` on inner nav when needed.
 */
export function ModuleSplitLayout({
  sidebar,
  children,
  sidebarLabel,
}: ModuleSplitLayoutProps) {
  return (
    <div className="flex min-h-full min-w-0 flex-col md:flex-row">
      <aside className="shrink-0 border-b border-border bg-surface md:w-56 md:border-b-0 md:border-e">
        <div className="p-4">
          {sidebarLabel ? (
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
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
