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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  INACTIVE: { label: 'Inactive', color: 'bg-[#f1edec] text-[#7d766f] border border-[#cfc5bd]' },
  PENDING: { label: 'Pending review', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
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

  const statusInfo = status && status !== 'ACTIVE' ? (STATUS_LABELS[status] ?? { label: status, color: 'bg-[#f1edec] text-[#7d766f] border border-[#cfc5bd]' }) : null;

  return (
    <Link
      href={`/listings/${id}`}
      className={cn(
        'group block rounded-2xl border border-[#cfc5bd] bg-white overflow-hidden hover:shadow-md hover:border-[#e8cede] active:scale-[0.99] transition-all',
        className,
      )}
    >
      <div className="aspect-[4/3] bg-[#f1edec] overflow-hidden relative">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#7d766f]">
            <span className="text-3xl mb-1">🏠</span>
            <span className="text-xs font-medium">No photo yet</span>
          </div>
        )}
        {statusInfo && (
          <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        )}
      </div>
      <div className="p-4 space-y-2">
        <p className="font-semibold text-[#1c1b1b] line-clamp-1 leading-snug">{title}</p>
        <p className="text-xs text-[#7d766f] flex items-center gap-1">
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
          </svg>
          {neighborhood ? `${neighborhood}, ${city}` : city}
        </p>
        <div className="flex items-center justify-between pt-0.5">
          <span className="font-bold text-[#1c1b1b] text-base">
            {currency} {rentAmount.toLocaleString()}<span className="text-xs font-medium text-[#7d766f]">/mo</span>
          </span>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span className="text-[11px] text-[#7d766f] bg-[#f1edec] px-2 py-0.5 rounded-full">
              {bedroomsTotal}bd · {bathroomsTotal}ba
            </span>
            {furnished && (
              <span className="text-[11px] text-[#b05e3d] bg-[#f7f3f1] border border-[#cfc5bd] px-2 py-0.5 rounded-full">
                Furnished
              </span>
            )}
          </div>
        </div>
        <p className="text-[11px] text-[#7d766f]">Available {available}</p>
      </div>
    </Link>
  );
}
