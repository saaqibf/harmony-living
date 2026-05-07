import { Skeleton } from '@/components/ui/skeleton';

export default function DiscoverLoading() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
      <div className="w-full max-w-sm space-y-4">
        <Skeleton className="h-[480px] w-full rounded-2xl" />
        <div className="flex justify-center gap-6">
          <Skeleton className="w-14 h-14 rounded-full" />
          <Skeleton className="w-14 h-14 rounded-full" />
          <Skeleton className="w-14 h-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}
