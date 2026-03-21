import { InputHTMLAttributes, forwardRef } from 'react';

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, helperText, fullWidth = false, className = '', ...props }, ref) => {
    const widthClass = fullWidth ? 'w-full' : '';
    const errorClass = error ? 'border-danger focus:ring-danger' : 'border-border focus:ring-brand';

    return (
      <div className={widthClass}>
        {label && (
          <label className="block text-sm font-medium mb-2 text-primary">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="date"
            className={`px-4 py-2 bg-bg border rounded-lg text-primary focus:outline-none focus:ring-2 focus:border-transparent transition-all ${errorClass} ${widthClass} ${className}`}
            {...props}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-5 h-5 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
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

DatePicker.displayName = 'DatePicker';
