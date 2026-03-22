import { useState, useRef, useEffect } from "react";
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
  if (item.endMatch) {
    return pathname === item.to;
  }
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

const navBtn =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-muted/12 hover:text-primary";

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
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(e.target as Node)
      ) {
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
        className={`fixed start-0 top-0 z-30 flex h-dvh max-h-dvh flex-col border-e border-border/40 bg-sidebar transition-[width] duration-200 ease-out dark:border-white/[0.06] ${
          collapsed ? "w-14" : "w-60"
        }`}
      >
        <div
          className={`shrink-0 border-b border-border/40 dark:border-white/[0.06] ${
            collapsed
              ? "flex h-[52px] items-center justify-center px-2"
              : "flex h-[52px] items-center px-3"
          }`}
        >
          {collapsed ? (
            <button
              type="button"
              onClick={toggle}
              className={navBtn}
              aria-expanded={false}
              aria-label={t("sidebar.expand")}
              title={t("sidebar.expand")}
            >
              <BuildWireMark size={20} strokeWidth={1.75} decorative />
            </button>
          ) : (
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand text-white shadow-sm dark:text-bg">
                  <BuildWireLogo size={16} decorative />
                </div>
                <div className="min-w-0">
                  <span className="block truncate text-[15px] font-semibold tracking-tight text-primary">
                    {t("brand.name")}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={toggle}
                className={navBtn}
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
          className={`scrollbar-none flex-1 overflow-y-auto overflow-x-hidden ${collapsed ? "px-2 py-2" : "px-2 py-3"}`}
        >
          {navigation.map((group, groupIndex) => (
            <div
              key={group.groupKey + groupIndex}
              className={collapsed ? "mb-3" : "mb-5"}
            >
              <h3
                className={`mb-1.5 px-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted/80 ${
                  collapsed ? "sr-only" : ""
                }`}
              >
                {t(`navGroup.${group.groupKey}`)}
              </h3>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = isNavActive(pathname, item);
                  const itemLabel = t(`nav.${item.itemKey}`);
                  return (
                    <Link
                      key={item.id}
                      to={item.to}
                      title={collapsed ? itemLabel : undefined}
                      className={`relative flex items-center rounded-md text-[13px] font-medium leading-5 transition-colors ${
                        collapsed
                          ? `justify-center px-2 py-2${item.badge ? " relative" : ""}`
                          : "gap-2.5 px-2.5 py-1.5"
                      } ${
                        active
                          ? "bg-muted/12 text-primary dark:bg-white/[0.06]"
                          : "text-secondary hover:bg-muted/8 hover:text-primary"
                      }`}
                    >
                      {!collapsed && active && (
                        <span
                          className="absolute start-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-primary"
                          aria-hidden
                        />
                      )}
                      <span
                        className={`shrink-0 text-muted [&>svg]:h-[18px] [&>svg]:w-[18px] ${active ? "text-primary" : ""}`}
                      >
                        {item.icon}
                      </span>
                      {!collapsed && (
                        <span className="min-w-0 flex-1 truncate">{itemLabel}</span>
                      )}
                      {!collapsed && item.showAiBadge && (
                        <span className="shrink-0 rounded px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-muted dark:bg-white/10 dark:text-secondary">
                          {t("nav.aiBadge")}
                        </span>
                      )}
                      {!collapsed && item.badge && (
                        <span className="shrink-0 rounded-full bg-danger/90 px-1.5 py-px text-[10px] font-semibold text-white">
                          {item.badge}
                        </span>
                      )}
                      {collapsed && item.badge && (
                        <span
                          className="absolute end-1 top-1 h-1.5 w-1.5 rounded-full bg-danger"
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

        <div
          ref={accountMenuRef}
          className={`relative mt-auto border-t border-border/40 dark:border-white/[0.06] ${collapsed ? "p-2" : "p-2.5"}`}
        >
          <button
            type="button"
            onClick={() => setAccountOpen((o) => !o)}
            className={`flex w-full items-center rounded-lg text-start transition-colors hover:bg-muted/10 ${
              collapsed ? "justify-center p-1.5" : "gap-3 p-1.5"
            }`}
            aria-expanded={accountOpen}
            aria-haspopup="menu"
            title={collapsed ? displayName : undefined}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-border/60 dark:ring-white/10"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/15 text-xs font-semibold text-primary ring-1 ring-border/50 dark:bg-white/10 dark:ring-white/10">
                {initials}
              </div>
            )}
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold leading-tight text-primary">
                    {displayName}
                  </p>
                  {(user?.org?.name || user?.email) && (
                    <p className="truncate text-[11px] text-muted">
                      {user?.org?.name ?? user?.email}
                    </p>
                  )}
                </div>
                <svg
                  className={`h-4 w-4 shrink-0 text-muted transition-transform ${accountOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
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
