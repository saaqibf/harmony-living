import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getMyMatches } from '@/server/services/discovery';
import { MatchCard } from '@/features/discovery/components/MatchCard';
import Link from 'next/link';

export default async function MatchesPage() {
  const auth = await requireUser();

  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { id: true },
  });
  if (!user) return null;

  const matches = await getMyMatches(user.id);

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="px-5 pt-10 pb-5 border-b border-gray-100">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
            {matches.length > 0 && (
              <p className="text-sm text-gray-400 mt-0.5">
                {matches.length} mutual connection{matches.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <Link
            href="/discover"
            className="bg-teal-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-teal-700 active:scale-95 transition-all shadow-sm"
          >
            Discover
          </Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-10">
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6">
              <span className="text-5xl">💫</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No matches yet</h2>
            <p className="text-sm text-gray-400 mb-8 max-w-xs leading-relaxed">
              When you and someone both connect, they&apos;ll appear here. Start discovering!
            </p>
            <Link
              href="/discover"
              className="bg-teal-600 text-white font-semibold px-8 py-3.5 rounded-2xl hover:bg-teal-700 active:scale-95 transition-all shadow-md shadow-teal-600/20"
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
