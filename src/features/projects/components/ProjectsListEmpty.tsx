import { useTranslation } from 'react-i18next';

export function ProjectsListEmpty({ hasFilters }: { hasFilters: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/5 px-6 py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-primary">
        {hasFilters ? t('projects.emptyFilteredTitle') : t('projects.emptyTitle')}
      </p>
      <p className="mt-1 max-w-sm text-sm text-secondary">
        {hasFilters ? t('projects.emptyFilteredHint') : t('projects.emptyHint')}
      </p>
    </div>
  );
}
