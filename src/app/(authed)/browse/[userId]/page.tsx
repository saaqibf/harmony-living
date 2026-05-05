import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getBrowseProfileById } from '@/server/services/discovery';
import { ConnectButton } from '@/features/discovery/components/ConnectButton';
import { ListingCard } from '@/features/listings/components/listing-card';

function formatGender(gender: string): string {
  switch (gender) {
    case 'MALE': return 'Male';
    case 'FEMALE': return 'Female';
    case 'NON_BINARY': return 'Non-binary';
    case 'PREFER_NOT_TO_SAY': return 'Prefer not to say';
    default: return gender;
  }
}

function formatCleanliness(level: string): string {
  switch (level) {
    case 'VERY_TIDY': return 'Very Tidy';
    case 'TIDY': return 'Tidy';
    case 'AVERAGE': return 'Average';
    case 'RELAXED': return 'Relaxed';
    default: return level;
  }
}

function formatSchedule(schedule: string): string {
  switch (schedule) {
    case 'EARLY_BIRD': return 'Early Bird';
    case 'NIGHT_OWL': return 'Night Owl';
    case 'FLEXIBLE': return 'Flexible';
    case 'SHIFT_WORKER': return 'Shift Worker';
    default: return schedule;
  }
}

function formatMoveInUrgency(moveInDate: Date): string {
  const now = new Date();
  const diffMs = moveInDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 30) return 'Urgent (this month)';
  if (diffDays <= 60) return 'Soon (next 1-2 months)';
  if (diffDays <= 90) return 'In 3 months';
  return new Intl.DateTimeFormat('en-CA', { month: 'long', year: 'numeric' }).format(moveInDate);
}

export default async function BrowseProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const auth = await requireUser();
  const viewer = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { id: true },
  });

  if (!viewer) notFound();

  const profile = await getBrowseProfileById(viewer.id, userId);
  if (!profile) notFound();

  const [existingSwipe, existingMatch] = await Promise.all([
    prisma.swipe.findFirst({
      where: { swiperUserId: viewer.id, targetUserId: userId },
      select: { direction: true },
    }),
    prisma.match.findFirst({
      where: {
        active: true,
        OR: [
          { userAId: viewer.id, userBId: userId },
          { userAId: userId, userBId: viewer.id },
        ],
      },
      select: { conversationId: true },
    }),
  ]);

  const isSelf = viewer.id === userId;

  const photoToShow =
    profile.photoVisibility === 'ALWAYS'
      ? profile.photoUrl
      : profile.photoVisibility === 'UNTIL_MATCH'
        ? (profile.photoUrlBlurred ?? null)
        : null;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/browse?tab=roommates"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          ← Back to roommates
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-[1fr,320px] gap-8">
          <div>
            <div className="flex items-center gap-5 mb-6">
              {photoToShow ? (
                <img
                  src={photoToShow}
                  alt={profile.firstName}
                  className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg bg-stone-200 flex items-center justify-center text-4xl flex-shrink-0">
                  👤
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Hi, I'm {profile.firstName}</h1>
                <span className="inline-block mt-1 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full border border-teal-100">
                  Looking for a place
                </span>
                <p className="text-sm text-gray-500 mt-2">
                  {profile.ageYears} · {formatGender(profile.gender)}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <span>📍</span>
                  {profile.city}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Introduction
              </p>
              {profile.bio ? (
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              ) : (
                <p className="text-gray-400 italic">No introduction yet.</p>
              )}
            </div>

            {(profile.occupation ||
              profile.faith ||
              profile.preferences?.cleanliness ||
              profile.preferences?.schedule ||
              profile.preferences?.pets) && (
              <div className="flex flex-wrap gap-2">
                {profile.occupation && (
                  <span className="bg-stone-100 text-gray-700 rounded-full px-3 py-1 text-sm">
                    {profile.occupation}
                  </span>
                )}
                {profile.faith && (
                  <span className="bg-stone-100 text-gray-700 rounded-full px-3 py-1 text-sm">
                    {profile.faith}
                  </span>
                )}
                {profile.preferences?.cleanliness && (
                  <span className="bg-stone-100 text-gray-700 rounded-full px-3 py-1 text-sm">
                    {formatCleanliness(profile.preferences.cleanliness)}
                  </span>
                )}
                {profile.preferences?.schedule && (
                  <span className="bg-stone-100 text-gray-700 rounded-full px-3 py-1 text-sm">
                    {formatSchedule(profile.preferences.schedule)}
                  </span>
                )}
                {profile.preferences?.pets && (
                  <span className="bg-stone-100 text-gray-700 rounded-full px-3 py-1 text-sm">
                    Pet owner
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">My Renter Info</h2>
              {profile.preferences ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400 uppercase text-xs font-bold tracking-widest">
                      Budget
                    </span>
                    <span className="text-gray-900 font-medium">
                      ${profile.preferences.budgetMin.toLocaleString()} –{' '}
                      ${profile.preferences.budgetMax.toLocaleString()} / mo
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 uppercase text-xs font-bold tracking-widest">
                      Urgency
                    </span>
                    <span className="text-gray-900 font-medium">
                      {formatMoveInUrgency(profile.preferences.moveInDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 uppercase text-xs font-bold tracking-widest">
                      Looking in
                    </span>
                    <span className="text-gray-900 font-medium text-right max-w-[160px]">
                      {profile.preferences.preferredCities.length > 0
                        ? profile.preferences.preferredCities.join(', ')
                        : profile.city}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 uppercase text-xs font-bold tracking-widest">
                      Lifestyle
                    </span>
                    <span className="text-gray-900 font-medium">
                      {formatCleanliness(profile.preferences.cleanliness)} ·{' '}
                      {formatSchedule(profile.preferences.schedule)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No preferences set yet</p>
              )}
            </div>

            {isSelf ? (
              <div className="w-full py-4 rounded-2xl bg-stone-100 text-gray-500 text-center font-semibold">
                This is you
              </div>
            ) : existingMatch ? (
              existingMatch.conversationId ? (
                <Link
                  href={`/messages/${existingMatch.conversationId}`}
                  className="block w-full py-4 rounded-2xl font-bold text-white bg-teal-600 hover:bg-teal-700 text-center transition-colors"
                >
                  Message →
                </Link>
              ) : (
                <div className="w-full py-4 rounded-2xl bg-stone-100 text-gray-500 text-center font-semibold">
                  Matched (no chat yet)
                </div>
              )
            ) : existingSwipe?.direction === 'CONNECT' ? (
              <div className="w-full py-4 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 text-center font-semibold">
                Request sent ✓
              </div>
            ) : existingSwipe?.direction === 'PASS' ? (
              <div className="w-full py-4 rounded-2xl bg-stone-100 text-gray-500 text-center font-semibold">
                You passed on this person
              </div>
            ) : (
              <ConnectButton targetId={userId} />
            )}
          </div>
        </div>

        {profile.activeListing && (
          <div className="mt-8 border-t border-stone-100 pt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Their listing</h2>
            <div className="max-w-sm">
              <ListingCard
                id={profile.activeListing.id}
                title={profile.activeListing.title}
                city={profile.activeListing.city}
                neighborhood={profile.activeListing.neighborhood}
                rentAmount={profile.activeListing.rentAmount}
                currency={profile.activeListing.currency}
                bedroomsTotal={profile.activeListing.bedroomsTotal}
                bathroomsTotal={profile.activeListing.bathroomsTotal}
                furnished={profile.activeListing.furnished}
                availableFrom={profile.activeListing.availableFrom}
                coverImageUrl={profile.activeListing.coverImageUrl}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
