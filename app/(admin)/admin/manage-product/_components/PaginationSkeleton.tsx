import { Skeleton } from "@/components/ui/skeleton";

export function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
} 