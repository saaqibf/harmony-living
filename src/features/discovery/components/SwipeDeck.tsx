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

  if (matchBanner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-500 via-teal-600 to-teal-800 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center mb-6 shadow-2xl">
          <span className="text-6xl">🎉</span>
        </div>
        <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">It&apos;s a match!</h2>
        <p className="text-teal-100 text-lg mb-10 max-w-xs leading-relaxed">
          You and <strong className="text-white">{matchBanner.firstName}</strong> both connected. Time to say hello!
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {matchBanner.conversationId && (
            <Link
              href={`/messages/${matchBanner.conversationId}`}
              className="bg-white text-teal-700 font-bold py-4 rounded-2xl text-center hover:bg-teal-50 transition-colors shadow-xl text-base"
            >
              Say hello 👋
            </Link>
          )}
          <button
            onClick={() => setMatchBanner(null)}
            className="bg-white/15 text-white font-semibold py-4 rounded-2xl hover:bg-white/25 transition-colors border border-white/20 text-base"
          >
            Keep discovering
          </button>
        </div>
      </div>
    );
  }

  if (remaining === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-b from-amber-50 via-stone-50 to-teal-50">
        <div className="relative mb-8">
          <div className="w-36 h-36 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center shadow-xl shadow-amber-200">
            <span className="text-6xl">⏰</span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center shadow-lg text-xl">✓</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">All done for today!</h2>
        <p className="text-base text-gray-500 max-w-xs leading-relaxed mb-8">
          You&apos;ve used all your swipes for today. Fresh faces will be here tomorrow. 🌱
        </p>
        <Link
          href="/matches"
          className="bg-teal-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/25 text-base"
        >
          View my matches →
        </Link>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-b from-teal-50 via-stone-50 to-amber-50">
        <div className="relative mb-8">
          <div className="w-36 h-36 rounded-full bg-gradient-to-br from-teal-200 to-teal-400 flex items-center justify-center shadow-xl shadow-teal-200">
            <span className="text-6xl">🏠</span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center shadow-lg text-xl">✨</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">You&apos;ve seen everyone!</h2>
        <p className="text-base text-gray-500 max-w-xs leading-relaxed mb-8">
          New people join every day. In the meantime, why not say hello to one of your matches?
        </p>
        <Link
          href="/matches"
          className="bg-teal-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/25 text-base"
        >
          View my matches →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center py-6 px-4">
      {/* Top bar */}
      <div className="w-full max-w-sm flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
        <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-full px-4 py-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-teal-500" />
          <span className="text-xs font-bold text-gray-700">{remaining} left today</span>
        </div>
      </div>

      {/* Card stack */}
      <div className="relative w-full max-w-sm" style={{ height: 540 }}>
        {/* Third card (deepest) */}
        {profiles[2] && (
          <div
            className="absolute inset-x-6 rounded-3xl bg-stone-200"
            style={{ top: 14, bottom: 0, transform: 'scale(0.88)', transformOrigin: 'bottom center' }}
          />
        )}
        {/* Second card */}
        {profiles[1] && (
          <div
            className="absolute inset-x-3 rounded-3xl bg-stone-100 shadow-sm"
            style={{ top: 7, bottom: 0, transform: 'scale(0.94)', transformOrigin: 'bottom center' }}
          />
        )}
        {/* Top card */}
        <div className="absolute inset-0">
          <ProfileCard profile={current} hasMatch={false} />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 mt-3 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
          {error}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-10 mt-6 mb-1">
        <button
          onClick={() => swipe('PASS')}
          disabled={isPending}
          aria-label="Pass"
          className="w-[72px] h-[72px] rounded-full bg-white border-2 border-red-200 shadow-lg flex items-center justify-center hover:bg-red-50 hover:border-red-300 hover:shadow-xl active:scale-90 disabled:opacity-40 transition-all"
        >
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <button
          onClick={() => swipe('CONNECT')}
          disabled={isPending}
          aria-label="Connect"
          className="w-[72px] h-[72px] rounded-full bg-teal-600 shadow-lg shadow-teal-500/30 flex items-center justify-center hover:bg-teal-700 hover:shadow-xl active:scale-90 disabled:opacity-40 transition-all"
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>

      <p className="text-[11px] text-stone-400 pb-2 font-medium">← Pass · Connect →</p>
    </div>
  );
}
