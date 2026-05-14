import Link from 'next/link';

type Props = {
  listing: {
    id: string;
    title: string;
    city: string;
    neighborhood: string | null;
    rentAmount: number;
    currency: string;
    availableFrom: Date;
    coverImageUrl: string | null;
  };
};

export function ListingContextBanner({ listing }: Props) {
  const available = new Intl.DateTimeFormat('en-CA', { month: 'long', day: 'numeric' }).format(
    new Date(listing.availableFrom),
  );

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="flex items-center gap-3 px-4 py-3 bg-white border-b border-[#e8e0e5] hover:bg-[#fdfafc] transition-colors group"
    >
      {/* Thumbnail */}
      <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-[#EFE0D8]">
        {listing.coverImageUrl ? (
          <img
            src={listing.coverImageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl">🏠</div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#1c1b1b] truncate group-hover:text-[#A86472] transition-colors">
          {listing.title}
        </p>
        <p className="text-xs text-[#7d766f] mt-0.5">
          {listing.currency} {listing.rentAmount.toLocaleString()}/mo · {available}
          {listing.neighborhood ? ` · ${listing.neighborhood}` : ''}
        </p>
      </div>

      {/* Chevron */}
      <svg
        className="w-4 h-4 text-[#cfc5bd] shrink-0 group-hover:text-[#A86472] transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
