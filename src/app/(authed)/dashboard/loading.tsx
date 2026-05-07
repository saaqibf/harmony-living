import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-9 w-48" />
      </div>
      <div className="flex gap-6">
        <div className="flex-1 space-y-6">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex overflow-hidden rounded-2xl border border-[#cfc5bd]">
              <Skeleton className="w-40 h-40 rounded-none" />
              <div className="flex-1 p-5 space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-9 w-28 mt-auto" />
              </div>
            </div>
          ))}
        </div>
        <div className="w-64 space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
