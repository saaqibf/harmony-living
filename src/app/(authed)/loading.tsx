import { Skeleton } from '@/components/ui/skeleton';

export default function AuthedLoading() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
