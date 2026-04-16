type SemanticPillProps = {
  label: string;
  /** Map label → border/bg/text utility classes; unknown labels get `fallbackClassName` */
  palette: Record<string, string>;
  fallbackClassName?: string;
  className?: string;
};

const defaultFallback = 'border-border bg-muted/20 text-secondary';

/**
 * Small bordered pill for trades, inspection types, meeting types, etc.
 * Colors live in `src/config/pm/*` so screens stay presentational.
 */
export function SemanticPill({
  label,
  palette,
  fallbackClassName = defaultFallback,
  className = '',
}: SemanticPillProps) {
  const tone = palette[label] ?? fallbackClassName;
  return (
    <span
      className={`inline-flex max-w-full items-center truncate rounded-md border px-2 py-0.5 text-xs font-medium ${tone} ${className}`.trim()}
      title={label}
    >
      {label}
    </span>
  );
}
