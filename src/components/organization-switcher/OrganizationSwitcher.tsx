import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { parseOrgRole } from "@/lib/rbac";
import { AddOrganizationModal } from "./AddOrganizationModal";
import { useOrganizationShell } from "./OrganizationShellContext";

type Props = {
  /** Sidebar collapsed to icon rail (md–lg or persisted). */
  collapsed: boolean;
  /** Mobile drawer is expanded — use full-width trigger layout. */
  mobileDrawerOpen: boolean;
};

function orgInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase().slice(0, 2);
  }
  return (parts[0]?.slice(0, 2) ?? "BW").toUpperCase();
}

export function OrganizationSwitcher({ collapsed, mobileDrawerOpen }: Props) {
  const { t } = useTranslation();
  const { memberships, activeMembership, setActiveOrganization } = useOrganizationShell();
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!activeMembership && !memberships.length) {
    return (
      <div
        className={`shrink-0 border-b border-border/40 px-2 py-2 dark:border-white/[0.05] ${
          collapsed && !mobileDrawerOpen ? "flex flex-col items-center gap-1" : ""
        }`}
      >
        <p className="px-1 text-center text-[11px] leading-snug text-muted">
          {t("orgSwitcher.noOrganization")}
        </p>
        <Link
          to="/welcome"
          className="text-center text-[11px] font-medium text-brand hover:underline"
        >
          {t("orgSwitcher.noOrganizationCta")}
        </Link>
      </div>
    );
  }

  const activeName = activeMembership?.name ?? "";
  const activeRole = parseOrgRole(activeMembership?.role);

  const triggerCollapsed = collapsed && !mobileDrawerOpen;

  return (
    <>
      <div
        ref={rootRef}
        className={`relative shrink-0 border-b border-border/40 dark:border-white/[0.05] ${
          triggerCollapsed ? "flex justify-center px-1.5 py-2" : "px-2 py-2"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`flex w-full items-center rounded-lg border border-transparent text-start transition-colors duration-150 hover:border-border/60 hover:bg-primary/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
            triggerCollapsed ? "justify-center p-1.5" : "gap-2 px-2 py-1.5"
          }`}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={t("orgSwitcher.switchOrganizationAria", { name: activeName })}
        >
          {activeMembership?.logoUrl ? (
            <img
              src={activeMembership.logoUrl}
              alt=""
              className={`shrink-0 rounded-md object-cover ring-1 ring-border/50 ${
                triggerCollapsed ? "h-8 w-8" : "h-9 w-9"
              }`}
            />
          ) : (
            <div
              className={`flex shrink-0 items-center justify-center rounded-md bg-brand/12 text-[11px] font-bold text-brand ring-1 ring-brand/20 dark:bg-brand/15 ${
                triggerCollapsed ? "h-8 w-8" : "h-9 w-9"
              }`}
            >
              {orgInitials(activeName)}
            </div>
          )}
          {!triggerCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold leading-tight tracking-tight text-primary">
                  {activeName}
                </p>
                <p className="mt-0.5 truncate text-[11px] leading-tight text-muted">
                  {activeRole
                    ? t(`orgSwitcher.role.${activeRole}`)
                    : t("orgSwitcher.roleUnknown")}
                </p>
              </div>
              <svg
                className={`h-3.5 w-3.5 shrink-0 text-muted transition-transform duration-150 ${
                  open ? "rotate-180" : ""
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

        {open && (
          <div
            role="listbox"
            aria-label={t("orgSwitcher.listLabel")}
            className={
              triggerCollapsed
                ? "absolute start-full top-0 z-[60] ms-2 w-[min(100vw-5rem,18rem)] rounded-xl border border-border bg-elevated py-1 shadow-lg"
                : "absolute start-0 end-0 top-full z-[60] mt-1 max-h-[min(70dvh,22rem)] overflow-y-auto rounded-xl border border-border bg-elevated py-1 shadow-lg"
            }
          >
            <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
              {t("orgSwitcher.sectionOrganizations")}
            </p>
            <div className="px-1 pb-1">
              {memberships.map((m) => {
                const selected = m.id === activeMembership?.id;
                const role = parseOrgRole(m.role);
                const unread = (m.unreadCount ?? 0) > 0;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      setActiveOrganization(m.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-start gap-2 rounded-lg px-2 py-2 text-start text-[13px] transition-colors ${
                      selected ? "bg-brand/10 text-primary" : "hover:bg-primary/6"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate font-medium">{m.name}</span>
                        {selected ? (
                          <svg
                            className="h-4 w-4 shrink-0 text-brand"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : null}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted">
                        <span>{role ? t(`orgSwitcher.role.${role}`) : t("orgSwitcher.roleUnknown")}</span>
                        {typeof m.projectCount === "number" ? (
                          <span className="text-muted/80">
                            {t("orgSwitcher.projectCount", { count: m.projectCount })}
                          </span>
                        ) : null}
                      </span>
                    </span>
                    {unread ? (
                      <span className="mt-0.5 inline-flex min-w-[1.25rem] justify-center rounded-full bg-danger/90 px-1.5 py-px text-[10px] font-bold text-white">
                        {(m.unreadCount ?? 0) > 99 ? "99+" : m.unreadCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-border/60 px-1 py-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setAddOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[13px] font-medium text-primary transition-colors hover:bg-primary/6"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-muted">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                {t("orgSwitcher.addOrCreate")}
              </button>
            </div>
          </div>
        )}
      </div>

      <AddOrganizationModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
