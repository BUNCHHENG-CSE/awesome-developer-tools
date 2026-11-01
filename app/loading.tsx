import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 space-y-8 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-10 w-3/4 rounded-lg" />
        <Skeleton className="h-5 w-1/2 rounded-md" />
      </div>

      {/* Grid Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-border/60 bg-card space-y-4"
          >
            <div className="flex justify-between items-start">
              <Skeleton className="h-6 w-1/3 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-4/5 rounded" />
            <div className="pt-4 flex justify-between items-center border-t border-border/40">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
