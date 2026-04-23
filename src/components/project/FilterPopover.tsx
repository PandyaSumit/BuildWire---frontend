import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

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
 * Compact filter trigger + animated floating panel.
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
  const isActive = open || activeCount > 0;

  return (
    <div ref={ref} className="relative shrink-0">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12.5px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
          isActive
            ? 'border-brand/40 bg-brand-light text-brand shadow-token-xs'
            : 'border-border/70 bg-surface text-secondary shadow-token-xs hover:border-border hover:text-primary'
        }`}
      >
        <svg
          className="h-3.5 w-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h18M7 9.5h10M11 14.5h2" />
        </svg>
        {btnLabel}
        {activeCount > 0 && (
          <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold leading-none text-white">
            {activeCount}
          </span>
        )}
        <svg
          className={`h-3 w-3 shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating panel */}
      {open && (
        <div
          role="dialog"
          aria-label={btnLabel}
          className="animate-slide-down absolute end-0 top-full z-40 mt-1.5 w-[min(360px,90vw)] rounded-xl border border-border/70 bg-elevated shadow-token-xl"
        >
          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
            <p className="text-[11.5px] font-semibold text-primary">
              {btnLabel}
            </p>
            {onClear && activeCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}
                className="text-[11.5px] font-medium text-brand transition-colors hover:text-brand-hover focus-visible:outline-none"
              >
                {t('filterPopover.clearAll', { defaultValue: 'Clear all' })}
              </button>
            )}
          </div>

          {/* Filter controls */}
          <div className="space-y-3 p-4">{children}</div>

          {/* Apply button */}
          <div className="border-t border-border/40 px-4 py-3">
            <Button
              type="button"
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => setOpen(false)}
            >
              {t('filterPopover.apply', { defaultValue: 'Apply' })}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
