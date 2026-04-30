'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
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
      <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-bold text-[--color-fg]">It&apos;s a match!</h2>
        <p className="text-[--color-muted-fg]">
          You and {matchBanner.firstName} both connected.
        </p>
        <div className="flex gap-3">
          {matchBanner.conversationId && (
            <a
              href={`/messages/${matchBanner.conversationId}`}
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] font-medium bg-primary-600 text-white hover:bg-primary-700 min-h-11 px-5 text-base transition-colors"
            >
              Say hello
            </a>
          )}
          <Button variant="secondary" onClick={() => setMatchBanner(null)}>
            Keep swiping
          </Button>
        </div>
      </div>
    );
  }

  if (remaining === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-lg font-semibold text-[--color-fg]">You&apos;ve used all your swipes for today.</p>
        <p className="text-sm text-[--color-muted-fg]">Come back tomorrow — new profiles will be waiting.</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-lg font-semibold text-[--color-fg]">No more profiles right now.</p>
        <p className="text-sm text-[--color-muted-fg]">Check back later as more people join.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-xs text-[--color-muted-fg]">{remaining} swipes left today</p>

      <div className="relative w-full max-w-sm">
        {/* Shadow cards behind */}
        {profiles[2] && (
          <div className="absolute inset-0 translate-y-4 scale-[0.92] rounded-2xl border border-[--color-border] bg-[--color-surface] opacity-40" />
        )}
        {profiles[1] && (
          <div className="absolute inset-0 translate-y-2 scale-[0.96] rounded-2xl border border-[--color-border] bg-[--color-surface] opacity-70" />
        )}
        <div className="relative">
          <ProfileCard profile={current} hasMatch={false} />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-6 mt-2">
        <button
          onClick={() => swipe('PASS')}
          disabled={isPending}
          aria-label="Pass"
          className="w-16 h-16 rounded-full border-2 border-[--color-border] bg-[--color-surface] text-2xl flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50"
        >
          ✕
        </button>
        <button
          onClick={() => swipe('CONNECT')}
          disabled={isPending}
          aria-label="Connect"
          className="w-16 h-16 rounded-full border-2 border-[--color-border] bg-[--color-surface] text-2xl flex items-center justify-center hover:bg-green-50 hover:border-green-300 transition-colors disabled:opacity-50"
        >
          ♥
        </button>
      </div>

      <p className="text-xs text-[--color-muted-fg]">← Pass &nbsp; Connect →</p>
    </div>
  );
}
