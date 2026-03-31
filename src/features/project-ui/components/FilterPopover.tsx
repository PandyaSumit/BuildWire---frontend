import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type FilterPopoverProps = {
  /** Number of active filters — shows a badge on the trigger */
  activeCount?: number;
  /** Trigger label */
  label?: string;
  /** Filter form controls */
  children: ReactNode;
  /** Called when "Clear all" is clicked inside the popover */
  onClear?: () => void;
};

/**
 * Compact filter trigger + floating panel.
 * Replaces the inline expanding filter band used across module pages.
 * Closes on outside click or Escape.
 */
export function FilterPopover({
  activeCount = 0,
  label,
  children,
  onClear,
}: FilterPopoverProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const btnLabel = label ?? t('filterPopover.label', { defaultValue: 'Filters' });

  return (
    <div ref={ref} className="relative shrink-0">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium transition-colors ${
          open || activeCount > 0
            ? 'border-brand/50 bg-brand-light text-primary'
            : 'border-border/60 bg-surface text-secondary hover:border-border hover:text-primary'
        }`}
      >
        {/* Filter icon */}
        <svg
          className="h-3.5 w-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 4.5h18M7 9.5h10M11 14.5h2"
          />
        </svg>
        {btnLabel}
        {activeCount > 0 && (
          <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold leading-none text-white">
            {activeCount}
          </span>
        )}
      </button>

      {/* Floating panel */}
      {open && (
        <div
          role="dialog"
          aria-label={btnLabel}
          className="absolute end-0 top-full z-40 mt-1.5 w-[min(360px,90vw)] rounded-xl border border-border bg-elevated shadow-xl"
        >
          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              {btnLabel}
            </p>
            {onClear && activeCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}
                className="text-[11px] font-semibold text-brand hover:underline"
              >
                {t('filterPopover.clearAll', { defaultValue: 'Clear all' })}
              </button>
            )}
          </div>
          {/* Filter controls */}
          <div className="space-y-3 p-4">{children}</div>
          {/* Close affordance */}
          <div className="border-t border-border/40 px-4 py-2.5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full rounded-lg bg-brand py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              {t('filterPopover.apply', { defaultValue: 'Apply' })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
