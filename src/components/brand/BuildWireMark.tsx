/**
 * Panel-with-rail icon — used for sidebar expand/collapse (and optional branding).
 */
export function BuildWireMark({
  className = '',
  size = 32,
  strokeWidth = 2,
  /** When true, hide from assistive tech (parent button provides the label). */
  decorative = false,
}: {
  className?: string;
  /** CSS pixel size (square) */
  size?: number;
  strokeWidth?: number;
  decorative?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'BuildWire'}
    >
      <rect x={3} y={3} width={18} height={18} rx={2} ry={2} />
      <line x1={9} y1={3} x2={9} y2={21} />
    </svg>
  );
}
