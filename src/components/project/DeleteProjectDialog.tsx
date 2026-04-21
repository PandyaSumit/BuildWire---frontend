import { useEffect, useState } from 'react';
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
    if (!open) {
      setConfirmText('');
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, submitting, onClose]);

  if (!open) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={() => !submitting && onClose()}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-project-title"
        className="relative z-10 w-full max-w-md rounded-xl border border-border bg-elevated p-6 shadow-xl"
      >
        <h2 id="delete-project-title" className="text-lg font-semibold text-primary">
          Delete project?
        </h2>
        <p className="mt-2 text-sm text-secondary">
          This will remove <span className="font-medium text-primary">{projectName}</span> for your organization. Type
          the project name to confirm.
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={projectName}
          className="mt-4 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-danger focus:outline-none focus:ring-1 focus:ring-danger"
          disabled={submitting}
          autoComplete="off"
        />
        {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
        <div className="mt-6 flex justify-end gap-3 border-t border-border/40 pt-4">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => !submitting && onClose()}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            disabled={!match}
            loading={submitting}
            loadingText="Deleting…"
            onClick={() => void handleDelete()}
          >
            <IconTrash className="mr-1.5" />Delete project
          </Button>
        </div>
      </div>
    </div>
  );
}
