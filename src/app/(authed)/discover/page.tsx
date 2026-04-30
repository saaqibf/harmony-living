import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getDiscoveryQueue, getDailySwipesRemaining } from '@/server/services/discovery';
import { SwipeDeck } from '@/features/discovery/components/SwipeDeck';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🏠</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Finish your profile first</h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Complete onboarding so we can find compatible roommates for you.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center bg-teal-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-teal-700 transition-colors"
          >
            Complete onboarding →
          </Link>
        </div>
      </div>
    );
  }

  const [profiles, swipesRemaining] = await Promise.all([
    getDiscoveryQueue(user.id, 20),
    getDailySwipesRemaining(user.id, user.dailySwipeQuota),
  ]);

  return <SwipeDeck initialProfiles={profiles} swipesRemaining={swipesRemaining} />;
}
