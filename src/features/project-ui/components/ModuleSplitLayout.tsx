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
      <aside className="shrink-0 border-b border-border bg-surface md:w-60 md:border-b-0 md:border-e">
        <div className="overflow-y-auto p-3">
          {sidebarLabel ? (
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
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
