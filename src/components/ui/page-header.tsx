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
 * Consistent page-level header: title + description on the left,
 * action buttons on the right. Drop-in replacement for the inline
 * flex heading pattern used across every project module.
 */
export function PageHeader({ title, description, actions, toolbar, className = '' }: PageHeaderProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-[family-name:var(--font-dm-sans)] text-[19px] font-bold tracking-tight text-primary leading-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 text-[13px] leading-relaxed text-secondary">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
      {toolbar && <div>{toolbar}</div>}
    </div>
  );
}
