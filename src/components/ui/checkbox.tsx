'use client';

import type { InputHTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  ref?: Ref<HTMLInputElement>;
  label?: string;
}

export function Checkbox({ className, label, id, ref, ...props }: CheckboxProps) {
  const input = (
    <span className="flex min-h-11 min-w-11 shrink-0 items-center justify-center">
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className={cn(
          'h-6 w-6 cursor-pointer rounded border-2 border-[#cfc5bd] text-[#1c1916] accent-[#1c1916] transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d4a3e]/30 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'aria-invalid:border-red-500',
          className,
        )}
        {...props}
      />
    </span>
  );

  if (label) {
    return (
      <label
        htmlFor={id}
        className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-[#1c1b1b]"
      >
        {input}
        <span>{label}</span>
      </label>
    );
  }

  return input;
}
