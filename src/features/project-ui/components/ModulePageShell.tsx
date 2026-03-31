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
 * Padding scale: 16px mobile → 24px sm → 32px xl
 */
export function ModulePageShell({
  children,
  className = '',
  padding = 'default',
}: ModulePageShellProps) {
  const pad = padding === 'default' ? 'px-4 py-5 sm:px-6 sm:py-6 xl:px-8 xl:py-7' : '';
  return (
    <div
      className={`flex min-h-full min-w-0 flex-col gap-5 ${pad} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
