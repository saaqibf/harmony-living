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

  return (
    <div className="min-h-screen bg-stone-50 pb-12">
      {/* Header bar */}
      <div className="bg-white border-b border-stone-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/listings"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Listings
          </Link>
          {isOwner && (
            <div className="flex gap-2">
              <Link
                href={`/listings/${id}/edit`}
                className="text-sm font-semibold text-gray-600 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-xl transition-colors"
              >
                Edit
              </Link>
              <form action={publishListingAction.bind(null, id)}>
                <Button type="submit">Publish</Button>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Photo gallery */}
        {listing.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
            <img
              src={listing.images[0].url}
              alt={listing.title}
              className="col-span-2 w-full aspect-[16/9] object-cover"
            />
            {listing.images.slice(1, 3).map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt={img.caption ?? listing.title}
                className="w-full aspect-square object-cover"
              />
            ))}
          </div>
        )}

        {listing.images.length === 0 && (
          <div className="rounded-2xl bg-stone-100 aspect-[16/9] flex flex-col items-center justify-center text-stone-400">
            <span className="text-5xl mb-2">🏠</span>
            <span className="text-sm font-medium">No photos yet</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="md:col-span-2 space-y-5">
            {/* Title + location */}
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{listing.title}</h1>
              <p className="text-gray-500 text-sm flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                {listing.neighborhood ? `${listing.neighborhood}, ` : ''}{listing.city}
              </p>
              <div className="mt-4 pt-4 border-t border-stone-100">
                <span className="text-3xl font-bold text-primary-700">
                  {listing.currency} {listing.rentAmount.toLocaleString()}
                </span>
                <span className="text-gray-400 text-sm ml-1">/month</span>
              </div>
            </div>

            {/* Details grid */}
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Details</h2>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Type</p>
                  <p className="font-semibold text-gray-900 capitalize">{listing.type.replace('_', ' ').toLowerCase()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Bedrooms · Bathrooms</p>
                  <p className="font-semibold text-gray-900">{listing.bedroomsTotal} bd · {listing.bathroomsTotal} ba</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Available</p>
                  <p className="font-semibold text-gray-900">{available}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Lease</p>
                  <p className="font-semibold text-gray-900">{listing.leaseMonths} months</p>
                </div>
                {listing.depositAmount && (
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Deposit</p>
                    <p className="font-semibold text-gray-900">{listing.currency} {listing.depositAmount.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Feature chips */}
            {(listing.utilitiesIncluded || listing.furnished || listing.smokingAllowed || listing.petsAllowed || listing.genderPref !== 'ANY') && (
              <div className="flex flex-wrap gap-2">
                {listing.utilitiesIncluded && (
                  <span className="text-sm px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100 font-medium">⚡ Utilities included</span>
                )}
                {listing.furnished && (
                  <span className="text-sm px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 font-medium">🛋️ Furnished</span>
                )}
                {listing.smokingAllowed && (
                  <span className="text-sm px-3 py-1.5 rounded-full bg-stone-100 text-gray-600 border border-stone-200 font-medium">🚬 Smoking OK</span>
                )}
                {listing.petsAllowed && (
                  <span className="text-sm px-3 py-1.5 rounded-full bg-stone-100 text-gray-600 border border-stone-200 font-medium">🐾 Pets OK</span>
                )}
                {listing.genderPref !== 'ANY' && (
                  <span className="text-sm px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 font-medium">
                    {listing.genderPref === 'FEMALE_ONLY' ? '👩 Female tenants only' : listing.genderPref === 'MALE_ONLY' ? '👨 Male tenants only' : '🏳️‍🌈 Non-binary inclusive'}
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {listing.description && (
              <div className="bg-white rounded-2xl border border-stone-100 p-5">
                <h2 className="font-bold text-gray-900 mb-3">About this space</h2>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">{listing.description}</p>
              </div>
            )}

            {/* Amenities */}
            {listing.amenities.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-100 p-5">
                <h2 className="font-bold text-gray-900 mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((a) => (
                    <span key={a} className="text-sm px-3 py-1.5 rounded-full bg-stone-50 text-gray-700 border border-stone-200">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: map */}
          <div className="space-y-3">
            <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm" style={{ height: 240 }}>
              <Suspense fallback={<div className="w-full h-full bg-stone-100" />}>
                <ListingMap pins={[pin]} className="w-full h-full" />
              </Suspense>
            </div>
            <p className="text-xs text-gray-400 text-center">Approximate location shown for privacy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
