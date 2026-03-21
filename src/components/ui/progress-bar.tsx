import { HTMLAttributes } from 'react';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  className = '',
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variants = {
    default: 'bg-brand',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  };

  return (
    <div className={`w-full ${className}`} {...props}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-primary">{label}</span>
          {showLabel && (
            <span className="text-sm text-secondary">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-surface border border-border rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`${sizes[size]} ${variants[variant]} transition-all duration-300 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
