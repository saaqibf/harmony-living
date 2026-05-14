import Link from 'next/link';
import { SidebarLinks } from './SidebarLinks';

type Props = {
  firstName?: string | null;
  photoUrl?: string | null;
};

export function Sidebar({ firstName, photoUrl }: Props) {
  return (
    <div className="fixed left-0 top-0 h-screen w-[240px] bg-[#150B10] flex flex-col px-4 py-6 z-40">
      {/* Logo */}
      <Link href="/dashboard" className="mb-8 block">
        <p className="font-serif text-xl font-semibold text-white leading-tight">
          Harmony<span className="text-[#C4909A]">.</span>Living
        </p>
        <p className="text-xs text-[#C4909A] mt-0.5 font-mono tracking-wide">Domestic Serenity</p>
      </Link>

      {/* Nav */}
      <SidebarLinks />

      <div className="flex-1" />

      {/* Create Listing CTA */}
      <Link
        href="/listings/new"
        className="block w-full text-center py-2.5 rounded-lg bg-[#A86472] text-white text-sm font-semibold hover:bg-[#8A505E] transition-colors mb-4"
      >
        + Create Listing
      </Link>

      {/* User profile */}
      <div className="flex items-center gap-2.5 pt-4 border-t border-[#2A1020]">
        <div className="w-8 h-8 rounded-full bg-[#2A1020] ring-1 ring-[#A86472]/40 overflow-hidden shrink-0 flex items-center justify-center">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-4 h-4 text-[#C4909A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{firstName ?? 'User'}</p>
          <p className="text-xs text-[#C4909A] font-medium">Member</p>
        </div>
      </div>
    </div>
  );
}
