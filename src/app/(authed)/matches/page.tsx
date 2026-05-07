import { requireDbUser } from '@/lib/auth/session';
import { getMyMatches } from '@/server/services/discovery';
import { MatchCard } from '@/features/discovery/components/MatchCard';
import Link from 'next/link';

export default async function MatchesPage() {
  const { userId } = await requireDbUser();
  const matches = await getMyMatches(userId);

  return (
    <div className="bg-[#fdf8f7] min-h-screen">
      <div className="bg-white border-b border-[#cfc5bd] px-6 pt-8 pb-5">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">Matches</h1>
            {matches.length > 0 && (
              <p className="text-sm text-[#7d766f] mt-0.5">
                {matches.length} mutual connection{matches.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <Link
            href="/discover"
            className="bg-[#1c1916] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#2e2b28] active:scale-95 transition-all"
          >
            Discover
          </Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-[#f7f3f1] flex items-center justify-center mb-5">
              <svg className="w-9 h-9 text-[#c96d4d]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <h2 className="text-xl font-serif font-semibold text-[#1c1b1b] mb-2">No matches yet</h2>
            <p className="text-sm text-[#7d766f] mb-8 max-w-xs leading-relaxed">
              When you and someone both connect, they&apos;ll show up here. Go discover some people!
            </p>
            <Link
              href="/discover"
              className="bg-[#1c1916] text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-[#2e2b28] active:scale-95 transition-all"
            >
              Start discovering →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {matches.map((m) => (
              <MatchCard
                key={m.matchId}
                matchId={m.matchId}
                conversationId={m.conversationId}
                firstName={m.firstName}
                photoUrl={m.photoUrl}
                city={m.city}
                matchedAt={m.matchedAt}
                ageYears={m.ageYears}
                occupation={m.occupation}
                bio={m.bio}
                faith={m.faith}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
