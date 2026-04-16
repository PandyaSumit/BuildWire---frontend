import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProjectDto, ProjectStatus } from '@/types/project';
import { projectStatusTKey } from '@/utils/project/display';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const statuses: ProjectStatus[] = ['planning', 'active', 'on_hold', 'completed', 'archived'];

type Props = {
  open: boolean;
  project: ProjectDto | null;
  onClose: () => void;
  onSubmit: (body: {
    name: string;
    description: string;
    status: ProjectStatus;
    startDate: string | null;
    endDate: string | null;
  }) => Promise<void>;
};

function dateInputValue(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = iso.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : '';
}

export function EditProjectModal({ open, project, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('planning');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!project || !open) return;
    setName(project.name);
    setDescription(project.description ?? '');
    setStatus(project.status);
    setStartDate(dateInputValue(project.start_date));
    setEndDate(dateInputValue(project.end_date));
    setError(null);
  }, [project, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, submitting, onClose]);

  if (!open || !project) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('editProject.errorNameRequired'));
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        name: trimmed,
        description: description.trim(),
        status,
        startDate: startDate.trim() || null,
        endDate: endDate.trim() || null,
      });
      onClose();
    } catch (err) {
      const msg = err as { response?: { data?: { error?: string; message?: string } } };
      setError(msg.response?.data?.error || msg.response?.data?.message || t('editProject.errorFailed'));
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
        aria-labelledby="edit-project-title"
        className="relative z-10 w-full max-w-md rounded-xl border border-border bg-elevated p-6 shadow-xl"
      >
        <form onSubmit={handleSubmit}>
          <h2 id="edit-project-title" className="text-lg font-semibold text-primary">
            {t('editProject.title')}
          </h2>
          <p className="mt-1 text-sm text-secondary">{t('editProject.intro')}</p>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="edit-project-name" className="mb-1 block text-sm font-medium text-primary">
                {t('createProject.name')} <span className="text-danger">*</span>
              </label>
              <input
                id="edit-project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                disabled={submitting}
              />
            </div>
            <div>
              <label htmlFor="edit-project-desc" className="mb-1 block text-sm font-medium text-primary">
                {t('createProject.description')}
              </label>
              <textarea
                id="edit-project-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                disabled={submitting}
              />
            </div>
            <div>
              <Select
                id="edit-project-status"
                label={t('createProject.status')}
                value={status}
                onValueChange={(v) => setStatus(v as ProjectStatus)}
                disabled={submitting}
                options={statuses.map((s) => ({
                  value: s,
                  label: t(projectStatusTKey(s)),
                }))}
                placeholder={t('editProject.statusPlaceholder')}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-start" className="mb-1 block text-sm font-medium text-primary">
                  {t('editProject.startDate')}
                </label>
                <input
                  id="edit-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-primary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  disabled={submitting}
                />
              </div>
              <div>
                <label htmlFor="edit-end" className="mb-1 block text-sm font-medium text-primary">
                  {t('editProject.endDate')}
                </label>
                <input
                  id="edit-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-primary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  disabled={submitting}
                />
              </div>
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
              loadingText={t('editProject.saving')}
              className="font-semibold"
            >
              {t('prefs.saveChanges')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
