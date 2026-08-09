export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-white/10 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40 sm:p-6">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="mt-3 h-3 w-2/3" />
      <Skeleton className="mt-5 h-16 w-full" />
    </div>
  );
}

/** A generic stand-in for "the next page's data cards" shown for a beat during route transitions. */
export function SkeletonPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonCard />
    </div>
  );
}
