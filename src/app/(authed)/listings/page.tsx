import { Suspense } from 'react';
import Link from 'next/link';
import { requireDbUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getActiveListings } from '@/server/services/listings';
import { ListingCard } from '@/features/listings/components/listing-card';
import { ListingMap } from '@/features/listings/components/listing-map';
import { buttonClasses } from '@/components/ui/button';

export default async function ListingsPage() {
  const { userId } = await requireDbUser();
  const [user, listings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        roles: true,
        onboardingState: { select: { intent: true } },
        verifications: { where: { status: 'APPROVED' }, select: { id: true } },
      },
    }),
    getActiveListings({ limit: 50 }),
  ]);

  const intent = user?.onboardingState?.intent ?? '';
  const isLister = ['roommate_finder', 'tenant_lister', 'landlord', 'lister', 'room_seeker_and_lister', 'both'].includes(intent);
  const isSeeker = ['room_seeker', 'seeker', 'room_seeker_and_lister', 'both'].includes(intent);
  const canPost = (user?.verifications.length ?? 0) > 0 || user?.roles.includes('ADMIN');

  const pins = listings.map((l) => ({
    id: l.id,
    lat: l.approxLatitude,
    lng: l.approxLongitude,
    label: l.title,
    rent: l.rentAmount,
  }));

  return (
    <div className="min-h-screen bg-[#F2E6E0]">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Lister/Landlord hero CTA, shown when their primary mode is listing */}
        {isLister && !isSeeker && (
          <div className="mb-6 bg-[#A86472] rounded-2xl px-6 py-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-white font-semibold text-base font-serif">Ready to post your listing?</p>
              <p className="text-[#E8D5D0] text-sm mt-0.5">
                {intent === 'landlord'
                  ? 'List your property and connect with verified tenants.'
                  : 'List your spare room and find a great roommate.'}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link href="/listings/my" className="text-sm font-semibold text-[#E8D5D0] hover:text-white px-4 py-2 rounded-xl border border-[#E8D5D0]/40 hover:border-white transition-colors">
                My listings
              </Link>
              {canPost && (
                <Link href="/listings/new" className="text-sm font-semibold bg-white text-[#A86472] px-4 py-2 rounded-xl hover:bg-[#F9F0EE] transition-colors">
                  + New listing
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">
            {isSeeker || (!isLister && !isSeeker) ? 'Available rooms' : 'All listings'}
          </h1>
          {(isSeeker || isLister) && (
            <div className="flex gap-3">
              {isLister && isSeeker && canPost && (
                <Link href="/listings/new" className={buttonClasses()}>+ New listing</Link>
              )}
              {isLister && isSeeker && (
                <Link href="/listings/my" className={buttonClasses({ variant: 'secondary' })}>My listings</Link>
              )}
              {!isLister && (
                <span className="text-xs text-[#7d766f] self-center">{listings.length} room{listings.length !== 1 ? 's' : ''} available</span>
              )}
            </div>
          )}
        </div>

        {listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EFE0D8] flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-[#C4909A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <p className="text-[#4c4640] font-semibold mb-1">No listings yet</p>
            <p className="text-sm text-[#7d766f] mb-5">
              {isLister ? 'Be the first to post a room.' : 'Check back soon. Rooms get posted regularly.'}
            </p>
            {canPost && isLister && (
              <Link href="/listings/new" className={buttonClasses()}>Post the first listing</Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
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
            <div className="hidden lg:block sticky top-24 h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-[#cfc5bd]">
              <Suspense fallback={<div className="w-full h-full bg-[#EFE0D8]" />}>
                <ListingMap pins={pins} className="w-full h-full" />
              </Suspense>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
