import Link from 'next/link';
import { SidebarLinks } from './SidebarLinks';

type Props = {
  firstName?: string | null;
  photoUrl?: string | null;
};

export function Sidebar({ firstName, photoUrl }: Props) {
  return (
    <div className="fixed left-0 top-0 h-screen w-[240px] bg-[#f1edec] border-r border-[#cfc5bd] flex flex-col px-4 py-6 z-40">
      {/* Logo */}
      <Link href="/dashboard" className="mb-8 block">
        <p className="font-serif text-xl font-semibold text-[#1c1b1b] leading-tight">Harmony Living</p>
        <p className="text-xs text-[#7d766f] mt-0.5 font-mono tracking-wide">Domestic Serenity</p>
      </Link>

      {/* Nav */}
      <SidebarLinks />

      <div className="flex-1" />

      {/* Create Listing CTA */}
      <Link
        href="/listings/new"
        className="block w-full text-center py-2.5 rounded-lg bg-[#1c1916] text-white text-sm font-semibold hover:bg-[#2e2b28] transition-colors mb-4"
      >
        + Create Listing
      </Link>

      {/* User profile */}
      <div className="flex items-center gap-2.5 pt-4 border-t border-[#cfc5bd]">
        <div className="w-8 h-8 rounded-full bg-[#e6e1e0] overflow-hidden shrink-0 flex items-center justify-center">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-4 h-4 text-[#7d766f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#1c1b1b] truncate">{firstName ?? 'User'}</p>
          <p className="text-xs text-[#2d4a3e] font-medium">Member</p>
        </div>
      </div>
    </div>
  );
}
