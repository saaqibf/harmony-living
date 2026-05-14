'use client';

import Link from 'next/link';
import { useState } from 'react';

const PUBLIC_PLACES = [
  {
    id: 'pl1',
    name: 'Analog Coffee',
    address: '740 17 Ave SW, Calgary',
    type: 'Coffee shop',
    notes: 'Cozy, well-lit, busy weekday afternoons.',
    icon: '☕',
  },
  {
    id: 'pl2',
    name: "Prince's Island Park",
    address: 'Eau Claire, NW Calgary',
    type: 'Public park',
    notes: 'Open air, popular, easy to leave from any direction.',
    icon: '🌿',
  },
  {
    id: 'pl3',
    name: 'Central Library Calgary',
    address: '800 3 St SE, Calgary',
    type: 'Public library',
    notes: 'Quiet, well-staffed, central location.',
    icon: '📚',
  },
];

type Stage = 0 | 1 | 2;

export default function MeetPage() {
  const [stage, setStage] = useState<Stage>(0);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [safetyMsg, setSafetyMsg] = useState('');

  if (stage === 2) {
    const place = PUBLIC_PLACES.find((p) => p.id === selectedPlace);
    return (
      <div className="bg-[#F2E6E0] min-h-screen">
        <div className="bg-white border-b border-[#cfc5bd] px-6 pt-8 pb-5">
          <div className="max-w-lg mx-auto">
            <Link href="/messages" className="text-sm text-[#7d766f] hover:text-[#1c1b1b] transition-colors mb-4 inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Messages
            </Link>
            <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">Meeting confirmed</h1>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-10 pb-24">
          <div className="bg-white rounded-2xl border border-[#cfc5bd] p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#edf4f1] flex items-center justify-center text-3xl mx-auto mb-4">
              {place?.icon ?? '✓'}
            </div>
            <h2 className="text-lg font-serif font-semibold text-[#1c1b1b] mb-1">Stay safe out there</h2>
            <p className="text-sm text-[#7d766f] mb-5 leading-relaxed">
              Your meeting location and safety note have been logged. We&apos;ll remind you to check in after your meeting.
            </p>

            <div className="bg-[#F5EAE4] rounded-xl p-4 text-left mb-5">
              <p className="text-xs font-semibold text-[#4c4640] mb-1">Meeting at</p>
              <p className="text-sm font-semibold text-[#1c1b1b]">{place?.name}</p>
              <p className="text-xs text-[#7d766f]">{place?.address}</p>
              {safetyMsg && (
                <div className="mt-3 pt-3 border-t border-[#cfc5bd]">
                  <p className="text-xs font-semibold text-[#4c4640] mb-1">Safety note sent</p>
                  <p className="text-xs text-[#7d766f] italic">&ldquo;{safetyMsg}&rdquo;</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Link
                href="/messages"
                className="flex-1 border border-[#cfc5bd] text-[#4c4640] font-semibold text-sm py-3 rounded-xl hover:bg-[#F5EAE4] text-center transition-colors"
              >
                Back to messages
              </Link>
              <Link
                href="/safety"
                className="flex-1 bg-[#A86472] text-white font-semibold text-sm py-3 rounded-xl hover:bg-[#8A505E] text-center transition-all"
              >
                Safety tips
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F2E6E0] min-h-screen">
      <div className="bg-white border-b border-[#cfc5bd] px-6 pt-8 pb-5">
        <div className="max-w-lg mx-auto">
          <Link href="/messages" className="text-sm text-[#7d766f] hover:text-[#1c1b1b] transition-colors mb-4 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Messages
          </Link>
          <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">
            {stage === 0 ? 'Pick a public place' : 'Tell a friend first'}
          </h1>
          <p className="text-sm text-[#7d766f] mt-0.5">Stage {stage + 1} of 2</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Progress */}
        <div className="flex gap-1.5 mb-6">
          {[0, 1].map((s) => (
            <div
              key={s}
              className="h-1 flex-1 rounded-full transition-colors"
              style={{ background: stage >= s ? '#A86472' : '#E8D5D0' }}
            />
          ))}
        </div>

        {stage === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-[#7d766f] mb-4">
              We recommend these Calgary public spaces. First meetings should always be somewhere busy and open.
            </p>
            {PUBLIC_PLACES.map((place) => (
              <button
                key={place.id}
                onClick={() => setSelectedPlace(place.id)}
                className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${
                  selectedPlace === place.id
                    ? 'border-[#A86472] bg-[#F9F0EE]'
                    : 'border-[#cfc5bd] bg-white hover:border-[#E8D5D0]'
                }`}
              >
                <span className="text-2xl shrink-0">{place.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1c1b1b]">{place.name}</p>
                  <p className="text-xs text-[#7d766f] mb-1">{place.address} · {place.type}</p>
                  <p className="text-xs text-[#4c4640]">{place.notes}</p>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 transition-colors ${
                    selectedPlace === place.id ? 'border-[#A86472] bg-[#A86472]' : 'border-[#cfc5bd]'
                  }`}
                />
              </button>
            ))}

            <div className="pt-3">
              <button
                onClick={() => selectedPlace && setStage(1)}
                disabled={!selectedPlace}
                className="w-full bg-[#A86472] text-white font-semibold text-sm py-3 rounded-xl hover:bg-[#8A505E] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {stage === 1 && (
          <div className="space-y-4">
            <div className="bg-[#F9F0EE] border border-[#E8D5D0] rounded-2xl px-5 py-4">
              <p className="text-sm font-semibold text-[#A86472] mb-1">Before you go, tell someone</p>
              <p className="text-xs text-[#4c4640] leading-relaxed">
                Send a quick note to a friend or family member with where you&apos;re going, who you&apos;re meeting, and when you&apos;ll be back.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4c4640] mb-2">
                Your safety message <span className="font-normal text-[#7d766f]">(we&apos;ll send this for you)</span>
              </label>
              <textarea
                value={safetyMsg}
                onChange={(e) => setSafetyMsg(e.target.value)}
                rows={5}
                placeholder={`e.g. "I'm meeting a potential roommate at ${PUBLIC_PLACES.find((p) => p.id === selectedPlace)?.name ?? 'a public place'} around 2pm. I'll check in by 4pm."`}
                className="w-full text-sm bg-white border border-[#cfc5bd] rounded-xl px-4 py-3 text-[#1c1b1b] resize-none placeholder:text-[#7d766f] focus:outline-none focus:border-[#A86472] transition-colors leading-relaxed"
              />
            </div>

            <p className="text-xs text-[#7d766f] -mt-1">
              The message is sent to your emergency contact if you&apos;ve set one in Privacy settings.
            </p>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setStage(0)}
                className="flex-1 border border-[#cfc5bd] text-[#4c4640] font-semibold text-sm py-3 rounded-xl hover:bg-[#F5EAE4] transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStage(2)}
                className="flex-1 bg-[#A86472] text-white font-semibold text-sm py-3 rounded-xl hover:bg-[#8A505E] active:scale-95 transition-all"
              >
                Send &amp; confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
