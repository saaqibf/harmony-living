import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import LogoutButton from './_components/logout-button';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default async function DashboardPage() {
  const auth = await requireUser();

  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: {
      id: true,
      profile: { select: { firstName: true, photoUrl: true } },
      _count: {
        select: {
          matchesAsA: { where: { active: true } },
          matchesAsB: { where: { active: true } },
        },
      },
    },
  });

  const firstName = user?.profile?.firstName ?? auth.email?.split('@')[0] ?? 'there';
  const photoUrl = user?.profile?.photoUrl ?? null;
  const matchCount = (user?._count.matchesAsA ?? 0) + (user?._count.matchesAsB ?? 0);

  const unreadParticipants = user
    ? await prisma.conversationParticipant.findMany({
        where: { userId: user.id, archived: false },
        select: { lastReadAt: true, conversation: { select: { lastMessageAt: true } } },
      })
    : [];
  const unreadCount = unreadParticipants.filter(
    (p) => p.conversation.lastMessageAt > p.lastReadAt,
  ).length;

  const ACTIONS = [
    {
      href: '/discover',
      emoji: '✨',
      label: 'Discover',
      desc: 'Find your next roommate',
      color: 'bg-teal-50 text-teal-700 border-teal-100',
    },
    {
      href: '/matches',
      emoji: '💫',
      label: 'Matches',
      desc: matchCount > 0 ? `${matchCount} active match${matchCount !== 1 ? 'es' : ''}` : 'See your connections',
      color: 'bg-purple-50 text-purple-700 border-purple-100',
    },
    {
      href: '/messages',
      emoji: '💬',
      label: 'Messages',
      desc: unreadCount > 0 ? `${unreadCount} unread` : 'Chat with matches',
      color: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    {
      href: '/listings',
      emoji: '🏠',
      label: 'Rooms',
      desc: 'Browse available listings',
      color: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      href: '/listings/my',
      emoji: '📋',
      label: 'My listings',
      desc: 'Manage your rooms',
      color: 'bg-rose-50 text-rose-700 border-rose-100',
    },
    {
      href: '/settings/profile',
      emoji: '👤',
      label: 'Profile',
      desc: 'Edit your details',
      color: 'bg-gray-50 text-gray-700 border-gray-100',
    },
  ] as const;

  return (
    <div className="bg-[--color-bg]">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-4 pt-10 pb-20">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <span className="text-white text-lg font-bold tracking-tight">
            harmony<span className="text-primary-200">.</span>living
          </span>
          <LogoutButton />
        </div>

        <div className="mx-auto max-w-lg mt-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0 overflow-hidden">
            {photoUrl ? (
              <img src={photoUrl} alt={firstName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-xl">👤</span>
            )}
          </div>
          <div>
            <p className="text-primary-100 text-sm">{greeting()},</p>
            <h1 className="text-white text-2xl font-bold">{firstName}!</h1>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="mx-auto max-w-lg px-4 -mt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex divide-x divide-gray-100">
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-[--color-fg]">{matchCount}</p>
            <p className="text-xs text-[--color-muted-fg] mt-0.5">Matches</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-[--color-fg]">{unreadCount}</p>
            <p className="text-xs text-[--color-muted-fg] mt-0.5">Unread</p>
          </div>
          <div className="flex-1 text-center">
            <Link href="/discover" className="block">
              <p className="text-2xl font-bold text-primary-600">→</p>
              <p className="text-xs text-[--color-muted-fg] mt-0.5">Discover</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Action grid */}
      <div className="mx-auto max-w-lg px-4 mt-6 pb-8">
        <h2 className="text-sm font-semibold text-[--color-muted-fg] uppercase tracking-wide mb-3">Quick access</h2>
        <div className="grid grid-cols-2 gap-3">
          {ACTIONS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-2xl border p-4 flex flex-col gap-2 transition-transform active:scale-95 ${item.color}`}
            >
              <span className="text-2xl">{item.emoji}</span>
              <div>
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs opacity-70 mt-0.5">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
