import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getMyListings } from '@/server/services/listings';
import { ListingCard } from '@/features/listings/components/listing-card';
import { buttonClasses } from '@/components/ui/button';

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
    <div className="min-h-screen bg-[--color-bg]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[--color-fg]">My listings</h1>
          {canCreate && (
            <Link href="/listings/new" className={buttonClasses()}>+ New listing</Link>
          )}
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-24 text-[--color-muted-fg]">
            You have no listings yet.
            {canCreate && (
              <div className="mt-4">
                <Link href="/listings/new" className={buttonClasses()}>Create one</Link>
              </div>
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
