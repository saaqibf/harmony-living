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
      <h1 className="text-2xl font-semibold text-gray-900">Identity verification</h1>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5">
        <div className="flex items-start gap-4 pb-5 border-b border-stone-100">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl shrink-0">
            🛡️
          </div>
          <div>
            <h2 className="font-bold text-gray-900 mb-1">Why verify?</h2>
            <ul className="space-y-1.5 text-sm text-gray-500">
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5 shrink-0">✓</span>
                A verified badge appears on your profile — builds trust instantly
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5 shrink-0">✓</span>
                Some users only connect with verified members
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5 shrink-0">✓</span>
                One-time process — takes about 2 minutes
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="font-bold text-gray-900 mb-2">What you&apos;ll need</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            A government-issued photo ID (passport, driver&apos;s licence, or national ID) and a selfie.
            Powered by Stripe Identity — your ID is processed by Stripe and never stored on Harmony Living servers.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <Button onClick={startVerification} disabled={isPending} className="w-full">
          {isPending ? 'Starting…' : 'Start verification →'}
        </Button>
      </div>
    </div>
  );
}
