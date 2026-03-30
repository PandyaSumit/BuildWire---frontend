type Option<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  value: T;
  onChange: (v: T) => void;
  options: Option<T>[];
  className?: string;
  /** Default: pill group. `underline` = bottom-border tabs (e.g. task list header). */
  variant?: "default" | "underline";
  /** `md` = larger segments (toolbars); `underline` variant ignores this. */
  size?: "sm" | "md";
};

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className = "",
  variant = "default",
  size = "sm",
}: SegmentedControlProps<T>) {
  if (variant === "underline") {
    return (
      <div
        role="tablist"
        className={`flex w-full min-w-0 flex-wrap items-end gap-0 border-b border-border/50 ${className}`}
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
              className={`relative -mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-secondary hover:text-primary"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    );
  }

  const pad = size === "md" ? "p-1.5" : "p-1";
  const seg =
    size === "md"
      ? "rounded-md px-4 py-2 text-sm"
      : "rounded-md px-3 py-1.5 text-sm";

  return (
    <div
      role="tablist"
      className={`flex flex-wrap gap-1 rounded-lg border border-border bg-bg ${pad} ${className}`}
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
            className={`${seg} font-medium transition-colors ${
              active
                ? "bg-surface text-primary shadow-sm"
                : "text-secondary hover:text-primary"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
