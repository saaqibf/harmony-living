'use client';

import { usePathname } from 'next/navigation';

export function OnboardingProgress() {
  const pathname = usePathname();
  const m = pathname.match(/\/onboarding\/(\d+)/);
  const current = m ? Number(m[1]) : 1;

  return (
    <div className="mb-8">
      <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
        <span>
          Step {current} of 6
        </span>
        <span>{Math.round((current / 6) * 100)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-primary-600 transition-all"
          style={{ width: `${(current / 6) * 100}%` }}
        />
      </div>
    </div>
  );
}
