import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = true, className = '', ...props }, ref) => {
    const widthClass = fullWidth ? 'w-full' : '';
    const errorClass = error ? 'border-danger focus:ring-danger' : 'border-border focus:ring-brand';

    return (
      <div className={widthClass}>
        {label && (
          <label className="block text-sm font-medium mb-2 text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2.5 bg-bg border rounded-lg text-primary text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errorClass} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-danger">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
