'use client';

import { useState } from 'react';
import Link from 'next/link';
import { swipeAction } from '@/features/discovery/lib/actions';

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'sent' }
  | { kind: 'matched'; conversationId: string }
  | { kind: 'error'; message: string };

export function ConnectButton({ targetId }: { targetId: string }) {
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function handleConnect() {
    setState({ kind: 'loading' });
    const result = await swipeAction(targetId, 'CONNECT');
    if (result.ok) {
      if (result.matched && result.conversationId) {
        setState({ kind: 'matched', conversationId: result.conversationId });
      } else {
        setState({ kind: 'sent' });
      }
    } else {
      setState({ kind: 'error', message: result.error });
    }
  }

  if (state.kind === 'matched') {
    return (
      <Link
        href={`/messages/${state.conversationId}`}
        className="block w-full py-4 rounded-2xl font-semibold text-white bg-[#1c1916] hover:bg-[#2e2b28] text-center text-sm transition-colors"
      >
        It&apos;s a match! Say hello →
      </Link>
    );
  }

  if (state.kind === 'sent') {
    return (
      <div className="w-full py-4 rounded-2xl bg-[#F5EAE4] text-[#A86472] border border-[#cfc5bd] text-center text-sm font-semibold">
        Request sent ✓
      </div>
    );
  }

  if (state.kind === 'error') {
    return (
      <div className="space-y-2">
        <button
          onClick={handleConnect}
          className="w-full py-4 rounded-2xl font-semibold text-white bg-[#1c1916] hover:bg-[#2e2b28] transition-colors text-sm"
        >
          Connect
        </button>
        <p className="text-xs text-red-500 text-center">{state.message}</p>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={state.kind === 'loading'}
      className="w-full py-4 rounded-2xl font-semibold text-white bg-[#1c1916] hover:bg-[#2e2b28] disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm"
    >
      {state.kind === 'loading' ? 'Connecting…' : 'Connect'}
    </button>
  );
}
