import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Spinner } from './spinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  /** Shows a spinner, sets `aria-busy`, and disables the control while true. */
  loading?: boolean;
  /** Label next to the spinner when `loading` is true (e.g. “Creating…”). */
  loadingText?: string;
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
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-brand text-white dark:text-bg hover:opacity-90 border-0',
      secondary: 'bg-transparent border border-border text-primary hover:bg-surface',
      success: 'bg-success text-white hover:opacity-90',
      warning: 'bg-warning text-white hover:opacity-90',
      danger: 'bg-danger text-white hover:opacity-90',
      ghost: 'bg-transparent text-primary hover:bg-surface',
      outline: 'bg-transparent border border-border text-primary hover:bg-surface',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    const isDisabled = Boolean(disabled || loading);

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
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
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
