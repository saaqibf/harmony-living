'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#F2E6E0] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#EFE0D8] flex items-center justify-center mb-5">
        <svg className="w-7 h-7 text-[#7d766f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b] mb-2">Something went wrong</h1>
      <p className="text-sm text-[#7d766f] mb-8 max-w-sm">
        {process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred. Please try again.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-lg bg-[#1c1916] text-white text-sm font-semibold hover:bg-[#2e2b28] transition"
        >
          Try again
        </button>
        <a
          href="/dashboard"
          className="px-5 py-2.5 rounded-lg border border-[#cfc5bd] text-sm font-medium text-[#4c4640] hover:bg-[#EFE0D8] transition"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
