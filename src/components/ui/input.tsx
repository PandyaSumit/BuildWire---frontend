import { InputHTMLAttributes, forwardRef, type ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  /** Icon/element rendered on the left inside the input */
  startAdornment?: ReactNode;
  /** Icon/element rendered on the right inside the input */
  endAdornment?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, required, error, helperText, fullWidth = true, startAdornment, endAdornment, className = '', ...props },
    ref
  ) => {
    const hasError = Boolean(error);
    const borderCls = hasError
      ? 'border-danger focus-within:ring-danger/40 focus-within:border-danger'
      : 'border-border/70 focus-within:ring-brand/40 focus-within:border-brand';

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="mb-1.5 block text-[12.5px] font-medium text-primary">
            {label}{required && <span className="ml-0.5 text-danger">*</span>}
          </label>
        )}

        <div
          className={`flex items-center gap-2 rounded-lg border bg-bg px-3 py-0 text-sm ring-0 transition-all duration-150 focus-within:ring-2 focus-within:ring-offset-0 disabled:opacity-50 ${borderCls} ${fullWidth ? 'w-full' : ''}`}
        >
          {startAdornment && (
            <span className="shrink-0 text-muted [&>svg]:h-4 [&>svg]:w-4">{startAdornment}</span>
          )}
          <input
            ref={ref}
            className={`min-w-0 flex-1 bg-transparent py-2.5 text-primary placeholder:text-muted focus:outline-none disabled:cursor-not-allowed ${className}`}
            {...props}
          />
          {endAdornment && (
            <span className="shrink-0 text-muted [&>svg]:h-4 [&>svg]:w-4">{endAdornment}</span>
          )}
        </div>

        {hasError && <p className="mt-1 text-[12px] text-danger">{error}</p>}
        {helperText && !hasError && (
          <p className="mt-1 text-[12px] text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
