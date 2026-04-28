'use client';

import { cn } from '@/lib/utils';

export interface RadioGroupOption {
  value: string;
  label: string;
}

export interface RadioGroupProps {
  name: string;
  options: RadioGroupOption[];
  value: string | undefined;
  onChange: (value: string) => void;
  direction?: 'vertical' | 'horizontal';
  className?: string;
  disabled?: boolean;
  'aria-invalid'?: boolean;
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  direction = 'vertical',
  className,
  disabled,
  'aria-invalid': ariaInvalid,
}: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      aria-invalid={ariaInvalid}
      className={cn(
        'flex gap-3',
        direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className,
      )}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-[var(--radius-button)] border px-4 py-3 transition-colors',
              selected
                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20'
                : 'border-slate-200 bg-surface hover:border-slate-300',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(opt.value)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-300 bg-white peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/40',
                  selected && 'border-primary-600',
                )}
                aria-hidden
              >
                {selected ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-primary-600" />
                ) : null}
              </span>
            </span>
            <span className="text-sm font-medium text-slate-800">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}
