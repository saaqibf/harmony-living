import type { LabelHTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  ref?: Ref<HTMLLabelElement>;
}

export function Label({ className, ref, ...props }: LabelProps) {
  return (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium text-slate-700 leading-none',
        className,
      )}
      {...props}
    />
  );
}
