type Option<T extends string> = { value: T; label: string; icon?: React.ReactNode };

type SegmentedControlProps<T extends string> = {
  value: T;
  onChange: (v: T) => void;
  options: Option<T>[];
  className?: string;
  /** `default` = pill group (switcher); `underline` = bottom-border tabs */
  variant?: "default" | "underline";
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
        className={`flex w-full min-w-0 items-end gap-0 border-b border-border/50 ${className}`}
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
              className={`relative -mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none ${
                active
                  ? "border-brand text-brand"
                  : "border-transparent text-secondary hover:text-primary"
              }`}
            >
              {o.icon && <span className="shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5">{o.icon}</span>}
              {o.label}
            </button>
          );
        })}
      </div>
    );
  }

  const trackPad = size === "md" ? "p-1" : "p-0.5";
  const segCls =
    size === "md"
      ? "inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-[13px]"
      : "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-[12.5px]";

  return (
    <div
      role="tablist"
      className={`inline-flex flex-wrap gap-0.5 rounded-lg border border-border/60 bg-bg ${trackPad} ${className}`}
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
            className={`${segCls} font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
              active
                ? "bg-surface text-primary shadow-token-xs"
                : "text-secondary hover:bg-primary/5 hover:text-primary"
            }`}
          >
            {o.icon && (
              <span className={`shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5 ${active ? "text-brand" : "text-muted"}`}>
                {o.icon}
              </span>
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
