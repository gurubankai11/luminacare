import { cn } from '../../lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800', className)}
    />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full animate-in fade-in duration-500">
      <div className="space-y-2">
        <Skeleton className="h-10 w-1/3 rounded-xl" />
        <Skeleton className="h-5 w-1/4 rounded-lg" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>

      <Skeleton className="h-48 rounded-2xl w-full" />
      
      <div className="space-y-3">
        <Skeleton className="h-8 w-1/5 rounded-lg mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl w-full" />
        ))}
      </div>
    </div>
  )
}
