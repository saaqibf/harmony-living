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
        'flex min-h-11 w-full rounded-[var(--radius-button)] border border-slate-300 bg-surface px-4 py-2 text-base text-slate-900 placeholder:text-slate-400 transition-colors',
        'focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30',
        'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
        'aria-invalid:border-red-500 aria-invalid:focus-visible:border-red-500 aria-invalid:focus-visible:ring-red-500/30',
        className,
      )}
      {...props}
    />
  );
}
