import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSidebarMode } from '@/hooks/useSidebarMode';
import { LanguageMenu } from '@/components/layout/LanguageMenu';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

const iconBtn =
  'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-muted/12 hover:text-primary';

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { t } = useTranslation();
  const sidebarMode = useSidebarMode();
  const showProjectBack = sidebarMode.mode === 'project';

  return (
    <header className="sticky top-0 z-40 flex h-[52px] items-center justify-between border-b border-border/50 bg-header px-5 dark:border-white/[0.06]">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-muted transition-colors hover:bg-muted/12 hover:text-primary lg:hidden"
          aria-label={t('header.openMenu')}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {showProjectBack && (
          <Link
            to="/projects"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[13px] font-medium text-secondary transition-colors hover:bg-muted/10 hover:text-primary"
          >
            <svg
              className="h-4 w-4 rtl:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">{t('header.allProjects')}</span>
          </Link>
        )}

        {(title || subtitle) && (
          <div className="min-w-0">
            {title && (
              <h1 className="truncate text-[15px] font-semibold tracking-tight text-primary">{title}</h1>
            )}
            {subtitle && (
              <p className="truncate text-[13px] text-muted">{subtitle}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {actions}

        <LanguageMenu />

        <button type="button" className={iconBtn} aria-label={t('header.search')}>
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <button type="button" className={iconBtn} aria-label={t('header.notifications')}>
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger ring-2 ring-header" />
        </button>
      </div>
    </header>
  );
}
