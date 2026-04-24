import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  useWorkspaceSwitcher,
  type WorkspaceId,
} from "./WorkspaceSwitcherContext";

type WorkspaceCard = {
  id: WorkspaceId;
  titleKey: string;
  descriptionKey: string;
  icon: ReactNode;
  accentClass: string;
};

const cards: WorkspaceCard[] = [
  {
    id: "project",
    titleKey: "workspaceSwitcher.projectTitle",
    descriptionKey: "workspaceSwitcher.projectDescription",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7h16M4 12h16M4 17h10M7 4h10M17 17l2 2 4-4" />
      </svg>
    ),
    accentClass: "from-blue-500/20 to-indigo-500/10",
  },
  {
    id: "hiring",
    titleKey: "workspaceSwitcher.hiringTitle",
    descriptionKey: "workspaceSwitcher.hiringDescription",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 0c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
      </svg>
    ),
    accentClass: "from-emerald-500/20 to-teal-500/10",
  },
  {
    id: "messages",
    titleKey: "workspaceSwitcher.messagesTitle",
    descriptionKey: "workspaceSwitcher.messagesDescription",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 8h10M7 12h6m8 7l-4-3H6a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2v12z" />
      </svg>
    ),
    accentClass: "from-violet-500/20 to-fuchsia-500/10",
  },
];

const iconBtn =
  "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-primary/8 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40";

export function WorkspaceSwitcherButton() {
  const { t } = useTranslation();
  const { activeWorkspace, switchWorkspace } = useWorkspaceSwitcher();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <>
      <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        className={iconBtn}
        onClick={() => setOpen((v) => !v)}
        aria-label={t("workspaceSwitcher.open")}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 5h2v2H5V5zm6 0h2v2h-2V5zm6 0h2v2h-2V5zM5 11h2v2H5v-2zm6 0h2v2h-2v-2zm6 0h2v2h-2v-2zM5 17h2v2H5v-2zm6 0h2v2h-2v-2zm6 0h2v2h-2v-2z" />
        </svg>
      </button>
      </div>
      {typeof document !== "undefined" &&
        createPortal(
          <div
            className={`fixed inset-0 z-[120] transition-opacity duration-200 ${
              open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={!open}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
              aria-label={t("workspaceSwitcher.close", { defaultValue: "Close workspace drawer" })}
              onClick={() => setOpen(false)}
            />

            <aside
              role="dialog"
              aria-modal="true"
              aria-label={t("workspaceSwitcher.title")}
              className={`absolute right-0 top-0 z-[121] flex h-dvh w-[460px] max-w-[94vw] flex-col border-l border-border bg-surface shadow-token-xl transition-transform duration-200 ${
                open ? "translate-x-0" : "translate-x-full"
              }`}
            >
          <div className="shrink-0 border-b border-border bg-gradient-to-b from-primary/[0.04] to-transparent px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-semibold text-primary">{t("workspaceSwitcher.title")}</h3>
                <p className="mt-1 text-[12px] text-secondary">{t("workspaceSwitcher.subtitle")}</p>
              </div>
              <span className="rounded-full border border-border bg-bg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                3 Apps
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {cards.map((card) => {
                const active = activeWorkspace === card.id;
                return (
                  <button
                    key={`${card.id}-mini`}
                    type="button"
                    onClick={() => {
                      switchWorkspace(card.id);
                      setOpen(false);
                    }}
                    className={[
                      "rounded-lg border px-2 py-2 text-left transition-colors",
                      active
                        ? "border-brand/40 bg-brand/10"
                        : "border-border bg-bg hover:bg-bg/80",
                    ].join(" ")}
                  >
                    <span className="mb-1 inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted">
                      {card.icon}
                    </span>
                    <p className="truncate text-[11px] font-medium text-primary">
                      {t(card.titleKey)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col bg-surface">
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Apps
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-primary/8 hover:text-primary"
                aria-label={t("workspaceSwitcher.close", { defaultValue: "Close" })}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="scrollbar-none flex-1 space-y-3 overflow-y-auto px-4 pb-4">
              {cards.map((card) => {
                const active = activeWorkspace === card.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      switchWorkspace(card.id);
                      setOpen(false);
                    }}
                    className={[
                      "relative w-full overflow-hidden rounded-xl border p-3 text-left transition-all duration-150",
                      active
                        ? "border-brand/40 bg-brand/10 shadow-token-sm"
                        : "border-border bg-bg hover:border-border/90 hover:bg-bg/80",
                    ].join(" ")}
                  >
                    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accentClass} opacity-70`} />
                    <div className="relative flex items-start gap-3">
                      <span
                        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                          active
                            ? "border-brand/40 bg-brand/15 text-brand"
                            : "border-border bg-surface text-muted"
                        }`}
                      >
                        {card.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-[14px] font-semibold text-primary">
                            {t(card.titleKey)}
                          </span>
                          {active ? (
                            <span className="rounded-full border border-brand/30 bg-brand/15 px-2 py-0.5 text-[10px] font-semibold text-brand">
                              Active
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-1 block text-[12px] leading-snug text-secondary">
                          {t(card.descriptionKey)}
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
            </aside>
          </div>,
          document.body
        )}
    </>
  );
}
