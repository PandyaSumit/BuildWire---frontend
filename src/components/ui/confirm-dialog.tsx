import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export type ConfirmDialogVariant = 'default' | 'danger';

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  confirmDisabled?: boolean;
};

function DangerIcon() {
  return (
    <svg className="h-6 w-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

/**
 * Centered modal for confirmations (delete, destructive actions, or general “are you sure?”).
 * Renders via portal, locks body scroll, closes on overlay click and Escape when not loading.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'default',
  onConfirm,
  loading: loadingProp = false,
  confirmDisabled = false,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const descId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState(false);
  const loading = loadingProp || pending;
  const cancel = cancelLabel ?? t('common.cancel');

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open || loading) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, close]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => cancelRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  const handleConfirm = async () => {
    if (loading || confirmDisabled) return;
    setPending(true);
    try {
      await Promise.resolve(onConfirm());
      onOpenChange(false);
    } finally {
      setPending(false);
    }
  };

  if (!open || typeof document === 'undefined') return null;

  const describedBy = description ? descId : undefined;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label={t('common.closeDialog')}
        onClick={() => !loading && close()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={describedBy}
        className="relative z-[101] flex w-full max-w-md flex-col rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/60"
      >
        {/* Body */}
        <div className="px-6 pt-6 pb-4">
          {variant === 'danger' ? (
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/15">
                <DangerIcon />
              </div>
            </div>
          ) : null}
          <h2
            id={titleId}
            className="text-center font-[family-name:var(--font-dm-sans)] text-lg font-semibold leading-snug text-primary"
          >
            {title}
          </h2>
          {description ? (
            <p id={descId} className="mt-2 text-center text-sm leading-relaxed text-secondary">
              {description}
            </p>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-zinc-700/60 px-6 py-4">
          <Button
            ref={cancelRef}
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={close}
            className="sm:min-w-[6.5rem]"
          >
            {cancel}
          </Button>
          <Button
            type="button"
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            loading={loading}
            loadingText={confirmLabel}
            disabled={confirmDisabled}
            onClick={() => void handleConfirm()}
            className="sm:min-w-[6.5rem]"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export type DeleteConfirmDialogProps = Omit<ConfirmDialogProps, 'variant' | 'confirmLabel'> & {
  confirmLabel?: string;
};

/** Preset: danger styling + default “Delete” label from i18n. */
export function DeleteConfirmDialog({
  confirmLabel,
  cancelLabel,
  ...rest
}: DeleteConfirmDialogProps) {
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      variant="danger"
      confirmLabel={confirmLabel ?? t('confirmDialog.deleteConfirm')}
      cancelLabel={cancelLabel}
      {...rest}
    />
  );
}
