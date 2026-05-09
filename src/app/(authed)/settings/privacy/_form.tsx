'use client';

import { useState, useTransition } from 'react';
import { updatePrivacyAction } from '@/features/settings/lib/actions';

const OPTIONS = [
  { value: 'ALWAYS', label: 'Always visible', desc: 'Anyone can see your photo' },
  { value: 'UNTIL_MATCH', label: 'Until match', desc: 'Only mutual matches see your real photo' },
  { value: 'PRIVATE', label: 'Private', desc: 'Blurred photo until you choose to reveal' },
] as const;

export function PrivacyForm({ initial }: { initial: string }) {
  const [isPending, start] = useTransition();
  const [visibility, setVisibility] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    start(async () => {
      try {
        await updatePrivacyAction({ photoVisibility: visibility });
        setSaved(true);
      } catch {
        setError('Failed to save. Please try again.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {saved && (
        <div className="rounded-xl bg-[#fdf4f9] border border-[#e8cede] px-4 py-3 text-sm text-[#5A1F43]">
          Privacy settings saved.
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="space-y-3">
        <p className="text-sm font-medium text-[#1c1b1b]">Photo visibility</p>
        {OPTIONS.map((opt) => (
          <label key={opt.value}
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
              visibility === opt.value
                ? 'border-[#7B2D5C] bg-[#fdf4f9]'
                : 'border-[#cfc5bd] bg-white hover:bg-[#fdf4f9]'
            }`}
          >
            <input type="radio" name="visibility" value={opt.value} checked={visibility === opt.value}
              onChange={() => setVisibility(opt.value)} className="mt-0.5 accent-[#7B2D5C]" />
            <div>
              <p className="text-sm font-semibold text-[#1c1b1b]">{opt.label}</p>
              <p className="text-xs text-[#7d766f] mt-0.5">{opt.desc}</p>
            </div>
          </label>
        ))}
      </div>

      <button type="submit" disabled={isPending}
        className="w-full rounded-xl bg-[#7B2D5C] py-3 text-sm font-semibold text-white transition hover:bg-[#5A1F43] disabled:opacity-60">
        {isPending ? 'Saving…' : 'Save privacy settings'}
      </button>
    </form>
  );
}
