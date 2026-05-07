import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getMyListings } from '@/server/services/listings';
import { ListingCard } from '@/features/listings/components/listing-card';
export default async function MyListingsPage() {
  const auth = await requireUser();
  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { id: true, roles: true },
  });
  if (!user) return null;

  const listings = await getMyListings(user.id);
  const canCreate = user.roles.includes('LISTER') || user.roles.includes('ADMIN');

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-100 px-4 pt-10 pb-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My listings</h1>
            {listings.length > 0 && (
              <p className="text-sm text-gray-400 mt-0.5">{listings.length} listing{listings.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          {canCreate && (
            <Link
              href="/listings/new"
              className="bg-primary-600 text-white text-sm font-bold px-5 py-2.5 rounded-2xl hover:bg-primary-700 active:scale-95 transition-all shadow-md shadow-primary-600/20"
            >
              + New listing
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 pb-12">
        {listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center mb-6 border-4 border-primary-100">
              <span className="text-4xl">🏠</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No listings yet</h2>
            <p className="text-sm text-gray-400 mb-8 max-w-xs leading-relaxed">
              Post a room and connect with compatible roommates in your area.
            </p>
            {canCreate && (
              <Link
                href="/listings/new"
                className="bg-primary-600 text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-primary-700 active:scale-95 transition-all shadow-lg shadow-primary-600/20"
              >
                Create your first listing →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

