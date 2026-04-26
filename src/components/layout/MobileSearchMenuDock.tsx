import { useTranslation } from "react-i18next";
import { useGlobalSearch } from "@/components/layout/GlobalSearchContext";
import { useSidebarLayout } from "@/components/layout/SidebarLayoutContext";

/**
 * Phone-only bottom pill: search (opens command palette) + menu or close when workspace sheet is open.
 */
export function MobileSearchMenuDock() {
  const { t } = useTranslation();
  const { openPalette, closePalette, paletteOpen } = useGlobalSearch();
  const { mobileOpen, setMobileOpen } = useSidebarLayout();

  const openSearch = () => {
    setMobileOpen(false);
    openPalette();
  };

  const toggleSheet = () => {
    if (paletteOpen) closePalette();
    setMobileOpen((o) => !o);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[46] flex justify-center pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 md:hidden">
      <div className="pointer-events-auto flex h-11 max-w-md items-center rounded-full border border-border/60 bg-sidebar/95 text-[13px] font-medium text-secondary shadow-token-md backdrop-blur-sm dark:border-white/[0.08]">
        <button
          type="button"
          onClick={openSearch}
          className="flex h-11 min-w-0 flex-1 items-center gap-2.5 px-4 text-start transition-colors hover:text-primary focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-s-full"
          aria-label={t("header.openGlobalSearch")}
        >
          <svg
            className="h-4 w-4 shrink-0 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span className="truncate text-muted">
            {t("header.mobileSearchFind")}
          </span>
        </button>
        <span className="h-5 w-px shrink-0 bg-border/60" aria-hidden />
        <button
          type="button"
          onClick={toggleSheet}
          className="flex h-11 w-12 shrink-0 items-center justify-center rounded-e-full text-muted transition-colors hover:bg-primary/8 hover:text-primary focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          aria-label={
            mobileOpen
              ? t("header.closeWorkspaceMenu")
              : t("header.openWorkspaceMenu")
          }
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M4 6h16M4 12h16M4 18h10"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
