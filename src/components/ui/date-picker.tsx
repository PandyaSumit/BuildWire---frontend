import { InputHTMLAttributes, forwardRef } from 'react';

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, required, error, helperText, fullWidth = false, className = '', ...props }, ref) => {
    const widthClass = fullWidth ? 'w-full' : '';
    const errorClass = error ? 'border-danger focus:ring-danger' : 'border-border focus:ring-brand';

    return (
      <div className={widthClass}>
        {label && (
          <label className="block text-sm font-medium mb-2 text-primary">
            {label}{required && <span className="ml-0.5 text-danger">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="date"
            className={`px-4 py-2 bg-bg border rounded-lg text-primary focus:outline-none focus:ring-2 focus:border-transparent transition-all [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${errorClass} ${widthClass} ${className}`}
            {...props}
          />
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
