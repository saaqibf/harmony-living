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
        take: 4,
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
        take: 4,
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

  const [topPick, ...restPicks] = dailyPicks;

  return (
    <div className="p-8 min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-end gap-3 mb-10">
        {unreadCount > 0 && (
          <Link href="/messages" className="relative p-2 rounded-lg hover:bg-white/60 transition-colors text-[#4c4640]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#A86472]" />
          </Link>
        )}
        <LogoutButton />
      </div>

      {/* Greeting */}
      <div className="mb-10">
        <h1 className="text-5xl font-serif font-semibold text-[#1c1b1b] leading-tight mb-2">
          {greeting()}, {firstName}.
        </h1>
        <p className="text-base text-[#7d766f]">
          {matchCount > 0
            ? `You have ${matchCount} mutual match${matchCount !== 1 ? 'es' : ''}. Keep the momentum going.`
            : 'Complete your profile to start getting matched with compatible roommates.'}
        </p>
      </div>

      {/* Main 2-col layout */}
      <div className="flex gap-6 items-start">
        {/* Left: main content */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Featured top pick */}
          {topPick ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-mono tracking-widest uppercase text-[#A86472]">Your top match today</h2>
                <Link href="/discover" className="text-xs text-[#7d766f] hover:text-[#A86472] transition-colors">
                  View all →
                </Link>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden flex shadow-sm border border-[#E8D5D0]">
                <div className="w-52 h-52 shrink-0 bg-[#EFE0D8] relative">
                  {topPick.photoUrl ? (
                    <img src={topPick.photoUrl} alt={topPick.firstName ?? ''} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-[#C4909A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-2xl font-serif font-semibold text-[#1c1b1b]">
                        {topPick.firstName}{topPick.dateOfBirth ? `, ${calcAge(topPick.dateOfBirth)}` : ''}
                      </h3>
                      <span className="font-mono text-sm font-bold text-[#A86472] bg-[#F9F0EE] border border-[#E8D5D0] rounded-full px-3 py-1">
                        {topPick.score}% match
                      </span>
                    </div>
                    {(topPick.city || topPick.occupation) && (
                      <p className="text-sm text-[#7d766f]">
                        {topPick.occupation && <span>{topPick.occupation}</span>}
                        {topPick.occupation && topPick.city && <span> · </span>}
                        {topPick.city && <span>{topPick.city}</span>}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/messages"
                      className="px-5 py-2.5 bg-[#C4A070] text-white text-sm font-semibold rounded-lg hover:bg-[#A8865C] transition-colors"
                    >
                      Send message
                    </Link>
                    <Link
                      href={`/browse/${topPick.userId}`}
                      className="px-5 py-2.5 border border-[#cfc5bd] text-[#1c1b1b] text-sm font-semibold rounded-lg hover:border-[#A86472] hover:text-[#A86472] transition-colors"
                    >
                      View profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-mono tracking-widest uppercase text-[#A86472]">Your top match today</h2>
              </div>
              <div className="bg-white rounded-2xl border border-[#E8D5D0] p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-[#F5EAE4] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#C4909A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <p className="font-serif text-lg font-semibold text-[#1c1b1b] mb-1">No picks yet</p>
                <p className="text-sm text-[#7d766f] mb-5">Complete your profile to start getting matched.</p>
                <Link
                  href="/discover"
                  className="inline-block px-6 py-2.5 bg-[#A86472] text-white text-sm font-semibold rounded-lg hover:bg-[#8A505E] transition-colors"
                >
                  Start discovering
                </Link>
              </div>
            </div>
          )}

          {/* More picks */}
          {restPicks.length > 0 && (
            <div>
              <h2 className="text-xs font-mono tracking-widest uppercase text-[#7d766f] mb-3">More picks for you</h2>
              <div className="grid grid-cols-3 gap-3">
                {restPicks.map((pick) => (
                  <Link
                    key={pick.userId}
                    href={`/browse/${pick.userId}`}
                    className="bg-white rounded-xl border border-[#E8D5D0] overflow-hidden hover:shadow-sm transition-shadow group"
                  >
                    <div className="h-28 bg-[#EFE0D8] relative">
                      {pick.photoUrl ? (
                        <img src={pick.photoUrl} alt={pick.firstName ?? ''} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-10 h-10 text-[#C4909A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </div>
                      )}
                      <span className="absolute top-2 right-2 font-mono text-[10px] font-bold text-[#A86472] bg-white/90 rounded-full px-1.5 py-0.5">
                        {pick.score}%
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-[#1c1b1b] truncate">
                        {pick.firstName}{pick.dateOfBirth ? `, ${calcAge(pick.dateOfBirth)}` : ''}
                      </p>
                      {pick.city && <p className="text-xs text-[#7d766f] truncate">{pick.city}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-[#E8D5D0] p-4 text-center">
              <p className="font-serif text-3xl font-semibold text-[#1c1b1b]">{matchCount}</p>
              <p className="text-xs text-[#7d766f] mt-1 font-mono tracking-wide uppercase">Matches</p>
            </div>
            <div className="bg-white rounded-xl border border-[#E8D5D0] p-4 text-center">
              <p className="font-serif text-3xl font-semibold text-[#1c1b1b]">{unreadCount}</p>
              <p className="text-xs text-[#7d766f] mt-1 font-mono tracking-wide uppercase">Unread</p>
            </div>
            <div className="bg-white rounded-xl border border-[#E8D5D0] p-4 text-center">
              <p className="font-serif text-3xl font-semibold text-[#1c1b1b]">{strengthPct}%</p>
              <p className="text-xs text-[#7d766f] mt-1 font-mono tracking-wide uppercase">Profile</p>
            </div>
          </div>
        </div>

        {/* Right: sidebar widgets */}
        <div className="w-64 shrink-0 space-y-4">
          {/* Profile Strength */}
          <div className="bg-white rounded-2xl border border-[#E8D5D0] p-5">
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#C4909A] mb-3">Profile strength</p>
            <div className="w-full bg-[#EFE0D8] rounded-full h-1.5 mb-3">
              <div
                className="bg-[#A86472] h-1.5 rounded-full transition-all"
                style={{ width: `${strengthPct}%` }}
              />
            </div>
            <p className="text-xs text-[#7d766f] mb-4 leading-relaxed">
              {strengthPct < 100
                ? 'Verified profiles get 3x more matches.'
                : 'Your profile is fully verified.'}
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs">
                <span className={user?.emailVerified ? 'text-[#2d4a3e]' : 'text-[#cfc5bd]'}>
                  {user?.emailVerified ? '✓' : '○'}
                </span>
                <span className={user?.emailVerified ? 'text-[#7d766f] line-through' : 'text-[#1c1b1b]'}>
                  Email verified
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <span className={user?.profile?.photoUrl ? 'text-[#2d4a3e]' : 'text-[#cfc5bd]'}>
                  {user?.profile?.photoUrl ? '✓' : '○'}
                </span>
                <Link
                  href="/settings/profile"
                  className={user?.profile?.photoUrl ? 'text-[#7d766f] line-through' : 'text-[#A86472] hover:underline'}
                >
                  Upload photo
                </Link>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <span className="text-[#cfc5bd]">○</span>
                <Link href="/settings/verify" className="text-[#A86472] hover:underline">
                  Verify ID
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-2xl border border-[#E8D5D0] p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-mono tracking-widest uppercase text-[#C4909A]">Recent chats</p>
              {recentMessages.length > 0 && (
                <Link href="/messages" className="text-[10px] text-[#7d766f] hover:text-[#A86472] transition-colors">
                  View all
                </Link>
              )}
            </div>
            {recentMessages.length === 0 ? (
              <p className="text-xs text-[#7d766f] leading-relaxed">No messages yet. Start a conversation with a match.</p>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#EFE0D8] shrink-0 overflow-hidden flex items-center justify-center">
                      {msg.sender.profile?.photoUrl ? (
                        <img src={msg.sender.profile.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-4 h-4 text-[#C4909A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#1c1b1b]">
                        {msg.sender.profile?.firstName ?? 'Someone'}
                      </p>
                      <p className="text-xs text-[#7d766f] truncate">{msg.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-[#E8D5D0] p-5">
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#C4909A] mb-3">Quick actions</p>
            <div className="space-y-2">
              <Link
                href="/discover"
                className="flex items-center gap-2.5 text-sm text-[#1c1b1b] hover:text-[#A86472] transition-colors py-1"
              >
                <svg className="w-4 h-4 text-[#C4909A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
                Discover people
              </Link>
              <Link
                href="/listings"
                className="flex items-center gap-2.5 text-sm text-[#1c1b1b] hover:text-[#A86472] transition-colors py-1"
              >
                <svg className="w-4 h-4 text-[#C4909A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                Browse listings
              </Link>
              <Link
                href="/settings/profile"
                className="flex items-center gap-2.5 text-sm text-[#1c1b1b] hover:text-[#A86472] transition-colors py-1"
              >
                <svg className="w-4 h-4 text-[#C4909A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Edit profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
