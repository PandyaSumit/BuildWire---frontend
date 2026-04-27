import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { IconTrash } from '@/components/ui/icons';

type Props = {
  open: boolean;
  projectName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function DeleteProjectDialog({ open, projectName, onClose, onConfirm }: Props) {
  const [confirmText, setConfirmText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const match = confirmText.trim() === projectName.trim();

  useEffect(() => {
    if (!open) { setConfirmText(''); setError(null); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, submitting, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  async function handleDelete() {
    if (!match) return;
    setError(null);
    setSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      const msg = err as { response?: { data?: { error?: string; message?: string } } };
      setError(msg.response?.data?.error || msg.response?.data?.message || 'Could not delete project');
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={() => !submitting && onClose()}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-project-title"
        className="relative z-10 flex w-full max-w-md flex-col rounded-2xl border border-border bg-elevated shadow-2xl shadow-black/60"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-border/60 px-6 pb-4 pt-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger/15">
              <svg className="h-5 w-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h2 id="delete-project-title" className="text-lg font-semibold text-primary">
                Delete project?
              </h2>
              <p className="mt-1 text-sm text-secondary">
                This will permanently remove <span className="font-medium text-primary">{projectName}</span> for your entire organization.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-primary"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <label className="mb-1.5 block text-[12px] font-medium text-secondary">
            Type <span className="font-semibold text-primary">{projectName}</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={projectName}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-primary placeholder:text-muted focus:border-danger/50 focus:outline-none focus:ring-2 focus:ring-danger/20"
            disabled={submitting}
            autoComplete="off"
            autoFocus
          />
          {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border/60 bg-elevated px-6 py-4">
          <Button type="button" variant="secondary" size="sm" onClick={() => !submitting && onClose()}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={!match}
            loading={submitting}
            loadingText="Deleting…"
            onClick={() => void handleDelete()}
          >
            <IconTrash className="mr-1.5" />Delete project
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
