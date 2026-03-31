import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Spinner } from './spinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  /** Shows a spinner, sets `aria-busy`, and disables the control while true. */
  loading?: boolean;
  /** Label next to the spinner when `loading` is true (e.g. "Creating…"). */
  loadingText?: string;
  /** Optional icon rendered before children */
  iconLeft?: React.ReactNode;
  /** Optional icon rendered after children */
  iconRight?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      className = '',
      children,
      loading = false,
      loadingText,
      disabled,
      iconLeft,
      iconRight,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:scale-[0.97]';

    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      primary:
        'bg-brand text-white hover:bg-brand-hover shadow-token-sm hover:shadow-token-md dark:text-bg focus-visible:ring-brand/50',
      secondary:
        'bg-surface border border-border text-primary hover:bg-primary/5 hover:border-border/80 shadow-token-xs focus-visible:ring-brand/40',
      success:
        'bg-success text-white hover:opacity-90 shadow-token-sm focus-visible:ring-success/50',
      warning:
        'bg-warning text-white hover:opacity-90 shadow-token-sm focus-visible:ring-warning/50',
      danger:
        'bg-danger text-white hover:opacity-90 shadow-token-sm focus-visible:ring-danger/50',
      ghost:
        'bg-transparent text-secondary hover:bg-primary/6 hover:text-primary focus-visible:ring-brand/40',
      outline:
        'bg-transparent border border-border text-secondary hover:bg-primary/5 hover:text-primary hover:border-border/80 focus-visible:ring-brand/40',
    };

    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'h-7 px-2.5 text-[12.5px] [&>svg]:h-3.5 [&>svg]:w-3.5',
      md: 'h-9 px-3.5 text-[13px] [&>svg]:h-4 [&>svg]:w-4',
      lg: 'h-10 px-5 text-[14px] [&>svg]:h-[18px] [&>svg]:w-[18px]',
    };

    const isDisabled = Boolean(disabled || loading);

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
        disabled={isDisabled}
        aria-busy={loading}
      >
        {loading ? (
          <>
            <Spinner size={size === 'lg' ? 'md' : 'sm'} />
            <span>{loadingText ?? 'Loading…'}</span>
          </>
        ) : (
          <>
            {iconLeft && <span className="shrink-0">{iconLeft}</span>}
            {children}
            {iconRight && <span className="shrink-0">{iconRight}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
