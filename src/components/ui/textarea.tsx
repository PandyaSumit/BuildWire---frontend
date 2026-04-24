import { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
        <textarea
          ref={ref}
          className={`px-4 py-2 bg-bg border rounded-lg text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none ${errorClass} ${widthClass} ${className}`}
          rows={4}
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

Textarea.displayName = 'Textarea';
