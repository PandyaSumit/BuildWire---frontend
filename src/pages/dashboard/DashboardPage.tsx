import { useTranslation } from 'react-i18next';

const ACTIVITY_ROWS = [
  {
    actionKey: 'dashboard.actNewProject' as const,
    project: 'Downtown Office Building',
    timeKey: 'dashboard.time2h' as const,
    type: 'success' as const,
  },
  {
    actionKey: 'dashboard.actTaskDone' as const,
    project: 'Residential Complex Phase 2',
    timeKey: 'dashboard.time5h' as const,
    type: 'success' as const,
  },
  {
    actionKey: 'dashboard.actBudgetAlert' as const,
    project: 'Highway Extension Project',
    timeKey: 'dashboard.time1d' as const,
    type: 'warning' as const,
  },
  {
    actionKey: 'dashboard.actTeamAdded' as const,
    project: 'Shopping Mall Renovation',
    timeKey: 'dashboard.time2d' as const,
    type: 'default' as const,
  },
];

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 p-6">
      <div className="flex h-16 shrink-0 flex-col justify-center">
        <h1 className="text-lg font-semibold leading-tight text-primary">{t('nav.dashboard')}</h1>
        <p className="mt-0.5 line-clamp-1 max-w-2xl text-sm leading-snug text-secondary">{t('dashboard.subtitle')}</p>
      </div>
      <div>
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-secondary">{t('dashboard.kpiTotalProjects')}</span>
              <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-primary">24</p>
                <p className="mt-1 text-xs text-success">{t('dashboard.kpiGrowth')}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-secondary">{t('dashboard.kpiActiveTasks')}</span>
              <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-primary">156</p>
                <p className="mt-1 text-xs text-warning">{t('dashboard.kpiDueWeek')}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-secondary">{t('dashboard.kpiTeamMembers')}</span>
              <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-primary">48</p>
                <p className="mt-1 text-xs text-success">{t('dashboard.kpiNewMembers')}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-secondary">{t('dashboard.kpiTotalBudget')}</span>
              <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-primary">$2.4M</p>
                <p className="mt-1 text-xs text-muted">{t('dashboard.kpiBudgetScope')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-6 text-xl font-semibold text-primary">{t('dashboard.recentActivity')}</h2>
          <div className="space-y-4">
            {ACTIVITY_ROWS.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div
                  className={`mt-2 h-2 w-2 rounded-full ${
                    item.type === 'success' ? 'bg-success' : item.type === 'warning' ? 'bg-warning' : 'bg-muted'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-primary">{t(item.actionKey)}</p>
                  <p className="truncate text-sm text-secondary">{item.project}</p>
                </div>
                <span className="whitespace-nowrap text-xs text-muted">{t(item.timeKey)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
