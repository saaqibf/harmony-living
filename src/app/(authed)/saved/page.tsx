import Link from 'next/link';
import { requireDbUser } from '@/lib/auth/session';

export default async function SavedPage() {
  await requireDbUser();

  return (
    <div className="bg-[#F2E6E0] min-h-screen">
      <div className="bg-white border-b border-[#cfc5bd] px-6 pt-8 pb-5">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">Saved</h1>
          <p className="text-sm text-[#7d766f] mt-0.5">Rooms and people you&apos;ve bookmarked</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-[#cfc5bd] px-6">
        <div className="max-w-lg mx-auto flex gap-6">
          <button className="py-3 text-sm font-semibold text-[#1c1b1b] border-b-2 border-[#A86472]">
            Rooms
          </button>
          <button className="py-3 text-sm font-medium text-[#7d766f] hover:text-[#1c1b1b] border-b-2 border-transparent transition-colors">
            People
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-16 pb-24 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-[#F9F0EE] flex items-center justify-center mb-5">
          <svg className="w-9 h-9 text-[#A86472]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-serif font-semibold text-[#1c1b1b] mb-2">No saved rooms yet</h2>
        <p className="text-sm text-[#7d766f] mb-8 max-w-xs leading-relaxed">
          Tap the bookmark icon on any listing to save it here. Your shortlist is private and only visible to you.
        </p>
        <Link
          href="/listings"
          className="bg-[#A86472] text-white font-semibold text-sm px-8 py-3 rounded-xl hover:bg-[#8A505E] active:scale-95 transition-all"
        >
          Browse listings
        </Link>
      </div>
    </div>
  );
}
