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
        className="block w-full py-4 rounded-2xl font-bold text-white bg-teal-600 hover:bg-teal-700 text-center transition-colors"
      >
        It's a match! Say hello 👋
      </Link>
    );
  }

  if (state.kind === 'sent') {
    return (
      <div className="w-full py-4 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 text-center font-semibold">
        Request sent ✓
      </div>
    );
  }

  if (state.kind === 'error') {
    return (
      <div className="space-y-2">
        <button
          onClick={handleConnect}
          className="w-full py-4 rounded-2xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors"
        >
          Connect
        </button>
        <p className="text-sm text-red-500 text-center">{state.message}</p>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={state.kind === 'loading'}
      className="w-full py-4 rounded-2xl font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      {state.kind === 'loading' ? 'Connecting...' : 'Connect'}
    </button>
  );
}
