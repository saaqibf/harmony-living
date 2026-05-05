import { Suspense } from 'react';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getActiveListings } from '@/server/services/listings';
import { ListingCard } from '@/features/listings/components/listing-card';
import { ListingMap } from '@/features/listings/components/listing-map';
import { buttonClasses } from '@/components/ui/button';

export default async function ListingsPage() {
  const auth = await requireUser();
  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { roles: true, verifications: { where: { status: 'APPROVED' }, select: { id: true } } },
  });

  const listings = await getActiveListings({ limit: 50 });

  const pins = listings.map((l) => ({
    id: l.id,
    lat: l.approxLatitude,
    lng: l.approxLongitude,
    label: l.title,
    rent: l.rentAmount,
  }));

  const canPost = (user?.verifications.length ?? 0) > 0 || user?.roles.includes('ADMIN');

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Listings</h1>
          <div className="flex gap-3">
            {canPost && (
              <Link href="/listings/new" className={buttonClasses()}>+ New listing</Link>
            )}
            <Link href="/listings/my" className={buttonClasses({ variant: 'secondary' })}>My listings</Link>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            No active listings yet.
            {canPost && (
              <div className="mt-4">
                <Link href="/listings/new" className={buttonClasses()}>Create the first one</Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-400">{listings.length} listing{listings.length !== 1 ? 's' : ''}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listings.map((l) => (
                  <ListingCard
                    key={l.id}
                    id={l.id}
                    title={l.title}
                    city={l.city}
                    neighborhood={l.neighborhood}
                    rentAmount={l.rentAmount}
                    currency={l.currency}
                    bedroomsTotal={l.bedroomsTotal}
                    bathroomsTotal={l.bathroomsTotal}
                    furnished={l.furnished}
                    availableFrom={l.availableFrom}
                    coverImageUrl={l.images[0]?.url}
                  />
                ))}
              </div>
            </div>
            <div className="hidden lg:block sticky top-24 h-[calc(100vh-8rem)] rounded-xl overflow-hidden border border-stone-200">
              <Suspense fallback={<div className="w-full h-full bg-stone-100" />}>
                <ListingMap pins={pins} className="w-full h-full" />
              </Suspense>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
