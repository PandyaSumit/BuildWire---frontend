type SpinnerProps = {
  /** Tailwind size classes, e.g. `h-4 w-4` */
  className?: string;
  size?: 'sm' | 'md';
};

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-[2.5px]',
};

/** Indeterminate ring spinner; uses `currentColor` for the track. */
export function Spinner({ className = '', size = 'sm' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block shrink-0 animate-spin rounded-full border-solid border-current border-t-transparent ${sizeMap[size]} ${className}`}
    />
  );
}
