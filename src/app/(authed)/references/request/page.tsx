'use client';

import Link from 'next/link';
import { useState } from 'react';

const PAST_ROOMMATES = [
  {
    id: 'p1',
    name: 'Sara M.',
    detail: 'Beltline house · 2022–2024',
    initial: 'S',
    color: '#E8D5D0',
  },
  {
    id: 'p2',
    name: 'Noor R.',
    detail: 'Kensington flat · 2021–2022',
    initial: 'N',
    color: '#d4e8df',
  },
  {
    id: 'p3',
    name: 'Someone else',
    detail: 'Enter their contact details',
    initial: '+',
    color: '#EFE0D8',
  },
];

type Step = 0 | 1 | 2;

export default function RequestReferencePage() {
  const [step, setStep] = useState<Step>(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState(
    "Hi! I'm using Harmony Living, a roommate-matching platform, and I'd love to share your reference on my profile. Would you be willing to write a few words about what it was like living together?"
  );

  function handleSelect(id: string) {
    setSelected(id);
  }

  function handleNext() {
    if (step === 0 && selected) setStep(1);
    else if (step === 1) setStep(2);
  }

  if (step === 2) {
    return (
      <div className="bg-[#F2E6E0] min-h-screen">
        <div className="bg-white border-b border-[#cfc5bd] px-6 pt-8 pb-5">
          <div className="max-w-lg mx-auto">
            <Link href="/references" className="text-sm text-[#7d766f] hover:text-[#1c1b1b] transition-colors mb-4 inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              References
            </Link>
            <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">Request sent</h1>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-16 pb-24 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#edf4f1] flex items-center justify-center mb-5">
            <svg className="w-9 h-9 text-[#2d4a3e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-serif font-semibold text-[#1c1b1b] mb-2">Request sent!</h2>
          <p className="text-sm text-[#7d766f] mb-2 max-w-xs leading-relaxed">
            {PAST_ROOMMATES.find((r) => r.id === selected)?.name ?? 'Your contact'} will receive your request and can write a reference at their own pace.
          </p>
          <p className="text-xs text-[#7d766f] mb-8 max-w-xs leading-relaxed">
            You&apos;ll be notified as soon as they respond. References typically take 1–3 days.
          </p>
          <Link
            href="/references"
            className="bg-[#A86472] text-white font-semibold text-sm px-8 py-3 rounded-xl hover:bg-[#8A505E] active:scale-95 transition-all"
          >
            Back to references
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F2E6E0] min-h-screen">
      <div className="bg-white border-b border-[#cfc5bd] px-6 pt-8 pb-5">
        <div className="max-w-lg mx-auto">
          <Link href="/references" className="text-sm text-[#7d766f] hover:text-[#1c1b1b] transition-colors mb-4 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            References
          </Link>
          <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">
            {step === 0 ? 'Who should write this?' : 'Personalise your message'}
          </h1>
          <p className="text-sm text-[#7d766f] mt-0.5">Step {step + 1} of 2</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Step indicator */}
        <div className="flex gap-1.5 mb-6">
          {[0, 1].map((s) => (
            <div
              key={s}
              className="h-1 flex-1 rounded-full transition-colors"
              style={{ background: step >= s ? '#A86472' : '#E8D5D0' }}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-3">
            {PAST_ROOMMATES.map((person) => (
              <button
                key={person.id}
                onClick={() => handleSelect(person.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                  selected === person.id
                    ? 'border-[#A86472] bg-[#F9F0EE]'
                    : 'border-[#cfc5bd] bg-white hover:border-[#E8D5D0]'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-[#1c1b1b] shrink-0"
                  style={{ background: person.color }}
                >
                  {person.initial}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1c1b1b]">{person.name}</p>
                  <p className="text-xs text-[#7d766f]">{person.detail}</p>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-colors ${
                    selected === person.id ? 'border-[#A86472] bg-[#A86472]' : 'border-[#cfc5bd]'
                  }`}
                />
              </button>
            ))}

            <div className="pt-3">
              <button
                onClick={handleNext}
                disabled={!selected}
                className="w-full bg-[#A86472] text-white font-semibold text-sm py-3 rounded-xl hover:bg-[#8A505E] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#cfc5bd] p-5">
              <p className="text-xs font-semibold text-[#7d766f] mb-2">Sending to</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-[#1c1b1b] shrink-0"
                  style={{ background: PAST_ROOMMATES.find((r) => r.id === selected)?.color ?? '#EFE0D8' }}
                >
                  {PAST_ROOMMATES.find((r) => r.id === selected)?.initial}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1c1b1b]">
                    {PAST_ROOMMATES.find((r) => r.id === selected)?.name}
                  </p>
                  <p className="text-xs text-[#7d766f]">
                    {PAST_ROOMMATES.find((r) => r.id === selected)?.detail}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4c4640] mb-2">Your message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full text-sm bg-white border border-[#cfc5bd] rounded-xl px-4 py-3 text-[#1c1b1b] resize-none focus:outline-none focus:border-[#A86472] transition-colors leading-relaxed"
              />
              <p className="text-xs text-[#7d766f] mt-1.5">Keep it personal. References from close contacts feel more authentic.</p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setStep(0)}
                className="flex-1 border border-[#cfc5bd] text-[#4c4640] font-semibold text-sm py-3 rounded-xl hover:bg-[#F5EAE4] transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-[#A86472] text-white font-semibold text-sm py-3 rounded-xl hover:bg-[#8A505E] active:scale-95 transition-all"
              >
                Send request
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
