'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { swipeAction, type SwipeActionResult } from '@/features/discovery/lib/actions';
import type { DiscoveryProfile } from '@/server/services/discovery';

type Props = {
  initialProfiles: DiscoveryProfile[];
  swipesRemaining: number;
};

const FILTER_CHIPS = ['Distance', 'Budget', 'Lifestyle', 'Pets', 'Gender'];

export function SwipeDeck({ initialProfiles, swipesRemaining }: Props) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [remaining, setRemaining] = useState(swipesRemaining);
  const [matchBanner, setMatchBanner] = useState<{ firstName: string; conversationId?: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

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
      <div className="min-h-screen bg-[#c96d4d] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <h2 className="text-3xl font-serif font-semibold text-white mb-2">It&apos;s a match!</h2>
        <p className="text-white/80 text-sm mb-8 max-w-xs leading-relaxed">
          You and <strong className="text-white">{matchBanner.firstName}</strong> both connected. Time to say hello!
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {matchBanner.conversationId && (
            <Link
              href={`/messages/${matchBanner.conversationId}`}
              className="bg-white text-[#c96d4d] font-semibold py-3.5 rounded-xl text-center hover:bg-[#fdf8f7] transition-colors text-sm"
            >
              Send a message
            </Link>
          )}
          <button
            onClick={() => setMatchBanner(null)}
            className="bg-white/15 text-white font-semibold py-3.5 rounded-xl hover:bg-white/25 transition-colors border border-white/20 text-sm"
          >
            Keep discovering
          </button>
        </div>
      </div>
    );
  }

  if (remaining === 0) {
    return (
      <div className="min-h-screen bg-[#fdf8f7] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#f7f3f1] flex items-center justify-center mb-5">
          <svg className="w-9 h-9 text-[#c96d4d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-serif font-semibold text-[#1c1b1b] mb-2">All done for today</h2>
        <p className="text-sm text-[#7d766f] max-w-xs leading-relaxed mb-6">
          You&apos;ve used all your daily connections. Fresh profiles will appear tomorrow.
        </p>
        <Link
          href="/matches"
          className="bg-[#1c1916] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#2e2b28] transition-colors text-sm"
        >
          View my matches
        </Link>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="min-h-screen bg-[#fdf8f7] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#f7f3f1] flex items-center justify-center mb-5">
          <svg className="w-9 h-9 text-[#c96d4d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <h2 className="text-xl font-serif font-semibold text-[#1c1b1b] mb-2">You&apos;ve seen everyone!</h2>
        <p className="text-sm text-[#7d766f] max-w-xs leading-relaxed mb-6">
          New people join every day. Say hello to one of your matches in the meantime.
        </p>
        <Link
          href="/matches"
          className="bg-[#1c1916] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#2e2b28] transition-colors text-sm"
        >
          View my matches
        </Link>
      </div>
    );
  }

  const scorePercent = Math.round(current.score * 100);
  const showPhoto = current.photoVisibility === 'ALWAYS' && current.photoUrl;

  return (
    <div className="min-h-screen bg-[#fdf8f7]">
      {/* Top bar */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">Discover</h1>
        <div className="flex items-center gap-1.5 bg-white border border-[#cfc5bd] rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#4c4640]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c96d4d]" />
          {remaining} left today
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-6 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveFilter(activeFilter === chip ? null : chip)}
            className={`shrink-0 text-xs font-medium px-4 py-1.5 rounded-full border transition-colors ${
              activeFilter === chip
                ? 'bg-[#1c1b1b] text-white border-[#1c1b1b]'
                : 'bg-white text-[#4c4640] border-[#cfc5bd] hover:border-[#c96d4d]'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Main card */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-[14px] border border-[#cfc5bd] overflow-hidden shadow-sm">
          {/* Photo */}
          <div className="relative h-80 bg-[#f1edec]">
            {showPhoto ? (
              <img
                src={current.photoUrl!}
                alt={current.firstName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-7xl">👤</span>
              </div>
            )}

            {/* Verified badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
              <svg className="w-3 h-3 text-[#2d4a3e]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-[10px] font-semibold text-[#2d4a3e] uppercase tracking-wide">Verified</span>
            </div>

            {/* Name overlay at bottom */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-5 pt-10 pb-4">
              <p className="text-white font-serif font-semibold text-xl leading-tight">
                {current.firstName}, {current.ageYears}
              </p>
              {current.occupation && (
                <p className="text-white/80 text-xs mt-0.5">{current.occupation}</p>
              )}
              <p className="text-white/70 text-xs flex items-center gap-1 mt-0.5">
                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                {current.city}
              </p>
            </div>
          </div>

          {/* Card body */}
          <div className="p-5 space-y-4">
            {/* Compatibility score */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-[#4c4640]">Compatibility</span>
                <span className="font-mono text-xs font-bold text-[#c96d4d]">{scorePercent}%</span>
              </div>
              <div className="h-1.5 bg-[#f1edec] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#c96d4d] rounded-full transition-all"
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {current.faith && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#f1edec] text-[#4c4640] border border-[#cfc5bd]">{current.faith}</span>
              )}
              {current.gender && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#f1edec] text-[#4c4640] border border-[#cfc5bd]">{current.gender}</span>
              )}
            </div>

            {/* Bio */}
            {current.bio && (
              <div>
                <p className="text-xs font-semibold text-[#1c1b1b] mb-1">About</p>
                <p className="text-sm text-[#4c4640] leading-relaxed line-clamp-3">{current.bio}</p>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => swipe('PASS')}
                disabled={isPending}
                aria-label="Pass"
                className="flex-1 flex items-center justify-center gap-2 py-3 border border-[#cfc5bd] rounded-xl text-[#7d766f] hover:bg-[#fdf8f7] hover:border-[#c96d4d] hover:text-[#c96d4d] disabled:opacity-40 transition-all text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Pass
              </button>
              <button
                onClick={() => swipe('CONNECT')}
                disabled={isPending}
                aria-label="Connect"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1c1916] rounded-xl text-white hover:bg-[#2e2b28] disabled:opacity-40 transition-all text-sm font-semibold"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                Connect
              </button>
            </div>
          </div>
        </div>

        {/* Keyboard hint */}
        <p className="text-center text-xs text-[#7d766f] mt-3">← Pass · Connect →</p>
      </div>
    </div>
  );
}
