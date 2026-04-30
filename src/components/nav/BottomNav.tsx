'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/discover', label: 'Discover', icon: '✨' },
  { href: '/matches', label: 'Matches', icon: '💫' },
  { href: '/messages', label: 'Messages', icon: '💬' },
  { href: '/settings', label: 'Profile', icon: '👤' },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  // hide on the individual conversation view (full-screen chat)
  if (pathname.match(/^\/messages\/.+/)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {NAV.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors text-xs ${
                active ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className={`text-xl leading-none transition-transform ${active ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className={`font-medium ${active ? 'text-primary-600' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
