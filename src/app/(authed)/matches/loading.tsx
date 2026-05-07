import { Skeleton } from '@/components/ui/skeleton';

export default function MatchesLoading() {
  return (
    <div className="p-8">
      <Skeleton className="h-8 w-32 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[#cfc5bd] overflow-hidden">
            <Skeleton className="h-48 rounded-none" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-full mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
