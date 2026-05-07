import { Skeleton } from '@/components/ui/skeleton';

export default function ListingsLoading() {
  return (
    <div className="p-8">
      <Skeleton className="h-8 w-24 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[#cfc5bd] overflow-hidden">
            <Skeleton className="h-48 rounded-none" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2 mt-3">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
