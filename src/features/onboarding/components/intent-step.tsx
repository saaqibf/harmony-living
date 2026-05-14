'use client';

import { useState, useTransition } from 'react';
import { saveIntentAction } from '@/features/onboarding/lib/actions';
import type { IntentValue } from '@/lib/onboarding/step-schemas';

const OPTIONS: {
  value: IntentValue;
  label: string;
  desc: string;
  icon: React.ReactNode;
  tag: string;
}[] = [
  {
    value: 'room_seeker',
    label: "I'm looking for a room",
    desc: 'Find a room or apartment to rent in Calgary.',
    tag: 'Seeker',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    value: 'roommate_finder',
    label: 'I have a place and need a roommate',
    desc: 'You have a space and want to find the right person to share it.',
    tag: 'Lister',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    value: 'tenant_lister',
    label: "I'm a tenant listing a spare room",
    desc: "You rent your home and have an extra room you'd like to list.",
    tag: 'Lister',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    value: 'landlord',
    label: "I'm a landlord listing my property",
    desc: 'You own a property and want to rent it out to the right tenant.',
    tag: 'Landlord',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
  },
  {
    value: 'room_seeker_and_lister',
    label: "Both: I'm looking AND listing",
    desc: "Open to moving if the right place comes up, while listing your current space.",
    tag: 'Seeker + Lister',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
];

export function IntentStep({ initialIntent }: { initialIntent: string | null }) {
  const [selected, setSelected] = useState<IntentValue | ''>(
    (initialIntent as IntentValue) ?? '',
  );
  const [pending, start] = useTransition();

  const handleSubmit = () => {
    if (!selected) return;
    start(async () => {
      await saveIntentAction({ intent: selected });
    });
  };

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">What brings you to Harmony?</h1>
        <p className="text-[#7d766f] text-sm">This shapes your whole experience. You can always change it later.</p>
      </div>

      <div className="space-y-2.5">
        {OPTIONS.map((opt) => {
          const active = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelected(opt.value)}
              className={`w-full flex items-start gap-3.5 p-4 rounded-2xl border-2 text-left transition-all ${
                active
                  ? 'border-[#A86472] bg-[#F9F0EE]'
                  : 'border-[#e0d6d0] bg-white hover:border-[#c8a0b8] hover:bg-[#fdfafc]'
              }`}
            >
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  active ? 'bg-[#A86472] text-white' : 'bg-[#EFE0D8] text-[#7d766f]'
                }`}
              >
                {opt.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className={`text-sm font-semibold transition-colors ${active ? 'text-[#A86472]' : 'text-[#1c1b1b]'}`}>
                    {opt.label}
                  </p>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full transition-colors ${
                      active ? 'bg-[#A86472]/10 text-[#A86472]' : 'bg-[#EFE0D8] text-[#7d766f]'
                    }`}
                  >
                    {opt.tag}
                  </span>
                </div>
                <p className="text-xs text-[#7d766f] leading-relaxed">{opt.desc}</p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 shrink-0 mt-1 transition-all ${
                  active ? 'border-[#A86472] bg-[#A86472]' : 'border-[#cfc5bd]'
                }`}
              />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selected || pending}
        className="w-full py-3 rounded-xl bg-[#A86472] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-[#8A505E] active:scale-95"
      >
        {pending ? 'Saving…' : 'Continue →'}
      </button>
    </div>
  );
}
