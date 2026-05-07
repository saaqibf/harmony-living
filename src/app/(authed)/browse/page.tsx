import Link from 'next/link';
import { requireDbUser } from '@/lib/auth/session';
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
    <div className="min-h-screen bg-[#fdf8f7]">
      <div className="bg-white border-b border-[#cfc5bd] px-6 pt-6 pb-0">
        <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b] mb-4">Browse</h1>
        <div className="flex">
          <Link
            href="?tab=rooms"
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              isRooms
                ? 'border-[#c96d4d] text-[#c96d4d]'
                : 'border-transparent text-[#7d766f] hover:text-[#1c1b1b]'
            }`}
          >
            Rooms
          </Link>
          <Link
            href="?tab=roommates"
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              !isRooms
                ? 'border-[#c96d4d] text-[#c96d4d]'
                : 'border-transparent text-[#7d766f] hover:text-[#1c1b1b]'
            }`}
          >
            Roommates
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isRooms ? <RoomsTab /> : <RoommatesTab />}
      </div>
    </div>
  );
}

async function RoomsTab() {
  const listings = await getActiveListings({ limit: 50 });

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-[#f7f3f1] flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-[#c96d4d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        </div>
        <p className="font-serif font-semibold text-[#1c1b1b] mb-1">No rooms listed yet</p>
        <p className="text-sm text-[#7d766f] mb-6 max-w-xs">
          Be the first to list your space, or browse roommate profiles instead.
        </p>
        <Link
          href="?tab=roommates"
          className="px-5 py-2.5 bg-[#1c1916] text-white text-sm font-semibold rounded-xl hover:bg-[#2e2b28] transition-colors"
        >
          Browse Roommates
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-[#7d766f] mb-5">{listings.length} rooms available</p>
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
          />
        ))}
      </div>
    </div>
  );
}

async function RoommatesTab() {
  const { userId } = await requireDbUser();
  const profiles = await getBrowseProfiles(userId);

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-[#f7f3f1] flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-[#c96d4d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        </div>
        <p className="font-serif font-semibold text-[#1c1b1b] mb-1">No one looking right now</p>
        <p className="text-sm text-[#7d766f] mb-6 max-w-xs">
          New people join every day. Try discovering matches instead.
        </p>
        <Link
          href="/discover"
          className="px-5 py-2.5 bg-[#1c1916] text-white text-sm font-semibold rounded-xl hover:bg-[#2e2b28] transition-colors"
        >
          Try Discover
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-[#7d766f] mb-5">{profiles.length} people looking</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {profiles.map((profile) => {
          const photoToShow =
            profile.photoVisibility === 'ALWAYS'
              ? profile.photoUrl
              : profile.photoVisibility === 'UNTIL_MATCH'
                ? (profile.photoUrlBlurred ?? null)
                : null;

          const lifestyleTags = [profile.faith, profile.personality].filter(Boolean) as string[];

          return (
            <Link
              key={profile.userId}
              href={`/browse/${profile.userId}`}
              className="bg-white rounded-2xl border border-[#cfc5bd] overflow-hidden hover:shadow-md hover:border-[#c96d4d]/30 transition-all group"
            >
              <div className="h-44 bg-[#f1edec] flex items-center justify-center relative overflow-hidden">
                {photoToShow ? (
                  <img
                    src={photoToShow}
                    alt={profile.firstName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-5xl">👤</span>
                )}
                {profile.isVerified && (
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <svg className="w-2.5 h-2.5 text-[#2d4a3e]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[9px] font-bold text-[#2d4a3e] uppercase tracking-wide">Verified</span>
                  </div>
                )}
              </div>
              <div className="p-3.5">
                <p className="font-semibold text-[#1c1b1b] text-sm truncate">
                  {profile.firstName}, {profile.ageYears}
                </p>
                <p className="text-xs text-[#7d766f] flex items-center gap-1 mt-0.5 truncate">
                  <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {profile.city}
                </p>
                {lifestyleTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {lifestyleTags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[#f1edec] text-[#4c4640] border border-[#cfc5bd]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
