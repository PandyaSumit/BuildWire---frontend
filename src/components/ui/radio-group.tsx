import { InputHTMLAttributes, forwardRef } from 'react';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  options: RadioOption[];
  label?: string;
  error?: string;
  orientation?: 'vertical' | 'horizontal';
}

export const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
  ({ options, label, error, orientation = 'vertical', name, ...props }, ref) => {
    const containerClass = orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'flex flex-col gap-3';

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-sm font-medium text-primary">
            {label}
          </label>
        )}
        <div className={containerClass}>
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="relative">
                <input
                  ref={ref}
                  type="radio"
                  name={name}
                  value={option.value}
                  disabled={option.disabled}
                  className="peer sr-only"
                  {...props}
                />
                <div className={`w-5 h-5 rounded-full border-2 transition-all ${error ? 'border-danger' : 'border-border'} peer-checked:border-brand peer-focus:ring-2 peer-focus:ring-brand/20 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed`}>
                  <div className="absolute inset-0 m-1 rounded-full bg-brand opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
              </div>
              <span className={`text-sm ${option.disabled ? 'text-muted' : 'text-primary'} group-hover:text-brand transition-colors`}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
        {error && (
          <p className="text-xs text-danger">{error}</p>
        )}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';
