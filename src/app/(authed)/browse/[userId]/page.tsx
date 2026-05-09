import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireDbUser } from '@/lib/auth/session';
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
    case 'VERY_TIDY': return 'Very tidy';
    case 'TIDY': return 'Tidy';
    case 'AVERAGE': return 'Average';
    case 'RELAXED': return 'Relaxed';
    default: return level;
  }
}

function formatSchedule(schedule: string): string {
  switch (schedule) {
    case 'EARLY_BIRD': return 'Early bird';
    case 'NIGHT_OWL': return 'Night owl';
    case 'FLEXIBLE': return 'Flexible';
    case 'SHIFT_WORKER': return 'Shift worker';
    default: return schedule;
  }
}

function formatMoveInUrgency(moveInDate: Date): string {
  const now = new Date();
  const diffDays = Math.ceil((moveInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 30) return 'This month';
  if (diffDays <= 60) return 'Next 1–2 months';
  if (diffDays <= 90) return 'Within 3 months';
  return new Intl.DateTimeFormat('en-CA', { month: 'long', year: 'numeric' }).format(moveInDate);
}

export default async function BrowseProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const { userId: viewerId } = await requireDbUser();

  const profile = await getBrowseProfileById(viewerId, userId);
  if (!profile) notFound();

  const [existingSwipe, existingMatch] = await Promise.all([
    prisma.swipe.findFirst({
      where: { swiperUserId: viewerId, targetUserId: userId },
      select: { direction: true },
    }),
    prisma.match.findFirst({
      where: {
        active: true,
        OR: [
          { userAId: viewerId, userBId: userId },
          { userAId: userId, userBId: viewerId },
        ],
      },
      select: { conversationId: true },
    }),
  ]);

  const isSelf = viewerId === userId;

  const photoToShow =
    profile.photoVisibility === 'ALWAYS'
      ? profile.photoUrl
      : profile.photoVisibility === 'UNTIL_MATCH'
        ? (profile.photoUrlBlurred ?? null)
        : null;

  const lifestyleTags: string[] = [
    profile.occupation,
    profile.faith,
    profile.preferences?.cleanliness ? formatCleanliness(profile.preferences.cleanliness) : null,
    profile.preferences?.schedule ? formatSchedule(profile.preferences.schedule) : null,
    profile.preferences?.pets ? 'Pet owner' : null,
    profile.preferences?.smokingSelf ? 'Smoker' : null,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-[#fdf8f7]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href="/browse?tab=roommates"
          className="inline-flex items-center gap-1.5 text-sm text-[#7d766f] hover:text-[#1c1b1b] transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to roommates
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-[1fr,300px] gap-8">
          {/* Left — profile content */}
          <div className="space-y-6">
            {/* Hero: photo + header */}
            <div className="bg-white rounded-2xl border border-[#cfc5bd] overflow-hidden">
              <div className="h-56 bg-[#f1edec] relative">
                {photoToShow ? (
                  <img
                    src={photoToShow}
                    alt={profile.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-7xl">👤</span>
                  </div>
                )}
                {profile.isVerified && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                    <svg className="w-3 h-3 text-[#2d4a3e]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[10px] font-bold text-[#2d4a3e] uppercase tracking-wide">Verified</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">
                    Hi, I&apos;m {profile.firstName}
                  </h1>
                  <span className="shrink-0 text-xs font-semibold bg-[#fdf4f9] text-[#7B2D5C] border border-[#cfc5bd] rounded-full px-3 py-1">
                    Looking for a place
                  </span>
                </div>
                <p className="text-sm text-[#7d766f]">
                  {profile.ageYears} · {formatGender(profile.gender)}
                </p>
                <p className="text-sm text-[#7d766f] flex items-center gap-1 mt-0.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {profile.city}
                </p>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl border border-[#cfc5bd] p-6">
              <p className="text-xs font-semibold text-[#7d766f] uppercase tracking-widest mb-3">About</p>
              {profile.bio ? (
                <p className="text-sm text-[#1c1b1b] leading-relaxed">{profile.bio}</p>
              ) : (
                <p className="text-sm text-[#7d766f] italic">No introduction yet.</p>
              )}
            </div>

            {/* Lifestyle tags */}
            {lifestyleTags.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#cfc5bd] p-6">
                <p className="text-xs font-semibold text-[#7d766f] uppercase tracking-widest mb-3">Lifestyle</p>
                <div className="flex flex-wrap gap-2">
                  {lifestyleTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-sm px-3 py-1.5 rounded-full bg-[#f1edec] text-[#4c4640] border border-[#cfc5bd]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Their listing */}
            {profile.activeListing && (
              <div>
                <p className="text-xs font-semibold text-[#7d766f] uppercase tracking-widest mb-3">Their listing</p>
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
            )}
          </div>

          {/* Right — sidebar */}
          <div className="space-y-4">
            {/* Renter info */}
            <div className="bg-white rounded-2xl border border-[#cfc5bd] p-5">
              <p className="text-xs font-semibold text-[#7d766f] uppercase tracking-widest mb-4">Renter Info</p>
              {profile.preferences ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-[#7d766f] uppercase tracking-widest mb-0.5">Budget</p>
                    <p className="text-sm font-semibold text-[#1c1b1b]">
                      ${profile.preferences.budgetMin.toLocaleString()} – ${profile.preferences.budgetMax.toLocaleString()}<span className="font-normal text-[#7d766f]">/mo</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#7d766f] uppercase tracking-widest mb-0.5">Moving</p>
                    <p className="text-sm font-semibold text-[#1c1b1b]">
                      {formatMoveInUrgency(profile.preferences.moveInDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#7d766f] uppercase tracking-widest mb-0.5">Looking in</p>
                    <p className="text-sm font-semibold text-[#1c1b1b]">
                      {profile.preferences.preferredCities.length > 0
                        ? profile.preferences.preferredCities.join(', ')
                        : profile.city}
                    </p>
                  </div>
                  {profile.preferences.preferredNeighborhoods.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-[#7d766f] uppercase tracking-widest mb-0.5">Neighbourhoods</p>
                      <p className="text-sm font-semibold text-[#1c1b1b]">
                        {profile.preferences.preferredNeighborhoods.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#7d766f]">No preferences set yet</p>
              )}
            </div>

            {/* CTA */}
            {isSelf ? (
              <div className="w-full py-4 rounded-2xl bg-[#f1edec] text-[#7d766f] text-center text-sm font-semibold">
                This is your profile
              </div>
            ) : existingMatch ? (
              existingMatch.conversationId ? (
                <Link
                  href={`/messages/${existingMatch.conversationId}`}
                  className="block w-full py-4 rounded-2xl font-semibold text-white bg-[#1c1916] hover:bg-[#2e2b28] text-center text-sm transition-colors"
                >
                  Send a message →
                </Link>
              ) : (
                <div className="w-full py-4 rounded-2xl bg-[#f1edec] text-[#7d766f] text-center text-sm font-semibold">
                  Matched
                </div>
              )
            ) : existingSwipe?.direction === 'CONNECT' ? (
              <div className="w-full py-4 rounded-2xl bg-[#fdf4f9] text-[#7B2D5C] border border-[#cfc5bd] text-center text-sm font-semibold">
                Request sent ✓
              </div>
            ) : existingSwipe?.direction === 'PASS' ? (
              <div className="w-full py-4 rounded-2xl bg-[#f1edec] text-[#7d766f] text-center text-sm font-semibold">
                You passed on this person
              </div>
            ) : (
              <ConnectButton targetId={userId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
