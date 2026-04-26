import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import { parseOrgRole } from "@/lib/rbac";
import { useSidebarMode } from "@/hooks/useSidebarMode";
import { getGlobalSidebarGroups } from "@/config/navigation/global-sidebar";
import { getProjectSidebarGroups } from "@/config/navigation/project-sidebar";
import { getHiringSidebarGroups } from "@/config/navigation/hiring/sidebar";
import type { NavItemDef } from "@/config/navigation/nav-types";
import { AccountDropdown } from "@/components/layout/AccountDropdown";
import { useSidebarLayout } from "@/components/layout/SidebarLayoutContext";
import { BuildWireMark } from "@/components/brand/BuildWireMark";
import { BuildWireLogo } from "@/components/brand/BuildWireLogo";
import { useWorkspaceSwitcher } from "@/components/workspace-switcher";

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
  const { activeWorkspace } = useWorkspaceSwitcher();
  const { collapsed, toggle, mobileOpen, setMobileOpen, tabletIconRail } = useSidebarLayout();
  const isMessagesWorkspace = activeWorkspace === "messages";

  // Phone drawer expanded when open; tablet (md–lg) always icon rail; desktop uses persisted collapse.
  const effectiveCollapsed = tabletIconRail || (mobileOpen ? false : collapsed);

  const navigation =
    activeWorkspace === "hiring"
      ? getHiringSidebarGroups()
      : sidebarMode.mode === "project"
          ? getProjectSidebarGroups(sidebarMode.projectId, orgRole)
          : getGlobalSidebarGroups(orgRole);

  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

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

  // In messages workspace the ConversationList provides its own full-height sidebar.
  if (isMessagesWorkspace) return null;

  return (
    <>
      <aside
        className={[
          "fixed flex flex-col bg-sidebar transition-[transform,width] duration-200 ease-out",
          "max-md:z-50 md:z-30",
          // Phone: bottom sheet (< md)
          "max-md:inset-x-2 max-md:bottom-2 max-md:top-auto max-md:h-[78dvh] max-md:max-h-[82dvh] max-md:w-auto max-md:rounded-2xl max-md:border max-md:border-border/60 max-md:shadow-token-xl",
          mobileOpen ? "max-md:translate-y-0" : "max-md:translate-y-[calc(100%+1rem)]",
          // Tablet + desktop: docked left rail (md is always narrow; lg picks width from collapse)
          "md:left-0 md:right-auto md:top-0 md:bottom-auto md:h-dvh md:max-h-dvh md:translate-y-0 md:rounded-none md:border-e md:border-t-0 md:border-b-0 md:border-s-0 md:border-border/50 md:shadow-none dark:md:border-white/[0.05]",
          "md:w-14",
          collapsed ? "lg:w-14" : "lg:w-60",
        ].join(" ")}
      >
        <div
          className={`shrink-0 border-b border-border/40 dark:border-white/[0.05] ${
            effectiveCollapsed && !mobileOpen
              ? "flex h-[52px] items-center justify-center px-2"
              : "flex h-[52px] items-center px-3"
          }`}
        >
          {mobileOpen ? (
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
                onClick={() => setMobileOpen(false)}
                className={iconBtn}
                aria-label={t("sidebar.close", { defaultValue: "Close menu" })}
                title={t("sidebar.close", { defaultValue: "Close menu" })}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : effectiveCollapsed ? (
            <button
              type="button"
              onClick={toggle}
              className={`${iconBtn} hidden md:inline-flex`}
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
                className={`${iconBtn} hidden lg:inline-flex`}
                aria-expanded
                aria-label={t("sidebar.collapse")}
                title={t("sidebar.collapse")}
              >
                <BuildWireMark size={20} strokeWidth={1.75} decorative />
              </button>
            </div>
          )}
        </div>

        <nav
          className={`scrollbar-none flex-1 overflow-y-auto overflow-x-hidden ${
            effectiveCollapsed ? "px-1.5 py-2" : "px-2 py-3"
          }`}
        >
          {navigation.map((group, groupIndex) => (
              <div key={group.groupKey + groupIndex} className={effectiveCollapsed ? "mb-3" : "mb-4"}>
                <h3
                  className={`mb-1 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted/70 ${
                    effectiveCollapsed ? "sr-only" : "px-2.5"
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
                        title={effectiveCollapsed ? itemLabel : undefined}
                        className={`relative flex items-center rounded-md text-[13px] font-medium leading-5 transition-colors duration-150 ${
                          effectiveCollapsed
                            ? "justify-center px-2 py-2"
                            : "gap-2.5 px-2.5 py-[7px]"
                        } ${
                          active
                            ? "bg-brand/8 text-primary dark:bg-brand/10"
                            : "text-secondary hover:bg-primary/6 hover:text-primary"
                        }`}
                      >
                        {!effectiveCollapsed && active && (
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
                        {!effectiveCollapsed && (
                          <span className="min-w-0 flex-1 truncate">{itemLabel}</span>
                        )}
                        {!effectiveCollapsed && item.showAiBadge && (
                          <span className="shrink-0 rounded-md border border-border px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-muted dark:text-secondary">
                            {t("nav.aiBadge")}
                          </span>
                        )}
                        {!effectiveCollapsed && item.badge && (
                          <span className="shrink-0 rounded-full bg-danger/90 px-1.5 py-px text-[10px] font-bold leading-tight text-white">
                            {item.badge}
                          </span>
                        )}
                        {effectiveCollapsed && item.badge && (
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
            ))
          }
        </nav>

        <div
          ref={accountMenuRef}
          className={`relative shrink-0 border-t border-border/40 dark:border-white/[0.05] ${
            effectiveCollapsed ? "p-1.5" : "p-2"
          }`}
        >
          <button
            type="button"
            onClick={() => setAccountOpen((o) => !o)}
            className={`flex w-full items-center rounded-lg text-start transition-colors duration-150 hover:bg-primary/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
              effectiveCollapsed ? "justify-center p-2" : "gap-2.5 px-2 py-2"
            }`}
            aria-expanded={accountOpen}
            aria-haspopup="menu"
            title={effectiveCollapsed ? displayName : undefined}
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
            {!effectiveCollapsed && (
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
            collapsed={effectiveCollapsed}
          />
        </div>
      </aside>
    </>
  );
}
