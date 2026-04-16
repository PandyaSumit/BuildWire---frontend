import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  /** Primary action button(s) rendered on the right */
  actions?: ReactNode;
  /** Optional secondary row below heading (e.g. tabs / segmented control) */
  toolbar?: ReactNode;
  className?: string;
};

/**
 * Consistent page-level header: title on the left,
 * action buttons on the right.
 */
export function PageHeader({ title, description, actions, toolbar, className = '' }: PageHeaderProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-[family-name:var(--font-dm-sans)] text-[20px] font-bold tracking-tight text-primary leading-tight sm:text-[22px]">
            {title}
          </h1>
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
      {toolbar && <div>{toolbar}</div>}
    </div>
  );
}
