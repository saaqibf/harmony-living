'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ProfileCard } from './ProfileCard';
import { swipeAction, type SwipeActionResult } from '@/features/discovery/lib/actions';
import type { DiscoveryProfile } from '@/server/services/discovery';

type Props = {
  initialProfiles: DiscoveryProfile[];
  swipesRemaining: number;
};

export function SwipeDeck({ initialProfiles, swipesRemaining }: Props) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [remaining, setRemaining] = useState(swipesRemaining);
  const [matchBanner, setMatchBanner] = useState<{ firstName: string; conversationId?: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const current = profiles[0];

  const swipe = useCallback(
    (direction: 'CONNECT' | 'PASS') => {
      if (!current || isPending || remaining <= 0) return;
      setError(null);

      startTransition(async () => {
        const result: SwipeActionResult = await swipeAction(current.userId, direction);

        if (!result.ok) {
          if (result.code === 'QUOTA_EXCEEDED') setRemaining(0);
          else setError(result.error);
          return;
        }

        setRemaining((r) => Math.max(0, r - 1));

        if (result.matched) {
          setMatchBanner({ firstName: current.firstName, conversationId: result.conversationId });
        }

        setProfiles((prev) => prev.slice(1));
      });
    },
    [current, isPending, remaining],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') swipe('PASS');
      if (e.key === 'ArrowRight') swipe('CONNECT');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [swipe]);

  // Match celebration screen
  if (matchBanner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-8xl mb-6">🎉</div>
        <h2 className="text-4xl font-bold text-white mb-3">It&apos;s a match!</h2>
        <p className="text-teal-100 text-lg mb-10 max-w-xs">
          You and <strong>{matchBanner.firstName}</strong> both connected. Start a conversation!
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {matchBanner.conversationId && (
            <Link
              href={`/messages/${matchBanner.conversationId}`}
              className="bg-white text-teal-700 font-bold py-4 rounded-2xl text-center hover:bg-teal-50 transition-colors shadow-lg text-base"
            >
              Say hello 👋
            </Link>
          )}
          <button
            onClick={() => setMatchBanner(null)}
            className="bg-white/20 text-white font-semibold py-4 rounded-2xl hover:bg-white/30 transition-colors border border-white/30 text-base"
          >
            Keep swiping
          </button>
        </div>
      </div>
    );
  }

  // Quota exhausted
  if (remaining === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-gray-50">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-2">
          <span className="text-5xl">⏰</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">All done for today</h2>
        <p className="text-sm text-gray-500 max-w-xs">
          You&apos;ve used all your swipes. Come back tomorrow — new profiles will be waiting.
        </p>
        <Link
          href="/matches"
          className="mt-4 bg-teal-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-teal-700 transition-colors"
        >
          View my matches →
        </Link>
      </div>
    );
  }

  // Empty queue
  if (!current) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-gray-50">
        <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-2">
          <span className="text-5xl">🏠</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">No more profiles right now</h2>
        <p className="text-sm text-gray-500 max-w-xs">
          Check back later as more people join.
        </p>
        <Link
          href="/matches"
          className="mt-4 bg-teal-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-teal-700 transition-colors"
        >
          View my matches →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6 px-4">
      {/* Top bar */}
      <div className="w-full max-w-sm flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-teal-500" />
          <span className="text-xs font-semibold text-gray-600">{remaining} left today</span>
        </div>
      </div>

      {/* Stacked cards */}
      <div className="relative w-full max-w-sm flex-1 flex items-start pt-2">
        {/* Third card (deepest) */}
        {profiles[2] && (
          <div
            className="absolute inset-x-4 rounded-3xl bg-gray-200 shadow"
            style={{ top: 10, bottom: 0, transform: 'scale(0.90)', transformOrigin: 'bottom center' }}
          />
        )}
        {/* Second card */}
        {profiles[1] && (
          <div
            className="absolute inset-x-2 rounded-3xl bg-gray-100 shadow-md"
            style={{ top: 5, bottom: 0, transform: 'scale(0.95)', transformOrigin: 'bottom center' }}
          />
        )}
        {/* Top card */}
        <div className="relative w-full">
          <ProfileCard profile={current} hasMatch={false} />
        </div>
      </div>

      {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

      {/* Swipe buttons */}
      <div className="flex items-center gap-8 mt-6 mb-2">
        {/* PASS */}
        <button
          onClick={() => swipe('PASS')}
          disabled={isPending}
          aria-label="Pass"
          className="w-[68px] h-[68px] rounded-full bg-white border-2 border-red-100 shadow-lg flex items-center justify-center hover:bg-red-50 hover:border-red-300 hover:shadow-xl active:scale-90 disabled:opacity-40 transition-all"
        >
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* CONNECT */}
        <button
          onClick={() => swipe('CONNECT')}
          disabled={isPending}
          aria-label="Connect"
          className="w-[68px] h-[68px] rounded-full bg-teal-600 border-2 border-teal-600 shadow-lg shadow-teal-500/30 flex items-center justify-center hover:bg-teal-700 hover:shadow-xl active:scale-90 disabled:opacity-40 transition-all"
        >
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>

      <p className="text-xs text-gray-400 pb-2">← Pass · Connect →</p>
    </div>
  );
}
