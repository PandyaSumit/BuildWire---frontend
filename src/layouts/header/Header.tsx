import { useMemo, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  formatShellBreadcrumbFallback,
  orgShellBreadcrumbNavKey,
} from '@/utils/orgShellBreadcrumb';
import { useSidebarMode } from '@/hooks/useSidebarMode';
import { useSidebarLayout } from '@/layouts/sidebar/SidebarLayoutContext';
import { LanguageMenu } from './LanguageMenu';
import { GlobalSearchBar } from '@/layouts/search/GlobalSearchBar';
import { useOptionalProjectUi } from '@/hooks/project/useProjectUi';
import { useAiAssistant } from '@/components/ai-assistant';
import { WorkspaceSwitcherButton } from '@/components/workspace-switcher';
import { useWorkspaceSwitcher } from '@/components/workspace-switcher';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

const iconBtn =
  'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-primary/8 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40';

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { activeWorkspace } = useWorkspaceSwitcher();
  const sidebarMode = useSidebarMode();
  const showProjectBack = sidebarMode.mode === 'project';
  const isMessagesWorkspace = activeWorkspace === 'messages';
  const projectUi = useOptionalProjectUi();
  const { mobileOpen, setMobileOpen } = useSidebarLayout();
  const { open: aiOpen, toggle: toggleAiAssistant } = useAiAssistant();

  const shellBreadcrumbLabel = useMemo(() => {
    const key = orgShellBreadcrumbNavKey(pathname);
    if (key) return t(key);
    const fb = formatShellBreadcrumbFallback(pathname);
    return fb || t('nav.dashboard');
  }, [pathname, t]);

  // In the messages workspace the ConversationList sidebar provides its own
  // branded header row (with workspace switcher). Hide this global header entirely.
  if (isMessagesWorkspace) return null;

  return (
    <header className="sticky top-0 z-40 flex h-[52px] shrink-0 items-stretch gap-2 border-b border-border/50 bg-header/95 px-2.5 backdrop-blur-sm sm:px-4 dark:border-white/[0.05]">
      {/* Left: hamburger (narrow mobile) + breadcrumb — row uses items-center for vertical centering */}
      <div className="flex min-h-0 min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="hidden shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-primary/8 hover:text-primary sm:inline-flex md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          aria-label={mobileOpen ? t('header.closeMenu') : t('header.openMenu')}
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
          <nav
            aria-label="Breadcrumb"
            className="flex min-h-0 min-w-0 items-center gap-1 text-[11.5px] leading-none"
          >
            <Link
              to="/projects"
              className="inline-flex h-8 max-w-[40%] shrink-0 items-center truncate rounded-md px-1.5 text-muted transition-colors hover:bg-primary/6 hover:text-primary"
            >
              {t('header.allProjects')}
            </Link>
            <span className="shrink-0 text-muted/40">/</span>
            <span className="min-w-0 truncate font-medium leading-snug text-primary">
              {projectUi?.project.name ?? t('nav.projects')}
            </span>
          </nav>
        )}

        {!showProjectBack && (title || subtitle) && (
          <div className="min-w-0">
            {title && (
              <h1 className="truncate text-[13px] font-semibold tracking-tight text-primary leading-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="truncate text-[11px] leading-tight text-muted">{subtitle}</p>
            )}
          </div>
        )}

        {!showProjectBack && !title && (
          <nav
            aria-label={t('header.breadcrumbAria')}
            className="flex min-h-0 min-w-0 items-center gap-1 text-[12px] leading-none"
          >
            <span className="shrink-0 font-semibold text-primary">BuildWire</span>
            <span className="shrink-0 text-muted/40">/</span>
            <span className="min-w-0 truncate text-muted">{shellBreadcrumbLabel}</span>
          </nav>
        )}
      </div>

      <div className="hidden h-full w-full max-w-[15rem] flex-1 items-center sm:flex lg:max-w-[18rem]">
        <GlobalSearchBar className="max-w-full" />
      </div>

      <div className="flex h-full shrink-0 items-center gap-1">
        {actions}

        <div className="hidden md:block">
          <LanguageMenu />
        </div>

        <WorkspaceSwitcherButton />

        <button
          type="button"
          className={`${iconBtn} ${aiOpen ? 'bg-brand/12 text-brand' : ''}`}
          onClick={toggleAiAssistant}
          aria-label={t('header.aiAssistant', { defaultValue: 'AI assistant' })}
          aria-pressed={aiOpen}
        >
          <svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
            />
          </svg>
        </button>

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
