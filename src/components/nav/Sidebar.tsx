import Link from 'next/link';
import { SidebarLinks } from './SidebarLinks';

type Props = {
  firstName?: string | null;
  photoUrl?: string | null;
};

export function Sidebar({ firstName, photoUrl }: Props) {
  return (
    <div className="fixed left-0 top-0 h-screen w-[240px] bg-[#A86472] flex flex-col px-4 py-6 z-40">
      {/* Logo */}
      <Link href="/dashboard" className="mb-8 block">
        <p className="font-serif text-xl font-semibold text-white leading-tight">
          Harmony Living
        </p>
      </Link>

      {/* Nav */}
      <SidebarLinks />

      <div className="flex-1" />

      {/* Create Listing CTA */}
      <Link
        href="/listings/new"
        className="block w-full text-center py-2.5 rounded-lg bg-[#C4A070] text-white text-sm font-semibold hover:bg-[#A8865C] transition-colors mb-4"
      >
        + Create Listing
      </Link>

      {/* User profile — links to settings */}
      <Link
        href="/settings/profile"
        className="flex items-center gap-2.5 pt-4 border-t border-white/20 hover:opacity-75 transition-opacity"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 ring-1 ring-white/30 overflow-hidden shrink-0 flex items-center justify-center">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{firstName ?? 'User'}</p>
          <p className="text-xs text-white/55 font-medium">Member</p>
        </div>
      </Link>
    </div>
  );
}
