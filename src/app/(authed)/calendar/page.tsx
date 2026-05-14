import Link from 'next/link';
import { requireDbUser } from '@/lib/auth/session';

export default async function CalendarPage() {
  await requireDbUser();

  return (
    <div className="bg-[#F2E6E0] min-h-screen">
      <div className="bg-white border-b border-[#cfc5bd] px-6 pt-8 pb-5">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">Tours &amp; calls</h1>
            <p className="text-sm text-[#7d766f] mt-0.5">Scheduled in-person visits and video calls</p>
          </div>
          <Link
            href="/messages"
            className="bg-[#A86472] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#8A505E] active:scale-95 transition-all"
          >
            + Schedule new
          </Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-16 pb-24 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-[#F5EAE4] flex items-center justify-center mb-5">
          <svg className="w-9 h-9 text-[#4c4640]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
          </svg>
        </div>
        <h2 className="text-xl font-serif font-semibold text-[#1c1b1b] mb-2">No tours scheduled yet</h2>
        <p className="text-sm text-[#7d766f] mb-2 max-w-xs leading-relaxed">
          When you&apos;re ready to meet someone, suggest a time in your chat.
        </p>
        <p className="text-xs text-[#7d766f] mb-8 max-w-xs leading-relaxed">
          Confirmed tours and calls will appear here so you never lose track of plans.
        </p>
        <Link
          href="/messages"
          className="bg-[#1c1916] text-white font-semibold text-sm px-8 py-3 rounded-xl hover:bg-[#2e2b28] active:scale-95 transition-all"
        >
          Go to messages →
        </Link>
      </div>
    </div>
  );
}
