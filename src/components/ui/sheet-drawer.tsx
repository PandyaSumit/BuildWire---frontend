import type { ReactNode } from "react";

type SheetDrawerProps = {
  open: boolean;
  /** Ignored when `hideTitleBar` is true. */
  title?: string;
  onClose: () => void;
  children: ReactNode;
  widthClassName?: string;
  /** Children render the full panel (e.g. task detail with its own header). */
  hideTitleBar?: boolean;
};

export function SheetDrawer({
  open,
  title = "",
  onClose,
  children,
  widthClassName = "max-w-[520px]",
  hideTitleBar = false,
}: SheetDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <button
        type="button"
        className="animate-fade-in absolute inset-0 bg-black/35 backdrop-blur-[2px]"
        aria-label="Close panel"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`animate-slide-in-right relative flex h-full w-full ${widthClassName} flex-col border-s border-border/60 bg-elevated shadow-token-xl dark:border-white/[0.06]`}
      >
        {!hideTitleBar && (
          <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-5 py-3.5 dark:border-white/[0.06]">
            <h2 className="font-[family-name:var(--font-dm-sans)] text-[15px] font-semibold text-primary">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-primary/8 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              aria-label="Close"
            >
              <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div
          className={`min-h-0 flex-1 ${hideTitleBar ? "flex flex-col overflow-hidden" : "overflow-y-auto p-5"}`}
        >
          {children}
        </div>
      </aside>
    </div>
  );
}
