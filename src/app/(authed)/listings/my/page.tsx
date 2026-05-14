import Link from 'next/link';
import { requireDbUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getMyListings } from '@/server/services/listings';
import { ListingCard } from '@/features/listings/components/listing-card';

export default async function MyListingsPage() {
  const { userId } = await requireDbUser();
  const [user, listings] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { roles: true } }),
    getMyListings(userId),
  ]);

  const canCreate = user?.roles.includes('LISTER') || user?.roles.includes('ADMIN');

  return (
    <div className="min-h-screen bg-[#F2E6E0]">
      <div className="bg-white border-b border-[#cfc5bd] px-6 pt-8 pb-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">My listings</h1>
            {listings.length > 0 && (
              <p className="text-sm text-[#7d766f] mt-0.5">{listings.length} listing{listings.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          {canCreate && (
            <Link
              href="/listings/new"
              className="bg-[#1c1916] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#2e2b28] active:scale-95 transition-all"
            >
              + New listing
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 pb-24">
        {listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-[#F5EAE4] flex items-center justify-center mb-5">
              <span className="text-4xl">🏠</span>
            </div>
            <h2 className="text-xl font-serif font-semibold text-[#1c1b1b] mb-2">No listings yet</h2>
            <p className="text-sm text-[#7d766f] mb-8 max-w-xs leading-relaxed">
              Post a room and connect with compatible roommates in your area.
            </p>
            {canCreate && (
              <Link
                href="/listings/new"
                className="bg-[#1c1916] text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-[#2e2b28] active:scale-95 transition-all"
              >
                Create your first listing →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                status={l.status}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
