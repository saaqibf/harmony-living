import { Skeleton } from '@/components/ui/skeleton';

export default function MessagesLoading() {
  return (
    <div className="flex h-[calc(100vh-0px)]">
      <div className="w-80 border-r border-[#cfc5bd] p-4 space-y-3">
        <Skeleton className="h-9 w-full mb-4" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    </div>
  );
}
