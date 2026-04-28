'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

export interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatLabel?: (value: number) => string;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export function Slider({
  min,
  max,
  step,
  value,
  onChange,
  formatLabel = (n) => String(n),
  label,
  description,
  className,
  disabled,
}: SliderProps) {
  return (
    <div className={cn('w-full space-y-2', className)}>
      {label ? (
        <div className="text-sm font-medium text-slate-700">{label}</div>
      ) : null}
      {description ? (
        <p className="text-sm text-slate-500">{description}</p>
      ) : null}
      <div className="flex justify-between gap-4 text-sm font-medium text-primary-700">
        <span>{formatLabel(value[0])}</span>
        <span>{formatLabel(value[1])}</span>
      </div>
      <SliderPrimitive.Root
        className="relative flex h-8 w-full touch-none select-none items-center"
        min={min}
        max={max}
        step={step}
        value={[value[0], value[1]]}
        onValueChange={(v) => {
          const a = v[0] ?? min;
          const b = v[1] ?? max;
          onChange(a <= b ? [a, b] : [b, a]);
        }}
        disabled={disabled}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow rounded-full bg-slate-200">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary-500" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            'block h-5 w-5 rounded-full border-2 border-primary-600 bg-white shadow-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
            'disabled:pointer-events-none disabled:opacity-40',
          )}
          aria-label="Minimum"
        />
        <SliderPrimitive.Thumb
          className={cn(
            'block h-5 w-5 rounded-full border-2 border-primary-600 bg-white shadow-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
            'disabled:pointer-events-none disabled:opacity-40',
          )}
          aria-label="Maximum"
        />
      </SliderPrimitive.Root>
    </div>
  );
}
