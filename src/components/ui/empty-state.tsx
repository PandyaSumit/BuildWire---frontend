import type { ReactNode } from 'react';
import { Button, type ButtonProps } from './button';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void } & Partial<ButtonProps>;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-surface/40 px-6 py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/10 text-muted [&>svg]:h-6 [&>svg]:w-6">
          {icon}
        </div>
      )}
      <h3 className="font-[family-name:var(--font-dm-sans)] text-[15px] font-semibold text-primary">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-secondary">{description}</p>
      )}
      {action && (
        <Button
          className="mt-6"
          onClick={action.onClick}
          variant={action.variant ?? 'primary'}
          size="sm"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
