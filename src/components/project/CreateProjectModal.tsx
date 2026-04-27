import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { ProjectStatus } from '@/types/project';
import { projectStatusTKey } from '@/utils/project/display';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@/components/ui/icons';

const statuses: ProjectStatus[] = ['planning', 'active', 'on_hold', 'completed', 'archived'];

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (body: { name: string; description: string; status: ProjectStatus }) => Promise<void>;
};

export function CreateProjectModal({ open, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('planning');
  const [submitting, setSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setNameError(null);
    setSubmitError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(t('createProject.errorNameRequired'));
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ name: trimmed, description: description.trim(), status });
      setName('');
      setDescription('');
      setStatus('planning');
      onClose();
    } catch (err) {
      const msg = err as { response?: { data?: { error?: string; message?: string } } };
      setSubmitError(msg.response?.data?.error || msg.response?.data?.message || t('createProject.errorFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label={t('common.closeDialog')}
        onClick={() => !submitting && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-title"
        className="relative z-10 flex w-full max-w-md flex-col rounded-2xl border border-border bg-elevated shadow-2xl shadow-black/60"
        style={{ maxHeight: '90vh' }}
      >
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          {/* Header */}
          <div className="flex shrink-0 items-start justify-between border-b border-border/60 px-6 pb-4 pt-5">
            <div>
              <h2 id="create-project-title" className="text-lg font-semibold text-primary">
                {t('projects.newProject')}
              </h2>
              <p className="mt-1 text-sm text-secondary">{t('createProject.intro')}</p>
            </div>
            <button
              type="button"
              onClick={() => !submitting && onClose()}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-primary"
              aria-label={t('common.close')}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="project-name" className="mb-1.5 block text-[12px] font-medium text-primary">
                  {t('createProject.name')} <span className="text-danger">*</span>
                </label>
                <input
                  id="project-name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameError(null); }}
                  className={`w-full rounded-lg border bg-bg px-3 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 ${nameError ? 'border-danger focus:border-danger focus:ring-danger/25' : 'border-border focus:border-brand/40 focus:ring-brand/20'}`}
                  placeholder={t('createProject.namePlaceholder')}
                  autoFocus
                  disabled={submitting}
                />
                {nameError && <p className="mt-1 text-xs text-danger">{nameError}</p>}
              </div>
              <div>
                <label htmlFor="project-desc" className="mb-1.5 block text-[12px] font-medium text-primary">
                  {t('createProject.description')}
                </label>
                <textarea
                  id="project-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-primary placeholder:text-muted focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
                  placeholder={t('createProject.descPlaceholder')}
                  disabled={submitting}
                />
              </div>
              <Select
                id="project-status"
                label={t('createProject.status')}
                value={status}
                onValueChange={(v) => setStatus(v as ProjectStatus)}
                disabled={submitting}
                options={statuses.map((s) => ({ value: s, label: t(projectStatusTKey(s)) }))}
                placeholder={t('createProject.statusPlaceholder')}
              />
            </div>
            {submitError && <p className="mt-3 text-sm text-danger">{submitError}</p>}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border/60 bg-elevated px-6 py-4">
            <Button type="button" variant="secondary" size="sm" onClick={() => !submitting && onClose()}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting} loadingText={t('createProject.creating')}>
              <IconPlus className="mr-1.5" />{t('createProject.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
