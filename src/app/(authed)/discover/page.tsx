import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getDiscoveryQueue, getDailySwipesRemaining } from '@/server/services/discovery';
import { SwipeDeck } from '@/features/discovery/components/SwipeDeck';
import { buttonClasses } from '@/components/ui/button';
import Link from 'next/link';

export default async function DiscoverPage() {
  const auth = await requireUser();

  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { id: true, dailySwipeQuota: true, preferences: { select: { id: true } } },
  });
  if (!user) return null;

  if (!user.preferences) {
    return (
      <div className="min-h-screen bg-[--color-bg] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm px-4">
          <h1 className="text-xl font-bold text-[--color-fg]">Finish your profile first</h1>
          <p className="text-sm text-[--color-muted-fg]">
            Complete onboarding so we can find compatible roommates for you.
          </p>
          <Link href="/onboarding" className={buttonClasses()}>Complete onboarding</Link>
        </div>
      </div>
    );
  }

  const [profiles, swipesRemaining] = await Promise.all([
    getDiscoveryQueue(user.id, 20),
    getDailySwipesRemaining(user.id, user.dailySwipeQuota),
  ]);

  return (
    <div className="min-h-screen bg-[--color-bg]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[--color-fg]">Discover</h1>
          <Link href="/matches" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
            My matches
          </Link>
        </div>
        <SwipeDeck initialProfiles={profiles} swipesRemaining={swipesRemaining} />
      </div>
    </div>
  );
}
