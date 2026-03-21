import { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'secondary';
  size?: 'sm' | 'md';
}

export function Badge({ 
  variant = 'default', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full whitespace-nowrap';
  
  const variants = {
    default: 'bg-surface border border-border text-primary',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    danger: 'bg-danger/10 text-danger border border-danger/20',
    secondary: 'bg-brand-light text-brand border border-brand/10',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
