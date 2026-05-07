import { requireDbUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getDiscoveryQueue, getDailySwipesRemaining } from '@/server/services/discovery';
import { SwipeDeck } from '@/features/discovery/components/SwipeDeck';
import Link from 'next/link';

export default async function DiscoverPage() {
  const { userId } = await requireDbUser();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dailySwipeQuota: true, preferences: { select: { id: true } } },
  });
  if (!user) return null;

  if (!user.preferences) {
    return (
      <div className="min-h-screen bg-[#fdf8f7] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-[#f7f3f1] rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🏠</span>
          </div>
          <h1 className="text-xl font-serif font-semibold text-[#1c1b1b] mb-2">Finish your profile first</h1>
          <p className="text-sm text-[#7d766f] mb-6 leading-relaxed">
            Complete onboarding so we can find compatible roommates for you.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center bg-[#1c1916] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#2e2b28] transition-colors text-sm"
          >
            Complete onboarding →
          </Link>
        </div>
      </div>
    );
  }

  const [profiles, swipesRemaining] = await Promise.all([
    getDiscoveryQueue(userId, 20),
    getDailySwipesRemaining(userId, user.dailySwipeQuota),
  ]);

  return <SwipeDeck initialProfiles={profiles} swipesRemaining={swipesRemaining} />;
}
