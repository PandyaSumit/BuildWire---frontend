export function ProjectsListEmpty({ hasFilters }: { hasFilters: boolean }) {
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
        {hasFilters ? 'No projects match your filters' : 'No projects yet'}
      </p>
      <p className="mt-1 max-w-sm text-sm text-secondary">
        {hasFilters
          ? 'Try clearing search or filters, or create a new project.'
          : 'Create your first project to start tracking work, files, and tasks in one place.'}
      </p>
    </div>
  );
}
