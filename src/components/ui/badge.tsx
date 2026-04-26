import { HTMLAttributes } from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'secondary' | 'info';
export type BadgeSize = 'xs' | 'sm' | 'md';
export type BadgeShape = 'pill' | 'rounded';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  shape?: BadgeShape;
  /** Dot indicator shown before the label */
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:   'bg-surface border border-border text-primary',
  success:   'bg-success/10 text-success border border-success/20',
  warning:   'bg-warning/10 text-warning border border-warning/20',
  danger:    'bg-danger/10 text-danger border border-danger/20',
  secondary: 'bg-brand-light text-brand border border-brand/15',
  info:      'bg-info/10 text-info border border-info/20',
};

const dotColors: Record<BadgeVariant, string> = {
  default:   'bg-muted',
  success:   'bg-success',
  warning:   'bg-warning',
  danger:    'bg-danger',
  secondary: 'bg-brand',
  info:      'bg-info',
};

const sizeStyles: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-px text-[10px] leading-[14px]',
  sm: 'px-2 py-0.5 text-[11px] leading-[16px]',
  md: 'px-2.5 py-0.5 text-[12px] leading-[18px]',
};

const shapeStyles: Record<BadgeShape, string> = {
  pill:    'rounded-full',
  rounded: 'rounded-md',
};

export function Badge({
  variant = 'default',
  size = 'sm',
  shape = 'pill',
  dot = false,
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium whitespace-nowrap ${variantStyles[variant]} ${sizeStyles[size]} ${shapeStyles[shape]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`h-[5px] w-[5px] shrink-0 rounded-full ${dotColors[variant]}`}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}
