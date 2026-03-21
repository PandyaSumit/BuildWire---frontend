import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { parseOrgRole } from '@/lib/rbac';
import { useSidebarMode } from '@/hooks/useSidebarMode';
import { getGlobalSidebarGroups } from '@/config/navigation/global-sidebar';
import { getProjectSidebarGroups } from '@/config/navigation/project-sidebar';
import type { NavItemDef } from '@/config/navigation/nav-types';
import { AccountDropdown } from '@/components/layout/AccountDropdown';

function isNavActive(pathname: string, item: NavItemDef): boolean {
  if (item.endMatch) {
    return pathname === item.to;
  }
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

export function Sidebar() {
  const { pathname } = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const orgRole = parseOrgRole(user?.org?.role);
  const sidebarMode = useSidebarMode();

  const navigation =
    sidebarMode.mode === 'project'
      ? getProjectSidebarGroups(sidebarMode.projectId, orgRole)
      : getGlobalSidebarGroups(orgRole);

  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountOpen) return;
    const onDown = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [accountOpen]);

  const displayName =
    user?.firstName || user?.lastName
      ? [user?.firstName, user?.lastName].filter(Boolean).join(' ')
      : user?.email ?? 'Account';
  const initials =
    user?.firstName?.[0] && user?.lastName?.[0]
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <>
    <aside className="w-64 h-screen bg-sidebar border-r border-border flex flex-col fixed left-0 top-0 z-30">
      <div
        className={`shrink-0 border-b border-border px-4 ${
          sidebarMode.mode === 'project' ? 'py-2' : 'flex h-16 items-center'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand">
            <span className="text-sm font-bold text-white dark:text-bg">BW</span>
          </div>
          <div className="min-w-0">
            <span className="block truncate text-base font-semibold text-primary">BuildWire</span>
            {sidebarMode.mode === 'project' ? (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">In project</span>
            ) : (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Organization</span>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        {navigation.map((group, groupIndex) => (
          <div key={group.label + groupIndex} className="mb-6">
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted uppercase tracking-wider">{group.label}</h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.id}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isNavActive(pathname, item)
                      ? 'bg-brand-light text-brand'
                      : 'text-secondary hover:bg-surface hover:text-primary'
                  }`}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {item.showAiBadge && (
                    <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-brand/15 text-brand">
                      AI
                    </span>
                  )}
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-danger text-white">{item.badge}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div ref={accountMenuRef} className="relative mt-auto border-t border-border p-4">
        <button
          type="button"
          onClick={() => setAccountOpen((o) => !o)}
          className="flex w-full items-center gap-3 rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-surface/80"
          aria-expanded={accountOpen}
          aria-haspopup="menu"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand font-semibold text-sm shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-primary truncate">{displayName}</p>
            {(user?.org?.name || user?.email) && (
              <p className="text-xs text-muted truncate">{user?.org?.name ?? user?.email}</p>
            )}
          </div>
          <svg
            className={`h-4 w-4 shrink-0 text-muted transition-transform ${accountOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <AccountDropdown open={accountOpen} onClose={() => setAccountOpen(false)} />
      </div>
    </aside>
    </>
  );
}
