'use client';

import type { TextareaHTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({
  className,
  rows = 4,
  ref,
  ...props
}: TextareaProps) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'flex min-h-11 w-full resize-none rounded-[var(--radius-button)] border border-[#cfc5bd] bg-surface px-4 py-2 text-base text-[#1c1b1b] placeholder:text-[#7d766f] transition-colors',
        'focus-visible:border-[#2d4a3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d4a3e]/20',
        'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
        'aria-invalid:border-red-500 aria-invalid:focus-visible:border-red-500 aria-invalid:focus-visible:ring-red-500/30',
        className,
      )}
      {...props}
    />
  );
}
