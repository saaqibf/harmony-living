'use client';

import Link from 'next/link';

export default function DiscoverError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <p className="text-4xl mb-4">✨</p>
      <h2 className="text-xl font-serif font-semibold text-[#1c1b1b] mb-2">Discovery unavailable</h2>
      <p className="text-sm text-[#7d766f] mb-6 max-w-sm">Something went wrong loading your matches. Try again or come back later.</p>
      <div className="flex gap-3">
        <button onClick={reset} className="px-5 py-2.5 rounded-lg bg-[#1c1916] text-white text-sm font-semibold hover:bg-[#2e2b28] transition">
          Try again
        </button>
        <Link href="/dashboard" className="px-5 py-2.5 rounded-lg border border-[#cfc5bd] text-sm font-medium text-[#4c4640] hover:bg-[#EFE0D8] transition">
          Go home
        </Link>
      </div>
    </div>
  );
}
