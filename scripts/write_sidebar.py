content = r'''import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import { parseOrgRole } from "@/lib/rbac";
import { useSidebarMode } from "@/hooks/useSidebarMode";
import { getGlobalSidebarGroups } from "@/config/navigation/global-sidebar";
import { getProjectSidebarGroups } from "@/config/navigation/project-sidebar";
import type { NavItemDef } from "@/config/navigation/nav-types";
import { AccountDropdown } from "@/components/layout/AccountDropdown";
import { useSidebarLayout } from "@/components/layout/SidebarLayoutContext";
import { BuildWireMark } from "@/components/brand/BuildWireMark";
import { BuildWireLogo } from "@/components/brand/BuildWireLogo";

function isNavActive(pathname: string, item: NavItemDef): boolean {
  if (item.endMatch) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

const iconBtn =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-primary/8 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40";

export function Sidebar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const orgRole = parseOrgRole(user?.org?.role);
  const sidebarMode = useSidebarMode();
  const { collapsed, toggle } = useSidebarLayout();

  const navigation =
    sidebarMode.mode === "project"
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
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [accountOpen]);

  const displayName =
    user?.firstName || user?.lastName
      ? [user?.firstName, user?.lastName].filter(Boolean).join(" ")
      : (user?.email ?? t("account.fallbackName"));
  const initials =
    user?.firstName?.[0] && user?.lastName?.[0]
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : (user?.email?.[0]?.toUpperCase() ?? "?");

  return (
    <>
      <aside
        className={`fixed start-0 top-0 z-30 flex h-dvh max-h-dvh flex-col bg-sidebar transition-[width] duration-200 ease-out border-e border-border/50 dark:border-white/[0.05] ${
          collapsed ? "w-14" : "w-60"
        }`}
      >
        {/* Logo / Brand */}
        <div
          className={`shrink-0 border-b border-border/40 dark:border-white/[0.05] ${
            collapsed
              ? "flex h-[52px] items-center justify-center px-2"
              : "flex h-[52px] items-center px-3"
          }`}
        >
          {collapsed ? (
            <button
              type="button"
              onClick={toggle}
              className={iconBtn}
              aria-expanded={false}
              aria-label={t("sidebar.expand")}
              title={t("sidebar.expand")}
            >
              <BuildWireMark size={20} strokeWidth={1.75} decorative />
            </button>
          ) : (
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand text-white shadow-token-sm dark:text-bg">
                  <BuildWireLogo size={16} decorative />
                </div>
                <span className="block truncate text-[14.5px] font-semibold tracking-tight text-primary">
                  {t("brand.name")}
                </span>
              </div>
              <button
                type="button"
                onClick={toggle}
                className={iconBtn}
                aria-expanded
                aria-label={t("sidebar.collapse")}
                title={t("sidebar.collapse")}
              >
                <BuildWireMark size={20} strokeWidth={1.75} decorative />
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav
          className={`scrollbar-none flex-1 overflow-y-auto overflow-x-hidden ${
            collapsed ? "px-1.5 py-2" : "px-2 py-3"
          }`}
        >
          {navigation.map((group, groupIndex) => (
            <div key={group.groupKey + groupIndex} className={collapsed ? "mb-3" : "mb-4"}>
              <h3
                className={`mb-1 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted/70 ${
                  collapsed ? "sr-only" : "px-2.5"
                }`}
              >
                {t(`navGroup.${group.groupKey}`)}
              </h3>
              <div className="flex flex-col gap-px">
                {group.items.map((item) => {
                  const active = isNavActive(pathname, item);
                  const itemLabel = t(`nav.${item.itemKey}`);
                  return (
                    <Link
                      key={item.id}
                      to={item.to}
                      title={collapsed ? itemLabel : undefined}
                      className={`relative flex items-center rounded-md text-[13px] font-medium leading-5 transition-colors duration-150 ${
                        collapsed
                          ? "justify-center px-2 py-2"
                          : "gap-2.5 px-2.5 py-[7px]"
                      } ${
                        active
                          ? "bg-brand/8 text-primary dark:bg-brand/10"
                          : "text-secondary hover:bg-primary/6 hover:text-primary"
                      }`}
                    >
                      {!collapsed && active && (
                        <span
                          className="absolute start-0 top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-full bg-brand"
                          aria-hidden
                        />
                      )}
                      <span
                        className={`shrink-0 [&>svg]:h-[17px] [&>svg]:w-[17px] transition-colors duration-150 ${
                          active ? "text-brand" : "text-muted"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {!collapsed && (
                        <span className="min-w-0 flex-1 truncate">{itemLabel}</span>
                      )}
                      {!collapsed && item.showAiBadge && (
                        <span className="shrink-0 rounded-md border border-border px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-muted dark:text-secondary">
                          {t("nav.aiBadge")}
                        </span>
                      )}
                      {!collapsed && item.badge && (
                        <span className="shrink-0 rounded-full bg-danger/90 px-1.5 py-px text-[10px] font-bold leading-tight text-white">
                          {item.badge}
                        </span>
                      )}
                      {collapsed && item.badge && (
                        <span
                          className="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger ring-2 ring-sidebar"
                          aria-hidden
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Account footer */}
        <div
          ref={accountMenuRef}
          className={`relative shrink-0 border-t border-border/40 dark:border-white/[0.05] ${
            collapsed ? "p-1.5" : "p-2"
          }`}
        >
          <button
            type="button"
            onClick={() => setAccountOpen((o) => !o)}
            className={`flex w-full items-center rounded-lg text-start transition-colors duration-150 hover:bg-primary/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
              collapsed ? "justify-center p-2" : "gap-2.5 px-2 py-2"
            }`}
            aria-expanded={accountOpen}
            aria-haspopup="menu"
            title={collapsed ? displayName : undefined}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-border/60 dark:ring-white/10"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/12 text-[11px] font-bold text-brand ring-1 ring-brand/20 dark:bg-brand/15 dark:ring-brand/25">
                {initials}
              </div>
            )}
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold leading-tight text-primary">
                    {displayName}
                  </p>
                  {(user?.org?.name || user?.email) && (
                    <p className="mt-px truncate text-[11px] leading-tight text-muted">
                      {user?.org?.name ?? user?.email}
                    </p>
                  )}
                </div>
                <svg
                  className={`h-3.5 w-3.5 shrink-0 text-muted transition-transform duration-150 ${
                    accountOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
          <AccountDropdown
            open={accountOpen}
            onClose={() => setAccountOpen(false)}
            collapsed={collapsed}
          />
        </div>
      </aside>
    </>
  );
}
'''

with open('C:/SUMIT/Ideas/BuildWire-frontend/src/components/layout/sidebar.tsx', 'w', newline='\n') as f:
    f.write(content)
print('Sidebar written successfully')
