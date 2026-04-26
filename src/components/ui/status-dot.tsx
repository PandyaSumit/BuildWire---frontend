import type { HTMLAttributes } from 'react';

export type StatusDotVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

const colorMap: Record<StatusDotVariant, string> = {
  default: 'bg-muted',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
};

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: StatusDotVariant;
}

export function StatusDot({ variant = 'default', className = '', ...props }: StatusDotProps) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full ${colorMap[variant]} ${className}`}
      aria-hidden
      {...props}
    />
  );
}
