'use client';

export default function MessagesError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <p className="text-4xl mb-4">💬</p>
      <h2 className="text-xl font-serif font-semibold text-[#1c1b1b] mb-2">Messages unavailable</h2>
      <p className="text-sm text-[#7d766f] mb-6">Something went wrong. Your messages are safe.</p>
      <button onClick={reset} className="px-5 py-2.5 rounded-lg bg-[#7B2D5C] text-white text-sm font-semibold hover:bg-[#5A1F43] transition">
        Try again
      </button>
    </div>
  );
}
