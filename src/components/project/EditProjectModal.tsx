import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProjectDto, ProjectStatus } from '@/types/project';
import { projectStatusTKey } from '@/utils/project/display';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { IconPencilLine } from '@/components/ui/icons';

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
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!project || !open) return;
    setName(project.name);
    setDescription(project.description ?? '');
    setStatus(project.status);
    setStartDate(dateInputValue(project.start_date));
    setEndDate(dateInputValue(project.end_date));
    setNameError(null);
    setSubmitError(null);
  }, [project, open]);

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

  if (!open || !project) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setNameError(null);
    setSubmitError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(t('editProject.errorNameRequired'));
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
      setSubmitError(msg.response?.data?.error || msg.response?.data?.message || t('editProject.errorFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
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
        aria-labelledby="edit-project-title"
        className="relative z-10 flex w-full max-w-md flex-col rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/60"
        style={{ maxHeight: '90vh' }}
      >
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          {/* Header */}
          <div className="flex shrink-0 items-start justify-between px-6 pt-5 pb-4">
            <div>
              <h2 id="edit-project-title" className="text-xl font-semibold text-primary">
                {t('editProject.title')}
              </h2>
              <p className="mt-1 text-sm text-secondary">{t('editProject.intro')}</p>
            </div>
            <button
              type="button"
              onClick={() => !submitting && onClose()}
              className="rounded-lg p-1.5 text-muted hover:bg-white/5 hover:text-primary"
              aria-label={t('common.close')}
            >
              <svg className="h-5 w-5" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M13.78 3.28a.75.75 0 0 0-1.06-1.06L8 6.94 3.28 2.22a.75.75 0 0 0-1.06 1.06L6.94 8l-4.72 4.72a.75.75 0 1 0 1.06 1.06L8 9.06l4.72 4.72a.75.75 0 1 0 1.06-1.06L9.06 8l4.72-4.72z" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 pb-2">
            <div className="space-y-4 py-2">
              <div>
                <label htmlFor="edit-project-name" className="mb-1 block text-sm font-medium text-primary">
                  {t('createProject.name')} <span className="text-danger">*</span>
                </label>
                <input
                  id="edit-project-name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameError(null); }}
                  className={`w-full rounded-lg border bg-bg px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-1 ${nameError ? 'border-danger focus:border-danger focus:ring-danger' : 'border-border focus:border-brand focus:ring-brand'}`}
                  disabled={submitting}
                />
                {nameError ? <p className="mt-1 text-xs text-danger">{nameError}</p> : null}
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
            {submitError ? <p className="pb-2 text-sm text-danger">{submitError}</p> : null}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-zinc-700/60 px-6 py-4">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => !submitting && onClose()}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              loadingText={t('editProject.saving')}
            >
              <IconPencilLine className="mr-1.5" />{t('prefs.saveChanges')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
