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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-14 text-center">
      {icon && <div className="mb-4 text-muted">{icon}</div>}
      <h3 className="font-[family-name:var(--font-dm-sans)] text-lg font-semibold text-primary">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-secondary">{description}</p>}
      {action && (
        <Button className="mt-6" onClick={action.onClick} variant={action.variant ?? 'primary'}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
