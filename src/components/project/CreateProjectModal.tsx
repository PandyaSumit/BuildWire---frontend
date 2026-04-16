import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProjectStatus } from '@/types/project';
import { projectStatusTKey } from '@/utils/project/display';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, submitting, onClose]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('createProject.errorNameRequired'));
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        name: trimmed,
        description: description.trim(),
        status,
      });
      setName('');
      setDescription('');
      setStatus('planning');
      onClose();
    } catch (err) {
      const msg = err as { response?: { data?: { error?: string; message?: string } } };
      setError(msg.response?.data?.error || msg.response?.data?.message || t('createProject.errorFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label={t('common.closeDialog')}
        onClick={() => !submitting && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-title"
        className="relative z-10 w-full max-w-md rounded-xl border border-border bg-elevated p-6 shadow-xl"
      >
        <form onSubmit={handleSubmit}>
          <h2 id="create-project-title" className="text-lg font-semibold text-primary">
            {t('projects.newProject')}
          </h2>
          <p className="mt-1 text-sm text-secondary">{t('createProject.intro')}</p>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="project-name" className="mb-1 block text-sm font-medium text-primary">
                {t('createProject.name')} <span className="text-danger">*</span>
              </label>
              <input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder={t('createProject.namePlaceholder')}
                autoFocus
                disabled={submitting}
              />
            </div>
            <div>
              <label htmlFor="project-desc" className="mb-1 block text-sm font-medium text-primary">
                {t('createProject.description')}
              </label>
              <textarea
                id="project-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder={t('createProject.descPlaceholder')}
                disabled={submitting}
              />
            </div>
            <div>
              <Select
                id="project-status"
                label={t('createProject.status')}
                value={status}
                onValueChange={(v) => setStatus(v as ProjectStatus)}
                disabled={submitting}
                options={statuses.map((s) => ({
                  value: s,
                  label: t(projectStatusTKey(s)),
                }))}
                placeholder={t('createProject.statusPlaceholder')}
              />
            </div>
          </div>

          {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm font-medium text-secondary transition-colors hover:bg-surface"
              onClick={() => !submitting && onClose()}
            >
              {t('common.cancel')}
            </button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
              loadingText={t('createProject.creating')}
              className="font-semibold"
            >
              {t('createProject.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
