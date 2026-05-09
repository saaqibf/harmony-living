'use client';

import { useState, useTransition } from 'react';
import { saveIntentAction } from '@/features/onboarding/lib/actions';

const OPTIONS = [
  { value: 'seeker', emoji: '🔍', label: "I'm looking for a room or roommate" },
  { value: 'lister', emoji: '🏠', label: "I have a room to rent out" },
  { value: 'both', emoji: '🔄', label: 'Both — I want to do both' },
] as const;

export function IntentStep({ initialIntent }: { initialIntent: string | null }) {
  const [selected, setSelected] = useState<string>(initialIntent ?? '');
  const [pending, start] = useTransition();

  const handleSubmit = () => {
    if (!selected) return;
    start(async () => {
      await saveIntentAction({ intent: selected });
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">What brings you here?</h1>
        <p className="text-[#7d766f] text-sm">We&apos;ll tailor your experience from the start.</p>
      </div>

      <div className="space-y-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSelected(opt.value)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
              selected === opt.value
                ? 'border-[#7B2D5C] bg-[#fdf4f9]'
                : 'border-[#cfc5bd] bg-white hover:border-[#7B2D5C]/50'
            }`}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <span className={`font-medium text-sm ${selected === opt.value ? 'text-[#7B2D5C]' : 'text-[#4c4640]'}`}>
              {opt.label}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selected || pending}
        className="w-full py-3 rounded-xl bg-[#7B2D5C] text-white font-semibold text-sm disabled:opacity-50 transition-opacity hover:bg-[#5A1F43]"
      >
        {pending ? 'Saving…' : 'Continue →'}
      </button>
    </div>
  );
}
