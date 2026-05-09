import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { requireDbUser } from '@/lib/auth/session';
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
  const { userId } = await requireDbUser();

  const listing = await getActiveListing(id);
  if (!listing) notFound();

  const isOwner = userId === listing.ownerId;
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
    <div className="min-h-screen bg-[#fdf8f7]">
      {/* Sticky top bar */}
      <div className="bg-white border-b border-[#cfc5bd] px-6 py-3.5 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/listings"
            className="flex items-center gap-1.5 text-sm text-[#7d766f] hover:text-[#7B2D5C] transition-colors font-medium"
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
                className="text-sm font-semibold text-[#4c4640] bg-[#f1edec] hover:bg-[#cfc5bd] px-4 py-2 rounded-lg transition-colors"
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
            <div className="h-72 bg-[#f1edec] flex flex-col items-center justify-center text-[#7d766f]">
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
              <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b] mb-1">{listing.title}</h1>
              <p className="text-sm text-[#7d766f] flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                {listing.neighborhood ? `${listing.neighborhood}, ` : ''}{listing.city}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-[#4c4640]">
                <span>🛏 {listing.bedroomsTotal} bed</span>
                <span>🚿 {listing.bathroomsTotal} bath</span>
                <span>📅 Available {available}</span>
              </div>
            </div>

            {/* Feature chips */}
            {(listing.utilitiesIncluded || listing.furnished || listing.smokingAllowed || listing.petsAllowed || listing.genderPref !== 'ANY') && (
              <div className="flex flex-wrap gap-2">
                {listing.utilitiesIncluded && (
                  <span className="text-sm px-3 py-1.5 rounded-full bg-[#f7f3f1] text-[#b05e3d] border border-[#cfc5bd] font-medium">⚡ Utilities included</span>
                )}
                {listing.furnished && (
                  <span className="text-sm px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 font-medium">🛋️ Furnished</span>
                )}
                {listing.smokingAllowed && (
                  <span className="text-sm px-3 py-1.5 rounded-full bg-[#f1edec] text-[#4c4640] border border-[#cfc5bd] font-medium">🚬 Smoking OK</span>
                )}
                {listing.petsAllowed && (
                  <span className="text-sm px-3 py-1.5 rounded-full bg-[#f1edec] text-[#4c4640] border border-[#cfc5bd] font-medium">🐾 Pets OK</span>
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
              <div className="bg-white rounded-2xl border border-[#cfc5bd] p-6">
                <h2 className="font-serif font-semibold text-[#1c1b1b] mb-3">The Space</h2>
                <p className="text-[#4c4640] text-sm whitespace-pre-line leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* Amenities */}
            {listing.amenities.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#cfc5bd] p-6">
                <h2 className="font-serif font-semibold text-[#1c1b1b] mb-4">Amenities</h2>
                <div className="grid grid-cols-2 gap-3">
                  {listing.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 text-sm text-[#4c4640]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2d4a3e] shrink-0" />
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location map */}
            <div className="bg-white rounded-2xl border border-[#cfc5bd] p-6">
              <h2 className="font-serif font-semibold text-[#1c1b1b] mb-4">Location</h2>
              <div className="rounded-xl overflow-hidden border border-[#cfc5bd]" style={{ height: 220 }}>
                <Suspense fallback={<div className="w-full h-full bg-[#f1edec]" />}>
                  <ListingMap pins={[pin]} className="w-full h-full" />
                </Suspense>
              </div>
              <p className="text-xs text-[#7d766f] text-center mt-2">Approximate location shown for privacy.</p>
            </div>
          </div>

          {/* Right sidebar — booking card */}
          <div className="w-72 shrink-0 space-y-4 sticky top-20">
            {/* Booking card */}
            <div className="bg-white rounded-2xl border border-[#cfc5bd] p-5 shadow-sm">
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-2xl font-bold text-[#1c1b1b]">
                  {listing.currency} {listing.rentAmount.toLocaleString()}
                </span>
                <span className="text-sm text-[#7d766f]">/mo</span>
              </div>

              <div className="space-y-2.5 mb-5 text-sm">
                {listing.depositAmount && (
                  <div className="flex justify-between">
                    <span className="text-[#7d766f]">Security deposit</span>
                    <span className="font-medium text-[#1c1b1b]">{listing.currency} {listing.depositAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#7d766f]">Lease term</span>
                  <span className="font-medium text-[#1c1b1b]">{listing.leaseMonths} months</span>
                </div>
                <div className="pt-2.5 border-t border-[#cfc5bd] flex justify-between font-semibold">
                  <span className="text-[#1c1b1b]">Total due monthly</span>
                  <span className="text-[#1c1b1b]">{listing.currency} {totalMonthly.toLocaleString()}</span>
                </div>
              </div>

              {!isOwner && (
                <div className="space-y-2">
                  <Link
                    href={`/messages`}
                    className="block w-full text-center py-3 bg-[#1c1916] text-white font-semibold rounded-lg hover:bg-[#2e2b28] transition-colors text-sm"
                  >
                    Apply in Room
                  </Link>
                  <Link
                    href={`/messages`}
                    className="block w-full text-center py-3 border border-[#cfc5bd] text-[#1c1b1b] font-semibold rounded-lg hover:bg-[#f1edec] transition-colors text-sm"
                  >
                    Message Host
                  </Link>
                </div>
              )}
            </div>

            {/* Trust badge */}
            <div className="bg-white rounded-2xl border border-[#cfc5bd] p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#eef4f1] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#2d4a3e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#1c1b1b] mb-0.5">Identity verified</p>
                  <p className="text-xs text-[#7d766f]">Safety background check complete for all Harmony Living hosts.</p>
                </div>
              </div>
            </div>

            {/* Report link */}
            <p className="text-center">
              <button className="text-xs text-[#7d766f] hover:text-[#4c4640] transition-colors underline underline-offset-2">
                Report this listing
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
