import Link from 'next/link';
import { requireDbUser } from '@/lib/auth/session';

const NOTIFICATIONS = {
  today: [
    {
      id: 'n1',
      type: 'like',
      icon: '♥',
      iconBg: '#F9F0EE',
      iconColor: '#A86472',
      message: 'Layla M. liked your profile',
      sub: 'Calgary, NW · 91% match',
      time: '2 min ago',
      href: '/discover',
    },
    {
      id: 'n2',
      type: 'match',
      icon: '✦',
      iconBg: '#edf4f1',
      iconColor: '#2d4a3e',
      message: 'You matched with Priya K.',
      sub: 'You can now message each other',
      time: '1 hr ago',
      href: '/matches',
    },
  ],
  yesterday: [
    {
      id: 'n3',
      type: 'message',
      icon: '◎',
      iconBg: '#F5EAE4',
      iconColor: '#c96d4d',
      message: 'Hana sent you a message',
      sub: '"Hey! I saw your profile and I think we\'d be great roommates…"',
      time: 'Yesterday, 6:42 pm',
      href: '/messages',
    },
    {
      id: 'n4',
      type: 'listing',
      icon: '⌂',
      iconBg: '#F5EAE4',
      iconColor: '#4c4640',
      message: 'New listing in Beltline matches your budget',
      sub: '$950/mo · Available July 1',
      time: 'Yesterday, 11:00 am',
      href: '/listings',
    },
  ],
  thisWeek: [
    {
      id: 'n5',
      type: 'reference',
      icon: '✓',
      iconBg: '#edf4f1',
      iconColor: '#2d4a3e',
      message: 'Sara M. left you a reference',
      sub: '"Incredibly tidy, respectful, and communicative…"',
      time: 'Mon, 3:15 pm',
      href: '/references',
    },
    {
      id: 'n6',
      type: 'like',
      icon: '♥',
      iconBg: '#F9F0EE',
      iconColor: '#A86472',
      message: 'Noor R. liked your profile',
      sub: 'Calgary, SW · 88% match',
      time: 'Sun, 9:00 am',
      href: '/discover',
    },
  ],
};

export default async function NotificationsPage() {
  await requireDbUser();

  return (
    <div className="bg-[#F2E6E0] min-h-screen">
      <div className="bg-white border-b border-[#cfc5bd] px-6 pt-8 pb-5">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">Notifications</h1>
            <p className="text-sm text-[#7d766f] mt-0.5">4 unread</p>
          </div>
          <button className="text-sm font-medium text-[#A86472] hover:text-[#8A505E] transition-colors">
            Mark all read
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Today */}
        <div>
          <p className="text-[10px] font-mono tracking-widest uppercase text-[#C4909A] px-1 mb-2">Today</p>
          <div className="space-y-2">
            {NOTIFICATIONS.today.map((n) => (
              <div key={n.id} className="bg-white rounded-2xl border border-[#cfc5bd] p-4 flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-base"
                  style={{ background: n.iconBg, color: n.iconColor }}
                >
                  {n.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1c1b1b]">{n.message}</p>
                  <p className="text-xs text-[#7d766f] mt-0.5 truncate">{n.sub}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="text-[10px] text-[#7d766f] font-mono whitespace-nowrap">{n.time}</p>
                  <Link
                    href={n.href}
                    className="text-xs font-semibold text-[#A86472] hover:text-[#8A505E] transition-colors"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Yesterday */}
        <div>
          <p className="text-[10px] font-mono tracking-widest uppercase text-[#C4909A] px-1 mb-2">Yesterday</p>
          <div className="space-y-2">
            {NOTIFICATIONS.yesterday.map((n) => (
              <div key={n.id} className="bg-white rounded-2xl border border-[#cfc5bd] p-4 flex items-center gap-4 opacity-90">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-base"
                  style={{ background: n.iconBg, color: n.iconColor }}
                >
                  {n.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1c1b1b]">{n.message}</p>
                  <p className="text-xs text-[#7d766f] mt-0.5 truncate">{n.sub}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="text-[10px] text-[#7d766f] font-mono whitespace-nowrap">{n.time}</p>
                  <Link
                    href={n.href}
                    className="text-xs font-semibold text-[#A86472] hover:text-[#8A505E] transition-colors"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* This week */}
        <div>
          <p className="text-[10px] font-mono tracking-widest uppercase text-[#C4909A] px-1 mb-2">This week</p>
          <div className="space-y-2">
            {NOTIFICATIONS.thisWeek.map((n) => (
              <div key={n.id} className="bg-white rounded-2xl border border-[#cfc5bd] p-4 flex items-center gap-4 opacity-80">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-base"
                  style={{ background: n.iconBg, color: n.iconColor }}
                >
                  {n.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1c1b1b]">{n.message}</p>
                  <p className="text-xs text-[#7d766f] mt-0.5 truncate">{n.sub}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="text-[10px] text-[#7d766f] font-mono whitespace-nowrap">{n.time}</p>
                  <Link
                    href={n.href}
                    className="text-xs font-semibold text-[#A86472] hover:text-[#8A505E] transition-colors"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
