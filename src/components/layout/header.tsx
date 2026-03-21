import { ThemeToggle } from '@/components/theme-toggle';
import { Link } from 'react-router-dom';
import { useSidebarMode } from '@/hooks/useSidebarMode';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const sidebarMode = useSidebarMode();
  const showProjectBack = sidebarMode.mode === 'project';

  return (
    <header className="h-16 bg-header border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-surface rounded-lg transition-colors lg:hidden">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {showProjectBack && (
          <Link
            to="/projects"
            className="inline-flex items-center rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-secondary transition-colors hover:bg-muted/10 hover:text-primary"
          >
            ← All projects
          </Link>
        )}
        
        {(title || subtitle) && (
          <div>
            {title && <h1 className="text-lg font-semibold text-primary">{title}</h1>}
            {subtitle && <p className="text-sm text-secondary">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {actions}
        
        <button className="p-2 hover:bg-surface rounded-lg transition-colors relative">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <button className="p-2 hover:bg-surface rounded-lg transition-colors relative">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}
