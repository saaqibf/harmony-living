import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getActiveListing } from '@/server/services/listings';
import { ListingMap } from '@/features/listings/components/listing-map';
import { Button } from '@/components/ui/button';
import { publishListingAction } from '@/features/listings/lib/actions';

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auth = await requireUser();

  const [listing, user] = await Promise.all([
    getActiveListing(id),
    prisma.user.findUnique({
      where: { cognitoSub: auth.cognitoSub },
      select: { id: true },
    }),
  ]);

  if (!listing) notFound();

  const isOwner = user?.id === listing.ownerId;
  const available = new Intl.DateTimeFormat('en-CA', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(listing.availableFrom));

  const pin = {
    id: listing.id,
    lat: listing.approxLatitude,
    lng: listing.approxLongitude,
    label: listing.title,
    rent: listing.rentAmount,
  };

  const totalMonthly = listing.rentAmount;

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      {/* Sticky top bar */}
      <div className="bg-white border-b border-[#E5E0D8] px-6 py-3.5 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/listings"
            className="flex items-center gap-1.5 text-sm text-[#85736a] hover:text-[#C07A50] transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {listing.title}
          </Link>
          {isOwner && (
            <div className="flex gap-2">
              <Link
                href={`/listings/${id}/edit`}
                className="text-sm font-semibold text-[#53443c] bg-[#F2EFE9] hover:bg-[#E5E0D8] px-4 py-2 rounded-lg transition-colors"
              >
                Edit
              </Link>
              <form action={publishListingAction.bind(null, id)}>
                <Button type="submit" size="sm">Publish</Button>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-6 pb-12">
        {/* Photo gallery */}
        <div className="mb-6 rounded-2xl overflow-hidden">
          {listing.images.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 h-80">
              <img
                src={listing.images[0].url}
                alt={listing.title}
                className="col-span-2 row-span-2 w-full h-full object-cover"
              />
              {listing.images.slice(1, 5).map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt={img.caption ?? listing.title}
                  className="w-full h-full object-cover"
                />
              ))}
            </div>
          ) : (
            <div className="h-72 bg-[#F2EFE9] flex flex-col items-center justify-center text-[#85736a]">
              <span className="text-5xl mb-2">🏠</span>
              <span className="text-sm font-medium">No photos yet</span>
            </div>
          )}
        </div>

        {/* Three-column: main (2/3) + right sidebar (1/3) */}
        <div className="flex gap-6 items-start">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Title + meta */}
            <div>
              <h1 className="text-2xl font-serif font-semibold text-[#1A1D1E] mb-1">{listing.title}</h1>
              <p className="text-sm text-[#85736a] flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                {listing.neighborhood ? `${listing.neighborhood}, ` : ''}{listing.city}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-[#53443c]">
                <span>🛏 {listing.bedroomsTotal} bed</span>
                <span>🚿 {listing.bathroomsTotal} bath</span>
                <span>📅 Available {available}</span>
              </div>
            </div>

            {/* Feature chips */}
            {(listing.utilitiesIncluded || listing.furnished || listing.smokingAllowed || listing.petsAllowed || listing.genderPref !== 'ANY') && (
              <div className="flex flex-wrap gap-2">
                {listing.utilitiesIncluded && (
                  <span className="text-sm px-3 py-1.5 rounded-full bg-[#fdf3ec] text-[#a6643c] border border-[#f9c9a3] font-medium">⚡ Utilities included</span>
                )}
                {listing.furnished && (
                  <span className="text-sm px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 font-medium">🛋️ Furnished</span>
                )}
                {listing.smokingAllowed && (
                  <span className="text-sm px-3 py-1.5 rounded-full bg-[#F2EFE9] text-[#53443c] border border-[#E5E0D8] font-medium">🚬 Smoking OK</span>
                )}
                {listing.petsAllowed && (
                  <span className="text-sm px-3 py-1.5 rounded-full bg-[#F2EFE9] text-[#53443c] border border-[#E5E0D8] font-medium">🐾 Pets OK</span>
                )}
                {listing.genderPref !== 'ANY' && (
                  <span className="text-sm px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 font-medium">
                    {listing.genderPref === 'FEMALE_ONLY' ? '👩 Female only' : listing.genderPref === 'MALE_ONLY' ? '👨 Male only' : '🏳️‍🌈 Non-binary inclusive'}
                  </span>
                )}
              </div>
            )}

            {/* The Space */}
            {listing.description && (
              <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
                <h2 className="font-serif font-semibold text-[#1A1D1E] mb-3">The Space</h2>
                <p className="text-[#53443c] text-sm whitespace-pre-line leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* Amenities */}
            {listing.amenities.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
                <h2 className="font-serif font-semibold text-[#1A1D1E] mb-4">Amenities</h2>
                <div className="grid grid-cols-2 gap-3">
                  {listing.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 text-sm text-[#53443c]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C07A50] shrink-0" />
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location map */}
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
              <h2 className="font-serif font-semibold text-[#1A1D1E] mb-4">Location</h2>
              <div className="rounded-xl overflow-hidden border border-[#E5E0D8]" style={{ height: 220 }}>
                <Suspense fallback={<div className="w-full h-full bg-[#F2EFE9]" />}>
                  <ListingMap pins={[pin]} className="w-full h-full" />
                </Suspense>
              </div>
              <p className="text-xs text-[#85736a] text-center mt-2">Approximate location shown for privacy.</p>
            </div>
          </div>

          {/* Right sidebar — booking card */}
          <div className="w-72 shrink-0 space-y-4 sticky top-20">
            {/* Booking card */}
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 shadow-sm">
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-2xl font-bold text-[#1A1D1E]">
                  {listing.currency} {listing.rentAmount.toLocaleString()}
                </span>
                <span className="text-sm text-[#85736a]">/mo</span>
              </div>

              <div className="space-y-2.5 mb-5 text-sm">
                {listing.depositAmount && (
                  <div className="flex justify-between">
                    <span className="text-[#85736a]">Security deposit</span>
                    <span className="font-medium text-[#1A1D1E]">{listing.currency} {listing.depositAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#85736a]">Lease term</span>
                  <span className="font-medium text-[#1A1D1E]">{listing.leaseMonths} months</span>
                </div>
                <div className="pt-2.5 border-t border-[#E5E0D8] flex justify-between font-semibold">
                  <span className="text-[#1A1D1E]">Total due monthly</span>
                  <span className="text-[#1A1D1E]">{listing.currency} {totalMonthly.toLocaleString()}</span>
                </div>
              </div>

              {!isOwner && (
                <div className="space-y-2">
                  <Link
                    href={`/messages`}
                    className="block w-full text-center py-3 bg-[#C07A50] text-white font-semibold rounded-lg hover:bg-[#a6643c] transition-colors text-sm"
                  >
                    Apply in Room
                  </Link>
                  <Link
                    href={`/messages`}
                    className="block w-full text-center py-3 border border-[#E5E0D8] text-[#1A1D1E] font-semibold rounded-lg hover:bg-[#F2EFE9] transition-colors text-sm"
                  >
                    Message Host
                  </Link>
                </div>
              )}
            </div>

            {/* Trust badge */}
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#eef4f1] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#476458]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#1A1D1E] mb-0.5">Identity verified</p>
                  <p className="text-xs text-[#85736a]">Safety background check complete for all Harmony Living hosts.</p>
                </div>
              </div>
            </div>

            {/* Report link */}
            <p className="text-center">
              <button className="text-xs text-[#85736a] hover:text-[#53443c] transition-colors underline underline-offset-2">
                Report this listing
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
