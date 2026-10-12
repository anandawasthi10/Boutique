import { Skeleton } from '@/components/ui/Skeleton';

export default function GlobalLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading page"
      className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-10 space-y-8 animate-fadeIn"
    >
      <span className="sr-only">Loading page content, please wait...</span>

      {/* Header skeleton */}
      <div className="space-y-3 max-w-lg">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-full" />
      </div>

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] space-y-4"
          >
            <Skeleton className="aspect-4/5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
