'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';

export default function VerifyPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const startVerification = () => {
    setError(null);
    startTransition(async () => {
      const res = await fetch('/api/verify/start', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to start verification');
        return;
      }
      window.location.href = data.url;
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[--color-fg]">Identity verification</h1>

      <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-6 space-y-4">
        <div className="space-y-2">
          <h2 className="font-semibold text-[--color-fg]">Why verify?</h2>
          <ul className="space-y-1 text-sm text-[--color-muted-fg]">
            <li>• A verified badge appears on your profile — builds trust instantly</li>
            <li>• Some users only connect with verified members</li>
            <li>• Verification is one-time and takes about 2 minutes</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="font-semibold text-[--color-fg]">What you&apos;ll need</h2>
          <p className="text-sm text-[--color-muted-fg]">
            A government-issued photo ID (passport, driver&apos;s licence, or national ID) and a selfie.
            Powered by Stripe Identity — your ID is processed by Stripe and never stored on Harmony Living servers.
          </p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button onClick={startVerification} disabled={isPending}>
          {isPending ? 'Starting…' : 'Start verification'}
        </Button>
      </div>
    </div>
  );
}
