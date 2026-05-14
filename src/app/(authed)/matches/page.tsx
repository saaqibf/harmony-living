import { requireDbUser } from '@/lib/auth/session';
import { getMyMatches } from '@/server/services/discovery';
import { MatchCard } from '@/features/discovery/components/MatchCard';
import Link from 'next/link';

export default async function MatchesPage() {
  const { userId } = await requireDbUser();
  const matches = await getMyMatches(userId);

  return (
    <div className="min-h-screen bg-[#F2E6E0]">
      {/* Header */}
      <div className="px-8 pt-10 pb-8">
        <p className="text-[10px] font-mono tracking-widest uppercase text-[#A86472] mb-2">Your connections</p>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-serif font-semibold text-[#1c1b1b] leading-tight">
              {matches.length > 0 ? `${matches.length} Match${matches.length !== 1 ? 'es' : ''}` : 'Matches'}
            </h1>
            <p className="text-sm text-[#7d766f] mt-1">
              {matches.length > 0
                ? 'People who chose you back. Start the conversation.'
                : 'Mutual connections will appear here.'}
            </p>
          </div>
          <Link
            href="/discover"
            className="bg-[#A86472] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#8A505E] active:scale-95 transition-all"
          >
            Discover
          </Link>
        </div>
      </div>

      <div className="px-8 pb-24">
        {matches.length === 0 ? (
          <div className="max-w-md mx-auto">
            {/* Empty state */}
            <div className="bg-white rounded-3xl border border-[#E8D5D0] p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F9F0EE] to-[#F5EAE4] flex items-center justify-center mx-auto mb-6 ring-8 ring-[#F9F0EE]">
                <svg className="w-10 h-10 text-[#C4909A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-semibold text-[#1c1b1b] mb-2">No matches yet</h2>
              <p className="text-sm text-[#7d766f] mb-8 leading-relaxed max-w-xs mx-auto">
                When you and someone both connect with each other, they show up here. Go meet some people.
              </p>
              <Link
                href="/discover"
                className="inline-block bg-[#1c1916] text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-[#2e2b28] active:scale-95 transition-all"
              >
                Start discovering
              </Link>
            </div>

            {/* How matching works */}
            <div className="mt-6 bg-white rounded-2xl border border-[#E8D5D0] p-6">
              <p className="text-[10px] font-mono tracking-widest uppercase text-[#C4909A] mb-4">How matching works</p>
              <div className="space-y-4">
                {[
                  { step: '01', text: 'Complete your profile with your lifestyle and preferences' },
                  { step: '02', text: 'Browse and connect with people in Discover' },
                  { step: '03', text: 'When someone connects back, it becomes a match' },
                  { step: '04', text: 'Chat with your matches and find your ideal roommate' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <span className="font-mono text-xs font-bold text-[#cfc5bd] mt-0.5 shrink-0">{item.step}</span>
                    <p className="text-sm text-[#4c4640] leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Top featured match */}
            <div className="mb-6">
              <p className="text-[10px] font-mono tracking-widest uppercase text-[#7d766f] mb-3">Most recent</p>
              <div className="bg-white rounded-2xl border border-[#E8D5D0] p-1 inline-flex items-center gap-2 mb-4">
                <button className="px-4 py-1.5 rounded-xl bg-[#A86472] text-white text-xs font-semibold">All</button>
                <button className="px-4 py-1.5 text-xs font-medium text-[#7d766f] hover:text-[#1c1b1b] transition-colors">Messaged</button>
                <button className="px-4 py-1.5 text-xs font-medium text-[#7d766f] hover:text-[#1c1b1b] transition-colors">New</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-2xl">
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
          </div>
        )}
      </div>
    </div>
  );
}
