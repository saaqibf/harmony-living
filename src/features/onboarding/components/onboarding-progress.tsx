'use client';

import { usePathname } from 'next/navigation';

export function OnboardingProgress() {
  const pathname = usePathname();
  const m = pathname.match(/\/onboarding\/(\d+)/);
  const current = m ? Number(m[1]) : 1;

  return (
    <div className="mb-8">
      <div className="mb-2 flex justify-between text-xs font-medium text-[#7d766f]">
        <span>Step {current} of 4</span>
        <span>{Math.round((current / 4) * 100)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#cfc5bd]">
        <div
          className="h-full rounded-full bg-[#2d4a3e] transition-all"
          style={{ width: `${(current / 4) * 100}%` }}
        />
      </div>
    </div>
  );
}
