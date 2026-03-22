/**
 * BuildWire logomark — custom abstract symbol: vertical structure (build) +
 * horizontal spans and terminal node (wire / coordination). Renders as a
 * filled glyph for use on brand backgrounds.
 */
export function BuildWireLogo({
  className = '',
  size = 22,
  decorative = true,
}: {
  className?: string;
  size?: number;
  decorative?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'BuildWire'}
    >
      {/* Structural spine */}
      <rect x="3.5" y="4" width="5.2" height="16" rx="1.4" fill="currentColor" />
      {/* Levels / spans — rhythm like floor plates */}
      <rect x="9.8" y="5.5" width="11.2" height="2.6" rx="1.3" fill="currentColor" opacity={0.92} />
      <rect x="9.8" y="10.7" width="8.8" height="2.6" rx="1.3" fill="currentColor" opacity={0.85} />
      <rect x="9.8" y="15.9" width="11.2" height="2.6" rx="1.3" fill="currentColor" opacity={0.92} />
      {/* Connection / field node */}
      <circle cx="20.8" cy="12" r="2.35" fill="currentColor" />
    </svg>
  );
}
