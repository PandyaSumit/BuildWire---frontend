import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  /** Shown when `value` is empty or does not match any option. */
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  /** Applied to the visible `<label>` when `label` is set. */
  labelClassName?: string;
  /** Extra classes on the trigger button (e.g. `sm:w-48`). */
  triggerClassName?: string;
  /** Extra classes on the dropdown listbox (e.g. override background). */
  dropdownClassName?: string;
  /** `sm` — denser trigger and list (filters, toolbars). */
  size?: 'md' | 'sm';
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

function Chevron({ open, className = 'h-4 w-4' }: { open: boolean; className?: string }) {
  return (
    <svg
      className={`shrink-0 text-muted transition-transform ${className} ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function Select({
  options,
  value,
  onValueChange,
  placeholder = 'Select…',
  label,
  error,
  helperText,
  fullWidth = true,
  disabled = false,
  id: idProp,
  name,
  className = '',
  labelClassName = '',
  triggerClassName = '',
  dropdownClassName = '',
  size = 'md',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: SelectProps) {
  const reactId = useId();
  const triggerId = idProp ?? `select-${reactId}`;
  const listboxId = `${triggerId}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);

  const selected = useMemo(() => options.find((o) => o.value === value), [options, value]);
  const displayLabel = selected?.label ?? (value ? value : placeholder);

  const enabledIndices = useMemo(
    () => options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0),
    [options]
  );

  const moveHighlight = useCallback(
    (delta: number) => {
      if (enabledIndices.length === 0) return;
      const currentPos = enabledIndices.indexOf(highlightIdx);
      const start = currentPos >= 0 ? currentPos : 0;
      let next = (start + delta) % enabledIndices.length;
      if (next < 0) next += enabledIndices.length;
      setHighlightIdx(enabledIndices[next]!);
    },
    [enabledIndices, highlightIdx]
  );

  useEffect(() => {
    if (!open) return;
    const idx = options.findIndex((o) => o.value === value && !o.disabled);
    if (idx >= 0) setHighlightIdx(idx);
    else if (enabledIndices.length) setHighlightIdx(enabledIndices[0]!);
  }, [open, value, options, enabledIndices]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  function selectIndex(index: number) {
    const opt = options[index];
    if (!opt || opt.disabled) return;
    onValueChange(opt.value);
    setOpen(false);
  }

  function onTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (open) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === 'Tab') {
        setOpen(false);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        moveHighlight(1);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        moveHighlight(-1);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        selectIndex(highlightIdx);
        return;
      }
      if (e.key === 'Home') {
        e.preventDefault();
        if (enabledIndices.length) setHighlightIdx(enabledIndices[0]!);
        return;
      }
      if (e.key === 'End') {
        e.preventDefault();
        if (enabledIndices.length) setHighlightIdx(enabledIndices[enabledIndices.length - 1]!);
        return;
      }
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
    }
  }

  const widthClass = fullWidth ? 'w-full' : '';
  const sizeTrigger =
    size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2.5 text-sm';
  const sizeOption = size === 'sm' ? 'px-2 py-1.5 text-xs' : 'px-2.5 py-2 text-sm';
  const chevronClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const borderClass = error
    ? 'border-danger focus-visible:ring-danger/40'
    : 'border-border focus-visible:ring-brand/40';

  return (
    <div className={`${widthClass} ${className}`}>
      {label ? (
        <label
          htmlFor={triggerId}
          className={`mb-1 block text-sm font-medium text-primary ${labelClassName}`.trim()}
        >
          {label}
        </label>
      ) : null}

      <div
        ref={containerRef}
        className={`relative ${fullWidth ? widthClass : 'min-w-0 shrink-0'}`}
      >
        {name ? <input type="hidden" name={name} value={value} readOnly /> : null}

        <button
          id={triggerId}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          disabled={disabled}
          onClick={() => !disabled && setOpen((o) => !o)}
          onKeyDown={onTriggerKeyDown}
          className={`flex items-center justify-between gap-2 rounded-lg border bg-bg text-left text-primary shadow-token-xs transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50 ${sizeTrigger} ${borderClass} ${fullWidth ? 'w-full' : 'w-auto min-w-0'} ${triggerClassName}`}
        >
          <span className={`min-w-0 flex-1 truncate ${!selected && !value ? 'text-muted' : ''}`}>
            {displayLabel}
          </span>
          <Chevron open={open} className={chevronClass} />
        </button>

        {open ? (
          <ul
            id={listboxId}
            role="listbox"
            aria-labelledby={label ? triggerId : undefined}
            className={`animate-slide-down absolute left-0 right-0 z-[100] mt-1 max-h-60 overflow-auto rounded-xl border border-border/70 bg-elevated py-1 shadow-token-lg ${dropdownClassName}`}
          >
            {options.map((opt, i) => {
              const isSelected = opt.value === value;
              const isHighlighted = i === highlightIdx;
              return (
                <li
                  key={`${opt.value}-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled}
                  className={`mx-1 flex cursor-pointer items-center rounded-md transition-colors ${sizeOption} ${
                    opt.disabled
                      ? 'cursor-not-allowed text-muted opacity-50'
                      : isHighlighted
                        ? 'bg-brand/10 text-primary'
                        : 'text-primary hover:bg-surface'
                  } ${isSelected && !isHighlighted ? 'font-medium' : ''}`}
                  onMouseEnter={() => !opt.disabled && setHighlightIdx(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!opt.disabled) selectIndex(i);
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                  {isSelected ? (
                    <svg className="h-4 w-4 shrink-0 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="h-4 w-4 shrink-0" aria-hidden />
                  )}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      {error ? <p className="mt-1 text-sm text-danger">{error}</p> : null}
      {helperText && !error ? <p className="mt-1 text-sm text-muted">{helperText}</p> : null}
    </div>
  );
}
