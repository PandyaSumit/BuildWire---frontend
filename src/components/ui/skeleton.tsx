export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted/20 ${className}`} />;
}

export function PageSkeletonOverview() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-10 w-2/3 max-w-xl" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Skeleton className="h-80 lg:col-span-3" />
        <Skeleton className="h-80 lg:col-span-2" />
      </div>
    </div>
  );
}

/** Lightweight fallback while lazy project modules load */
export function PageSkeletonModule() {
  return (
    <div className="min-h-[50vh] space-y-5 p-4 sm:p-6">
      <Skeleton className="h-8 w-44 max-w-[60%]" />
      <Skeleton className="h-4 w-full max-w-lg" />
      <Skeleton className="h-px w-full max-w-xl bg-transparent" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
