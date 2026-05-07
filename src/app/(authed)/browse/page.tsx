import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getActiveListings } from '@/server/services/listings';
import { getBrowseProfiles } from '@/server/services/discovery';
import { ListingCard } from '@/features/listings/components/listing-card';

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = 'rooms' } = await searchParams;

  const isRooms = tab !== 'roommates';

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-100 px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Browse</h1>
        <div className="flex gap-2">
          <Link
            href="?tab=rooms"
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              isRooms ? 'bg-primary-600 text-white' : 'bg-stone-100 text-gray-600 hover:bg-stone-200'
            }`}
          >
            Rooms
          </Link>
          <Link
            href="?tab=roommates"
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              !isRooms ? 'bg-primary-600 text-white' : 'bg-stone-100 text-gray-600 hover:bg-stone-200'
            }`}
          >
            Roommates
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {isRooms ? <RoomsTab /> : <RoommatesTab />}
      </div>
    </div>
  );
}

async function RoomsTab() {
  const listings = await getActiveListings({ limit: 50 });

  if (listings.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500 text-lg mb-4">No rooms available right now.</p>
        <Link
          href="/discover"
          className="inline-block px-6 py-3 bg-primary-600 text-white font-semibold rounded-2xl hover:bg-primary-700 transition-colors"
        >
          Try Discover instead
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">{listings.length} rooms available</p>
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
          />
        ))}
      </div>
    </div>
  );
}

async function RoommatesTab() {
  const auth = await requireUser();
  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { id: true },
  });

  if (!user) return null;

  const profiles = await getBrowseProfiles(user.id);

  if (profiles.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500 text-lg mb-4">No one is looking right now.</p>
        <Link
          href="/discover"
          className="inline-block px-6 py-3 bg-primary-600 text-white font-semibold rounded-2xl hover:bg-primary-700 transition-colors"
        >
          Try Discover
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">{profiles.length} people looking</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {profiles.map((profile) => {
          const showPhoto =
            profile.photoVisibility === 'ALWAYS'
              ? profile.photoUrl
              : profile.photoVisibility === 'UNTIL_MATCH'
                ? (profile.photoUrlBlurred ?? null)
                : null;

          return (
            <Link
              key={profile.userId}
              href={`/browse/${profile.userId}`}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="h-40 bg-primary-50 flex items-start justify-center">
                {showPhoto ? (
                  <img
                    src={showPhoto}
                    alt={profile.firstName}
                    className="w-24 h-24 rounded-full mx-auto mt-4 object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full mx-auto mt-4 bg-stone-200 flex items-center justify-center text-3xl">
                    👤
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-bold text-gray-900 text-sm truncate">{profile.firstName}</p>
                <p className="text-xs text-gray-500">{profile.ageYears}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span>📍</span>
                  <span className="truncate">{profile.city}</span>
                </p>
                {profile.isVerified && (
                  <span className="inline-block mt-1 text-xs bg-primary-50 text-primary-700 border border-primary-200 rounded-full px-2 py-0.5 font-semibold">
                    ✓ Verified
                  </span>
                )}
                {profile.occupation && (
                  <span className="inline-block mt-1 text-xs bg-stone-100 text-gray-600 rounded-full px-2 py-0.5">
                    {profile.occupation}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
