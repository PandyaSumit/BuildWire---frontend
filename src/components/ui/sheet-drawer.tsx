import type { ReactNode } from 'react';

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
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        aria-label="Close panel"
        onClick={onClose}
      />
      <aside
        className={`relative flex h-full w-full ${widthClassName} flex-col border-l border-border bg-elevated shadow-2xl`}
      >
        {!hideTitleBar && (
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            <h2 className="font-[family-name:var(--font-dm-sans)] text-base font-semibold text-primary">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-secondary hover:bg-surface hover:text-primary"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div
          className={`min-h-0 flex-1 ${hideTitleBar ? "flex flex-col overflow-hidden" : "overflow-y-auto p-4"}`}
        >
          {children}
        </div>
      </aside>
    </div>
  );
}
