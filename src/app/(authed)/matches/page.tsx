import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getMyMatches } from '@/server/services/discovery';
import { MatchCard } from '@/features/discovery/components/MatchCard';
import { buttonClasses } from '@/components/ui/button';
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
    <div className="min-h-screen bg-[--color-bg]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[--color-fg]">Matches</h1>
          <Link href="/discover" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
            Keep swiping
          </Link>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <p className="text-lg font-semibold text-[--color-fg]">No matches yet</p>
            <p className="text-sm text-[--color-muted-fg]">
              When you and someone both connect, they&apos;ll appear here.
            </p>
            <Link href="/discover" className={buttonClasses()}>Start discovering</Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[--color-muted-fg]">{matches.length} mutual match{matches.length !== 1 ? 'es' : ''}</p>
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
