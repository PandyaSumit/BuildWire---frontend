import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSidebarMode } from '@/hooks/useSidebarMode';
import { useSidebarLayout } from '@/components/layout/SidebarLayoutContext';
import { LanguageMenu } from '@/components/layout/LanguageMenu';
import { GlobalSearchBar } from '@/components/layout/GlobalSearchBar';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

const iconBtn =
  'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-primary/8 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40';

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { t } = useTranslation();
  const sidebarMode = useSidebarMode();
  const showProjectBack = sidebarMode.mode === 'project';
  const { mobileOpen, setMobileOpen } = useSidebarLayout();

  return (
    <header className="sticky top-0 z-40 flex h-[52px] items-center gap-2 border-b border-border/50 bg-header px-3 sm:gap-3 sm:px-5 dark:border-white/[0.05]">
      {/* Left: hamburger (mobile) + back link + page title */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {/* Hamburger — only visible on mobile/tablet (below lg) */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-primary/8 hover:text-primary lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          aria-label={mobileOpen ? t('header.closeMenu', { defaultValue: 'Close menu' }) : t('header.openMenu')}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {showProjectBack && (
          <Link
            to="/projects"
            className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-[12.5px] font-medium text-secondary transition-colors hover:bg-primary/6 hover:text-primary"
          >
            <svg
              className="h-3.5 w-3.5 rtl:rotate-180"
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
              <h1 className="truncate text-[14px] font-semibold tracking-tight text-primary leading-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="truncate text-[11.5px] leading-tight text-muted">{subtitle}</p>
            )}
          </div>
        )}
      </div>

      {/* Center: global search */}
      <div className="hidden w-full max-w-sm flex-1 sm:flex">
        <GlobalSearchBar className="max-w-full" />
      </div>

      {/* Right: actions + icons */}
      <div className="flex shrink-0 items-center gap-1">
        {actions}

        <button type="button" className={`sm:hidden ${iconBtn}`} aria-label={t('header.search')}>
          <svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <LanguageMenu />

        <button type="button" className={iconBtn} aria-label={t('header.notifications')}>
          <svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute end-1.5 top-1.5 h-[7px] w-[7px] rounded-full bg-danger ring-[1.5px] ring-header" />
        </button>
      </div>
    </header>
  );
}
