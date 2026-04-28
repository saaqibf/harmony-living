'use client';

import type { InputHTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export interface DatePickerProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'min' | 'max'> {
  ref?: Ref<HTMLInputElement>;
  value?: string;
  onChange?: (value: string) => void;
  min?: string;
  max?: string;
  label?: string;
  error?: string;
}

export function DatePicker({
  className,
  value,
  onChange,
  min,
  max,
  label,
  error,
  id,
  ref,
  ...props
}: DatePickerProps) {
  const inputId = id ?? props.name;

  return (
    <div className="w-full space-y-1.5">
      {label ? (
        <Label htmlFor={inputId} className="block">
          {label}
        </Label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        type="date"
        value={value ?? ''}
        min={min}
        max={max}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          'flex min-h-11 w-full rounded-[var(--radius-button)] border border-slate-300 bg-surface px-4 py-2 text-base text-slate-900 transition-colors',
          'focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
          error &&
            'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/30',
          className,
        )}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
