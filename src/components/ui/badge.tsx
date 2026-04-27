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
  default:   'bg-muted/20 text-secondary',
  success:   'bg-success text-white',
  warning:   'bg-warning text-white',
  danger:    'bg-danger text-white',
  secondary: 'bg-brand text-white',
  info:      'bg-info text-white',
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
