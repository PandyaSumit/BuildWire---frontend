import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Shared shell for task create/edit drawers — matches the “New task” panel styling.
 */
export function TaskDrawerChrome({ title, subtitle, onClose, children, footer }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex h-full min-h-0 flex-col bg-elevated">
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <div className="font-[family-name:var(--font-dm-sans)] text-lg font-semibold leading-tight text-primary">
            {title}
          </div>
          {subtitle ? <p className="mt-1 text-sm text-secondary">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-secondary hover:bg-surface hover:text-primary"
          aria-label={t('common.closeDialog')}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
      {footer ? (
        <div className="shrink-0 border-t border-border bg-elevated px-4 py-4">{footer}</div>
      ) : null}
    </div>
  );
}
