import Link from 'next/link';
import { cn } from '@/lib/utils';

type ListingCardProps = {
  id: string;
  title: string;
  city: string;
  neighborhood?: string | null;
  rentAmount: number;
  currency: string;
  bedroomsTotal: number;
  bathroomsTotal: number;
  furnished: boolean;
  availableFrom: Date;
  coverImageUrl?: string | null;
  status?: string;
  className?: string;
};

export function ListingCard({
  id,
  title,
  city,
  neighborhood,
  rentAmount,
  currency,
  bedroomsTotal,
  bathroomsTotal,
  furnished,
  availableFrom,
  coverImageUrl,
  status,
  className,
}: ListingCardProps) {
  const available = new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(availableFrom));

  return (
    <Link
      href={`/listings/${id}`}
      className={cn(
        'group block rounded-xl border border-[--color-border] bg-[--color-surface] overflow-hidden hover:shadow-md transition-shadow',
        className,
      )}
    >
      <div className="aspect-[4/3] bg-[--color-muted] overflow-hidden">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[--color-muted-fg] text-sm">
            No photo
          </div>
        )}
      </div>
      <div className="p-4 space-y-1">
        {status && status !== 'ACTIVE' && (
          <span className="text-xs font-medium uppercase tracking-wide text-[--color-muted-fg]">
            {status}
          </span>
        )}
        <p className="font-semibold text-[--color-fg] line-clamp-1">{title}</p>
        <p className="text-sm text-[--color-muted-fg]">
          {neighborhood ? `${neighborhood}, ${city}` : city}
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="font-bold text-[--color-fg]">
            {currency} {rentAmount.toLocaleString()}/mo
          </span>
          <span className="text-xs text-[--color-muted-fg]">
            {bedroomsTotal}bd · {bathroomsTotal}ba{furnished ? ' · Furnished' : ''}
          </span>
        </div>
        <p className="text-xs text-[--color-muted-fg]">Available {available}</p>
      </div>
    </Link>
  );
}
