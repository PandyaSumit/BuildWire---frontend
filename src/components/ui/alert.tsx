import { ReactNode } from 'react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

export function Alert({ variant = 'info', title, children, onClose }: AlertProps) {
  const variants = {
    info: {
      bg: 'bg-brand/10',
      border: 'border-brand/20',
      icon: 'text-brand',
      text: 'text-primary',
    },
    success: {
      bg: 'bg-success/10',
      border: 'border-success/20',
      icon: 'text-success',
      text: 'text-primary',
    },
    warning: {
      bg: 'bg-warning/10',
      border: 'border-warning/20',
      icon: 'text-warning',
      text: 'text-primary',
    },
    danger: {
      bg: 'bg-danger/10',
      border: 'border-danger/20',
      icon: 'text-danger',
      text: 'text-danger',
    },
  };

  const icons = {
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    danger: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const style = variants[variant];

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-4`}>
      <div className="flex gap-3">
        <div className={`${style.icon} flex-shrink-0`}>
          {icons[variant]}
        </div>
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold mb-1 ${style.text}`}>{title}</h4>
          )}
          <div className={`text-sm ${style.text}`}>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${style.icon} hover:opacity-70 transition-opacity flex-shrink-0`}
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
