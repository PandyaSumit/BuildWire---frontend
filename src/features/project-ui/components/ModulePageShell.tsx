import type { ReactNode } from 'react';

type ModulePageShellProps = {
  children: ReactNode;
  /** Extra classes on outer wrapper */
  className?: string;
  /** Use `none` when parent handles padding (e.g. split layout main pane) */
  padding?: 'default' | 'none';
};

/**
 * Consistent canvas for project modules: breathable padding, min-width guard.
 */
export function ModulePageShell({
  children,
  className = '',
  padding = 'default',
}: ModulePageShellProps) {
  const pad = padding === 'default' ? 'p-4 sm:p-6' : '';
  return (
    <div
      className={`flex min-h-full min-w-0 flex-col gap-5 ${pad} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
