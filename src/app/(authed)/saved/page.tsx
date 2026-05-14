import Link from 'next/link';
import { requireDbUser } from '@/lib/auth/session';

export default async function SavedPage() {
  await requireDbUser();

  return (
    <div className="min-h-screen bg-[#F2E6E0]">
      {/* Header */}
      <div className="px-8 pt-10 pb-8">
        <p className="text-[10px] font-mono tracking-widest uppercase text-[#A86472] mb-2">Your shortlist</p>
        <h1 className="text-4xl font-serif font-semibold text-[#1c1b1b] leading-tight mb-1">Saved</h1>
        <p className="text-sm text-[#7d766f]">Rooms and people you want to revisit. Private to you.</p>
      </div>

      {/* Tabs */}
      <div className="px-8">
        <div className="flex gap-1 bg-white rounded-xl border border-[#E8D5D0] p-1 w-fit mb-8">
          <button className="px-5 py-2 text-sm font-semibold text-white bg-[#A86472] rounded-lg transition-colors">
            Rooms
          </button>
          <button className="px-5 py-2 text-sm font-medium text-[#7d766f] hover:text-[#1c1b1b] rounded-lg transition-colors">
            People
          </button>
        </div>
      </div>

      {/* Empty state */}
      <div className="px-8 pb-24 max-w-xl">
        <div className="bg-white rounded-3xl border border-[#E8D5D0] overflow-hidden">
          {/* Decorative top stripe */}
          <div className="h-2 bg-gradient-to-r from-[#A86472] via-[#C4909A] to-[#C4A070]" />

          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F9F0EE] flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-[#A86472]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </div>

            <h2 className="text-2xl font-serif font-semibold text-[#1c1b1b] mb-2">Nothing saved yet</h2>
            <p className="text-sm text-[#7d766f] mb-8 leading-relaxed max-w-xs mx-auto">
              Tap the bookmark on any listing to save it here. Your shortlist is yours alone.
            </p>

            <Link
              href="/listings"
              className="inline-block bg-[#A86472] text-white font-semibold text-sm px-7 py-3 rounded-xl hover:bg-[#8A505E] active:scale-95 transition-all"
            >
              Browse listings
            </Link>
          </div>
        </div>

        {/* Tip card */}
        <div className="mt-4 bg-white rounded-2xl border border-[#E8D5D0] px-5 py-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F5E6D0] flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-[#C4A070]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#1c1b1b] mb-0.5">Pro tip</p>
            <p className="text-xs text-[#7d766f] leading-relaxed">
              Save rooms as you browse to compare them later. You can also save profiles of people you want to reconnect with.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
