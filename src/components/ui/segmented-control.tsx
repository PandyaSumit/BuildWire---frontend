type Option<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  value: T;
  onChange: (v: T) => void;
  options: Option<T>[];
  className?: string;
};

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      className={`flex flex-wrap gap-1 rounded-lg border border-border bg-bg p-1 ${className}`}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              active ? 'bg-surface text-primary shadow-sm' : 'text-secondary hover:text-primary'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
