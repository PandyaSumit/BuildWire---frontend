type FilterChipGroupProps = {
  options: string[];
  value: string;
  onChange: (next: string) => void;
  allLabel?: string;
};

/**
 * Horizontal discipline / bucket filters (drawings, lightweight lists).
 */
export function FilterChipGroup({
  options,
  value,
  onChange,
  allLabel = 'All',
}: FilterChipGroupProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              active
                ? 'border-brand bg-brand text-white dark:text-bg'
                : 'border-border bg-surface text-secondary hover:border-brand/40 hover:text-primary'
            }`}
          >
            {opt === 'All' ? allLabel : opt}
          </button>
        );
      })}
    </div>
  );
}
