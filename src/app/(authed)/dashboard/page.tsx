import Link from 'next/link';
import { requireDbUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { calcAge } from '@/lib/dates';
import LogoutButton from './_components/logout-button';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default async function DashboardPage() {
  const { userId } = await requireDbUser();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      emailVerified: true,
      profile: { select: { firstName: true, photoUrl: true } },
      _count: {
        select: {
          matchesAsA: { where: { active: true } },
          matchesAsB: { where: { active: true } },
        },
      },
    },
  });

  const firstName = user?.profile?.firstName ?? 'there';
  const matchCount = (user?._count.matchesAsA ?? 0) + (user?._count.matchesAsB ?? 0);

  const unreadCount = user
    ? (await prisma.conversationParticipant.findMany({
        where: { userId: user.id, archived: false },
        select: { lastReadAt: true, conversation: { select: { lastMessageAt: true } } },
      })).filter((p) => p.conversation.lastMessageAt > p.lastReadAt).length
    : 0;

  const picks = user
    ? await prisma.compatibilityScore.findMany({
        where: {
          OR: [{ userAId: user.id }, { userBId: user.id }],
          passesHardFilters: true,
        },
        orderBy: { score: 'desc' },
        take: 3,
        select: {
          score: true,
          userA: { select: { id: true, profile: { select: { firstName: true, photoUrl: true, dateOfBirth: true, city: true, occupation: true } } } },
          userB: { select: { id: true, profile: { select: { firstName: true, photoUrl: true, dateOfBirth: true, city: true, occupation: true } } } },
        },
      })
    : [];

  const dailyPicks = picks.map((p) => {
    const other = p.userA.id === user?.id ? p.userB : p.userA;
    return { ...other.profile, score: p.score, userId: other.id };
  }).filter((p) => p.firstName);

  const recentMessages = user
    ? await prisma.message.findMany({
        where: {
          conversation: {
            participants: { some: { userId: user.id } },
          },
          senderId: { not: user.id },
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          body: true,
          createdAt: true,
          sender: { select: { profile: { select: { firstName: true, photoUrl: true } } } },
        },
      })
    : [];

  const profileComplete = [
    user?.profile?.photoUrl,
    user?.profile?.firstName,
    user?.emailVerified,
  ].filter(Boolean).length;
  const strengthPct = Math.round((profileComplete / 3) * 100);

  return (
    <div className="p-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-[#1c1b1b] border-b-2 border-[#c96d4d] pb-1">Overview</span>
          <span className="text-sm text-[#7d766f]">Analytics</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search matches..."
              className="w-48 text-sm bg-white border border-[#cfc5bd] rounded-lg px-3 py-2 text-[#1c1b1b] placeholder:text-[#7d766f] focus:outline-none focus:border-[#2d4a3e] transition-colors"
            />
          </div>
          <Link href="/messages" className="p-2 rounded-lg hover:bg-[#cfc5bd]/60 transition-colors text-[#4c4640]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </Link>
          <Link href="/settings" className="p-2 rounded-lg hover:bg-[#cfc5bd]/60 transition-colors text-[#4c4640]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* Main 2-col layout */}
      <div className="flex gap-6">
        {/* Left: main content */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-serif font-semibold text-[#1c1b1b] mb-1">
            {greeting()}, {firstName}.
          </h1>
          <p className="text-sm text-[#7d766f] mb-8">
            {matchCount > 0
              ? `You have ${matchCount} roommate match${matchCount !== 1 ? 'es' : ''} waiting for you.`
              : 'Start discovering your perfect roommate match.'}
          </p>

          {/* Daily Picks */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#1c1b1b]">Your Daily Picks</h2>
            <Link href="/discover" className="text-sm text-[#A86472] hover:text-[#8A505E] font-medium transition-colors">
              View all →
            </Link>
          </div>

          {dailyPicks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#cfc5bd] p-10 text-center">
              <p className="text-3xl mb-3">✨</p>
              <p className="font-semibold text-[#1c1b1b] mb-1">No picks yet</p>
              <p className="text-sm text-[#7d766f] mb-4">Complete your profile to start getting matches.</p>
              <Link
                href="/discover"
                className="inline-block px-5 py-2.5 bg-[#A86472] text-white text-sm font-semibold rounded-lg hover:bg-[#8A505E] transition-colors"
              >
                Start discovering
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {dailyPicks.map((pick) => (
                <div key={pick.userId} className="bg-white rounded-2xl border border-[#cfc5bd] flex overflow-hidden hover:shadow-sm transition-shadow">
                  {/* Photo */}
                  <div className="w-40 h-40 shrink-0 bg-[#EFE0D8] relative">
                    {pick.photoUrl ? (
                      <img src={pick.photoUrl} alt={pick.firstName ?? ''} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-semibold text-[#1c1b1b]">
                          {pick.firstName}{pick.dateOfBirth ? `, ${calcAge(pick.dateOfBirth)}` : ''}
                        </p>
                        <span className="font-mono text-xs font-semibold text-[#A86472] bg-[#F9F0EE] border border-[#E8D5D0] rounded-full px-2.5 py-1">
                          MATCH {pick.score}%
                        </span>
                      </div>
                      {(pick.city || pick.occupation) && (
                        <p className="text-sm text-[#7d766f] mb-3">
                          {pick.occupation && <span>{pick.occupation}</span>}
                          {pick.occupation && pick.city && <span> · </span>}
                          {pick.city && <span>{pick.city}</span>}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/browse/${pick.userId}`}
                        className="px-4 py-2 bg-[#A86472] text-white text-sm font-semibold rounded-lg hover:bg-[#8A505E] transition-colors"
                      >
                        View Profile
                      </Link>
                      <button className="p-2 rounded-lg border border-[#cfc5bd] text-[#7d766f] hover:text-[#A86472] hover:border-[#A86472] transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: widgets */}
        <div className="w-64 shrink-0 space-y-4">
          {/* Profile Strength */}
          <div className="bg-white rounded-2xl border border-[#cfc5bd] p-5">
            <h3 className="text-sm font-semibold text-[#1c1b1b] mb-3">Profile Strength</h3>
            <div className="w-full bg-[#EFE0D8] rounded-full h-2 mb-2">
              <div
                className="bg-[#A86472] h-2 rounded-full transition-all"
                style={{ width: `${strengthPct}%` }}
              />
            </div>
            <p className="text-xs text-[#7d766f] mb-4">
              Your profile is {strengthPct}% complete. Verified profiles get 3× more matches.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs">
                {user?.emailVerified ? (
                  <span className="text-[#2d4a3e]">✓</span>
                ) : (
                  <span className="text-[#cfc5bd]">○</span>
                )}
                <span className={user?.emailVerified ? 'text-[#7d766f] line-through' : 'text-[#1c1b1b]'}>
                  Email verified
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {user?.profile?.photoUrl ? (
                  <span className="text-[#2d4a3e]">✓</span>
                ) : (
                  <span className="text-[#cfc5bd]">○</span>
                )}
                <Link
                  href="/settings/profile"
                  className={user?.profile?.photoUrl ? 'text-[#7d766f] line-through' : 'text-[#c96d4d] hover:underline'}
                >
                  Upload profile photo
                </Link>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#cfc5bd]">○</span>
                <Link href="/settings/verify" className="text-[#c96d4d] hover:underline">
                  Upload Government ID
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-[#cfc5bd] p-5">
            <h3 className="text-sm font-semibold text-[#1c1b1b] mb-3">Recent Activity</h3>
            {recentMessages.length === 0 ? (
              <p className="text-xs text-[#7d766f]">No recent activity. Start connecting!</p>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#EFE0D8] shrink-0 overflow-hidden mt-0.5 flex items-center justify-center">
                      {msg.sender.profile?.photoUrl ? (
                        <img src={msg.sender.profile.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs">💬</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#1c1b1b]">
                        New message from{' '}
                        <span className="text-[#A86472]">{msg.sender.profile?.firstName ?? 'Someone'}</span>
                      </p>
                      <p className="text-xs text-[#7d766f] truncate mt-0.5">"{msg.body}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {unreadCount > 0 && (
              <Link href="/messages" className="mt-4 block text-xs text-[#A86472] hover:underline font-medium">
                View all activity →
              </Link>
            )}
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-2xl border border-[#cfc5bd] p-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="font-mono text-2xl font-bold text-[#1c1b1b]">{matchCount}</p>
                <p className="text-xs text-[#7d766f] mt-0.5">Matches</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-2xl font-bold text-[#1c1b1b]">{unreadCount}</p>
                <p className="text-xs text-[#7d766f] mt-0.5">Unread</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
