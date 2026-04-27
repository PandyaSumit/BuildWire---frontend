import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

type FieldType = { value: string; labelKey: string; icon: React.ReactNode };

const FIELD_TYPES: FieldType[] = [
  {
    value: 'single-select',
    labelKey: 'tasks.addField.typeSingleSelect',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
        <circle cx="8" cy="8" r="6" />
        <path d="M5.5 8.5l2 2 3-3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: 'multi-select',
    labelKey: 'tasks.addField.typeMultiSelect',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
        <rect x="2" y="2" width="5" height="5" rx="1" />
        <rect x="9" y="2" width="5" height="5" rx="1" />
        <rect x="2" y="9" width="5" height="5" rx="1" />
        <path d="M10 11.5l1.5 1.5 2.5-2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: 'text',
    labelKey: 'tasks.addField.typeText',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        <path d="M2.5 3.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H8.75v9.5a.5.5 0 0 1-1 0V4H3a.5.5 0 0 1-.5-.5z" />
      </svg>
    ),
  },
  {
    value: 'number',
    labelKey: 'tasks.addField.typeNumber',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        <path d="M4 2.5a.5.5 0 0 0-1 0v11a.5.5 0 0 0 1 0v-11zm7 0a.5.5 0 0 0-1 0v11a.5.5 0 0 0 1 0v-11zM2 5.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0 5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
      </svg>
    ),
  },
  {
    value: 'date',
    labelKey: 'tasks.addField.typeDate',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
        <rect x="2" y="3" width="12" height="11" rx="1.5" />
        <path d="M5 1.5v3M11 1.5v3M2 7h12" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: 'checkbox',
    labelKey: 'tasks.addField.typeCheckbox',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
        <rect x="2" y="2" width="12" height="12" rx="2" />
        <path d="M5 8l2.5 2.5L11 5.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: 'url',
    labelKey: 'tasks.addField.typeUrl',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
        <path d="M6.5 9.5a3.535 3.535 0 0 0 5 0l2-2a3.535 3.535 0 0 0-5-5L7.5 3.5" strokeLinecap="round" />
        <path d="M9.5 6.5a3.535 3.535 0 0 0-5 0l-2 2a3.535 3.535 0 0 0 5 5l1-1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: 'people',
    labelKey: 'tasks.addField.typePeople',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-4 6s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H4z" />
      </svg>
    ),
  },
];

type Option = { id: string; value: string };

const OPTION_COLORS = [
  'bg-emerald-500', 'bg-rose-500', 'bg-amber-500',
  'bg-sky-500', 'bg-violet-500', 'bg-pink-500',
];

type Props = {
  open: boolean;
  onClose: () => void;
  onCreateField: (field: {
    title: string;
    type: string;
    options: string[];
    addToLibrary: boolean;
    notifyCollaborators: boolean;
  }) => void;
};

export function AddFieldModal({ open, onClose, onCreateField }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const [title, setTitle] = useState('');
  const [fieldType, setFieldType] = useState('single-select');
  const [typeOpen, setTypeOpen] = useState(false);
  const [options, setOptions] = useState<Option[]>([
    { id: crypto.randomUUID(), value: '' },
    { id: crypto.randomUUID(), value: '' },
  ]);
  const [addToLibrary, setAddToLibrary] = useState(false);
  const [notifyCollaborators, setNotifyCollaborators] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [manageAccessOpen, setManageAccessOpen] = useState(false);
  const [inviteQuery, setInviteQuery] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  const selectedType = FIELD_TYPES.find((f) => f.value === fieldType) ?? FIELD_TYPES[0];
  const isSelectType = fieldType === 'single-select' || fieldType === 'multi-select';

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => titleRef.current?.focus(), 50);
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!typeOpen) return;
    const onClick = (e: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) setTypeOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [typeOpen]);

  function addOption() {
    setOptions((prev) => [...prev, { id: crypto.randomUUID(), value: '' }]);
  }

  function removeOption(id: string) {
    setOptions((prev) => prev.filter((o) => o.id !== id));
  }

  function updateOption(id: string, value: string) {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, value } : o)));
  }

  function handleCreate() {
    if (!title.trim()) { titleRef.current?.focus(); return; }
    onCreateField({
      title: title.trim(),
      type: fieldType,
      options: options.map((o) => o.value).filter(Boolean),
      addToLibrary,
      notifyCollaborators,
    });
    setTitle('');
    setFieldType('single-select');
    setOptions([{ id: crypto.randomUUID(), value: '' }, { id: crypto.randomUUID(), value: '' }]);
    setAddToLibrary(false);
    setNotifyCollaborators(false);
    setDescOpen(false);
    setDescription('');
    onClose();
  }

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label={t('common.closeDialog')}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[201] flex w-full max-w-[660px] flex-col rounded-2xl border border-border bg-elevated shadow-2xl shadow-black/60"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-6 pb-4 pt-5">
          <h2 id={titleId} className="text-lg font-semibold text-primary">
            {t('tasks.addField.title')}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setManageAccessOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-secondary transition-colors hover:border-border/80 hover:text-primary"
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-4 6s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H4z" />
              </svg>
              {t('tasks.addField.manageAccess')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-primary"
              aria-label={t('common.close')}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-5">
            {/* Field title + type row */}
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-[12px] font-medium text-primary">
                  {t('tasks.addField.fieldTitle')}
                  <span className="ml-0.5 text-danger">*</span>
                </label>
                <input
                  ref={titleRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('tasks.addField.fieldTitlePlaceholder')}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-primary placeholder:text-muted focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-primary">{t('tasks.addField.fieldType')}</label>
                <div className="relative" ref={typeRef}>
                  <button
                    type="button"
                    onClick={() => setTypeOpen((v) => !v)}
                    className="flex h-[38px] min-w-[185px] items-center gap-2 rounded-lg border border-border bg-bg px-3 text-sm text-primary transition-colors hover:border-border/80"
                  >
                    <span className="text-muted">{selectedType.icon}</span>
                    <span className="flex-1 text-left">{t(selectedType.labelKey)}</span>
                    <svg className="h-4 w-4 shrink-0 text-muted" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                      <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06z" />
                    </svg>
                  </button>

                  {typeOpen && (
                    <div className="absolute left-0 top-full z-10 mt-1 max-h-48 w-full min-w-[200px] overflow-y-auto rounded-xl border border-border bg-elevated py-1 shadow-xl shadow-black/30">
                      {FIELD_TYPES.map((ft) => (
                        <button
                          key={ft.value}
                          type="button"
                          onClick={() => { setFieldType(ft.value); setTypeOpen(false); }}
                          className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-surface ${ft.value === fieldType ? 'text-brand' : 'text-primary'}`}
                        >
                          <span className="text-muted">{ft.icon}</span>
                          {t(ft.labelKey)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {descOpen ? (
              <textarea
                autoFocus
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('tasks.addField.descriptionPlaceholder')}
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-primary placeholder:text-muted focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            ) : (
              <button
                type="button"
                onClick={() => setDescOpen(true)}
                className="flex w-fit items-center gap-1 text-sm text-secondary hover:text-primary"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                  <path d="M8 3a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5v-3.5A.75.75 0 0 1 8 3z" />
                </svg>
                {t('tasks.addField.addDescription')}
              </button>
            )}

            {/* Options — only for select types */}
            {isSelectType && (
              <div>
                <p className="mb-3 text-[12px] font-medium text-primary">
                  {t('tasks.addField.options')}
                  <span className="ml-0.5 text-danger">*</span>
                </p>
                <div className="flex flex-col gap-2">
                  {options.map((opt, i) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <span className={`h-5 w-5 shrink-0 rounded-full ${OPTION_COLORS[i % OPTION_COLORS.length]}`} />
                      <input
                        type="text"
                        value={opt.value}
                        onChange={(e) => updateOption(opt.id, e.target.value)}
                        placeholder={t('tasks.addField.optionPlaceholder')}
                        className="flex-1 rounded-lg border border-border bg-bg px-3 py-1.5 text-sm text-primary placeholder:text-muted focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(opt.id)}
                        className="rounded p-1 text-muted hover:text-danger"
                        aria-label={t('tasks.addField.removeOption')}
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                          <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOption}
                    className="flex w-fit items-center gap-1 text-sm text-secondary hover:text-primary"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                      <path d="M8 3a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5v-3.5A.75.75 0 0 1 8 3z" />
                    </svg>
                    {t('tasks.addField.addOption')}
                  </button>
                </div>
              </div>
            )}

            {/* Checkboxes */}
            <div className="flex flex-col gap-3 pt-1">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={addToLibrary}
                  onChange={(e) => setAddToLibrary(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-bg text-brand focus:ring-brand/30"
                />
                <span className="text-sm text-primary">{t('tasks.addField.addToLibrary')}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={notifyCollaborators}
                  onChange={(e) => setNotifyCollaborators(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-bg text-brand focus:ring-brand/30"
                />
                <span className="text-sm text-primary">{t('tasks.addField.notifyCollaborators')}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border/60 bg-elevated px-6 py-4">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="button" onClick={handleCreate} disabled={!title.trim()} variant="primary" size="sm">
            {t('tasks.addField.createField')}
          </Button>
        </div>

        {/* Field Members slide-over — overlays the dialog */}
        {manageAccessOpen && (
          <div className="absolute inset-0 z-10 flex flex-col rounded-2xl bg-elevated">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-6 pb-4 pt-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setManageAccessOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-primary"
                  aria-label="Back"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-lg font-semibold text-primary">{t('tasks.addField.fieldMembers')}</h2>
              </div>
              <button
                type="button"
                onClick={() => setManageAccessOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-primary"
                aria-label={t('common.close')}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Upgrade banner */}
            <div className="mx-5 mb-4 mt-4 shrink-0 flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
              <svg className="h-5 w-5 shrink-0 text-warning" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4zm0 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
              </svg>
              <span className="flex-1 text-sm text-secondary">{t('tasks.addField.upgradeMsg')}</span>
              <button type="button" className="shrink-0 rounded-lg border border-warning/40 bg-transparent px-3 py-1 text-xs font-semibold text-warning hover:bg-warning/10">
                {t('tasks.addField.contactSales')}
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-5">
              {/* Invite */}
              <div>
                <p className="mb-2 text-sm font-semibold text-primary">{t('tasks.addField.invite')}</p>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2.5">
                  <input
                    type="text"
                    value={inviteQuery}
                    onChange={(e) => setInviteQuery(e.target.value)}
                    placeholder={t('tasks.addField.invitePlaceholder')}
                    className="flex-1 bg-transparent text-sm text-primary placeholder:text-muted focus:outline-none"
                  />
                </div>
              </div>

              {/* Field access */}
              <div>
                <p className="mb-2 text-sm font-semibold text-primary">{t('tasks.addField.fieldAccess')}</p>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                  <svg className="h-5 w-5 shrink-0 text-muted" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                    <path d="M5.5 3.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0zM3 9.5C3 8.12 4.12 7 5.5 7h5C11.88 7 13 8.12 13 9.5V12H3V9.5z" />
                  </svg>
                  <span className="text-sm text-secondary">{t('tasks.addField.projectMembers')}</span>
                </div>
              </div>

              {/* Field members */}
              <div>
                <p className="mb-3 text-sm font-semibold text-primary">{t('tasks.addField.fieldMembersLabel')}</p>
                <div className="divide-y divide-border/50 overflow-hidden rounded-xl border border-border bg-surface">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/20">
                      <svg className="h-5 w-5 text-muted" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                        <path d="M5.5 3.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0zM3 9.5C3 8.12 4.12 7 5.5 7h5C11.88 7 13 8.12 13 9.5V12H3V9.5z" />
                      </svg>
                    </div>
                    <span className="flex-1 text-sm text-primary">{t('tasks.addField.adminsEditors')}</span>
                    <div className="flex items-center gap-1 text-sm text-secondary">
                      <span>{t('tasks.addField.roleFieldAdmin')}</span>
                      <svg className="h-3.5 w-3.5 text-muted" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                        <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/20">
                      <svg className="h-5 w-5 text-muted" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM6.5 5.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zM5 9.5A2.5 2.5 0 0 1 7.5 7h1A2.5 2.5 0 0 1 11 9.5V11H5V9.5z" />
                      </svg>
                    </div>
                    <span className="flex-1 text-sm text-primary">{t('tasks.addField.guests')}</span>
                    <span className="text-sm text-secondary">{t('tasks.addField.roleUser')}</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                      AW
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm text-primary">Alexander Whitmore</span>
                      <span className="text-xs text-muted">alex.whitmore@buildwire.io</span>
                    </div>
                    <span className="text-sm text-secondary">{t('tasks.addField.roleFieldAdmin')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
