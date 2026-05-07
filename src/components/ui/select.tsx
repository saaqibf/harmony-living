'use client';

import type { SelectHTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  ref?: Ref<HTMLSelectElement>;
}

export function Select({ className, ref, children, ...props }: SelectProps) {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        className={cn(
          'flex min-h-11 w-full appearance-none rounded-[var(--radius-button)] border border-[#cfc5bd] bg-surface px-4 py-2 pr-10 text-base text-[#1c1b1b] transition-colors',
          'focus-visible:border-[#2d4a3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d4a3e]/20',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
          'aria-invalid:border-red-500 aria-invalid:focus-visible:border-red-500 aria-invalid:focus-visible:ring-red-500/30',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <span
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7d766f]"
        aria-hidden
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path
            d="m6 8 4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}
