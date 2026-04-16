import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { AppPage } from '@/pages/shared/AppPage';
import { listProjects, createProject } from '@/services/project/projectApi';
import type { ProjectDto, ProjectStatus } from '@/types/project';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { ProjectCard } from '@/components/project/ProjectCard';
import { ProjectsListEmpty } from '@/components/project/ProjectsListEmpty';
import { CreateProjectModal } from '@/components/project/CreateProjectModal';
import { projectStatusTKey } from '@/utils/project/display';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 12;

function apiErrorMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { error?: string; message?: string } } };
  return e?.response?.data?.error || e?.response?.data?.message || fallback;
}

function isAbortError(err: unknown): boolean {
  if (axios.isCancel(err)) return true;
  const code = (err as { code?: string })?.code;
  const name = (err as { name?: string })?.name;
  return code === 'ERR_CANCELED' || name === 'AbortError' || name === 'CanceledError';
}

export default function ListPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const orgId = useAppSelector((s) => s.auth.user?.org?.id);
  const orgRole = useAppSelector((s) => s.auth.user?.org?.role);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);
  const [statusFilter, setStatusFilter] = useState<'' | ProjectStatus>('');
  const [page, setPage] = useState(1);

  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    pages: number;
    hasMore: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtersResetSkip = useRef(true);

  /** Server: `POST .../projects` allows `org_admin` and `org_member` only. */
  const canCreate = orgRole === 'org_admin' || orgRole === 'org_member';

  /** Reset page when filters change (not on first mount) so we don’t double-fetch the same page. */
  useEffect(() => {
    if (filtersResetSkip.current) {
      filtersResetSkip.current = false;
      return;
    }
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    if (!orgId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const loadErr = t('projects.loadError');

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await listProjects(
          orgId,
          {
            page,
            limit: PAGE_SIZE,
            search: debouncedSearch || undefined,
            status: statusFilter || undefined,
          },
          controller.signal
        );
        if (controller.signal.aborted) return;
        setProjects(res.data);
        setPagination(res.pagination);
      } catch (err) {
        if (controller.signal.aborted || isAbortError(err)) return;
        setError(apiErrorMessage(err, loadErr));
        setProjects([]);
        setPagination(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [orgId, page, debouncedSearch, statusFilter, i18n.language]);

  const refreshAfterCreate = useCallback(async () => {
    if (!orgId) return;
    const loadErr = t('projects.loadError');
    setLoading(true);
    setError(null);
    try {
      const res = await listProjects(orgId, {
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      });
      setProjects(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(apiErrorMessage(err, loadErr));
      setProjects([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [orgId, page, debouncedSearch, statusFilter, i18n.language]);

  async function handleCreate(body: { name: string; description: string; status: ProjectStatus }) {
    if (!orgId) return;
    const created = await createProject(orgId, {
      name: body.name,
      description: body.description || undefined,
      status: body.status,
    });
    await refreshAfterCreate();
    navigate(`/projects/${created.id}`);
  }

  const hasFilters = Boolean(debouncedSearch.trim() || statusFilter);

  return (
    <AppPage title={t('nav.projects')} description={t('projects.pageDescription')}>
      {!orgId ? (
        <div className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-primary">
          {t('projects.noOrg')}
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1 sm:max-w-md">
                <svg
                  className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('projects.searchPlaceholder')}
                  className="w-full rounded-lg border border-border bg-bg py-2 ps-10 pe-3 text-sm text-primary placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  aria-label={t('projects.searchAria')}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as '' | ProjectStatus)}
                placeholder={t('projects.allStatuses')}
                fullWidth={false}
                triggerClassName="w-full sm:w-48"
                options={[
                  { value: '', label: t('projects.allStatuses') },
                  ...(['planning', 'active', 'on_hold', 'completed', 'archived'] as const).map((s) => ({
                    value: s,
                    label: t(projectStatusTKey(s)),
                  })),
                ]}
                aria-label={t('projects.filterStatusAria')}
              />
            </div>
            {canCreate ? (
              <Button
                type="button"
                variant="primary"
                className="shrink-0 font-semibold"
                onClick={() => setCreateOpen(true)}
              >
                {t('projects.newProject')}
              </Button>
            ) : null}
          </div>

          {error ? (
            <div className="mb-6 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-primary">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-xl border border-border bg-muted/10"
                />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <ProjectsListEmpty hasFilters={hasFilters} />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {projects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>

              {pagination && pagination.pages > 1 ? (
                <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
                  <p className="text-sm text-secondary">
                    {pagination.total === 1
                      ? t('projects.pageSummaryOne', {
                          page: pagination.page,
                          pages: pagination.pages,
                          total: pagination.total,
                        })
                      : t('projects.pageSummaryMany', {
                          page: pagination.page,
                          pages: pagination.pages,
                          total: pagination.total,
                        })}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={pagination.page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {t('common.previous')}
                    </button>
                    <button
                      type="button"
                      disabled={!pagination.hasMore}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {t('common.next')}
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}

          <CreateProjectModal
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onSubmit={handleCreate}
          />
        </>
      )}
    </AppPage>
  );
}
