import type { InputHTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
}

export function Input({ className, type, ref, ...props }: InputProps) {
  return (
    <input
      ref={ref}
      type={type ?? 'text'}
      className={cn(
        'flex min-h-11 w-full rounded-lg border border-[#cfc5bd] bg-[#f7f3f1] px-4 py-2 text-sm text-[#1c1b1b] placeholder:text-[#7d766f] transition-colors',
        'focus-visible:border-[#2d4a3e] focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d4a3e]/15',
        'disabled:cursor-not-allowed disabled:bg-[#f1edec] disabled:text-[#7d766f]',
        'aria-invalid:border-red-400 aria-invalid:focus-visible:border-red-400 aria-invalid:focus-visible:ring-red-400/20',
        className,
      )}
      {...props}
    />
  );
}
