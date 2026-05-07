import type { HTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/utils';

interface DivProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export function Card({ className, ref, ...props }: DivProps) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-[#cfc5bd] bg-white',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ref, ...props }: DivProps) {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col gap-1.5 p-6 pb-4', className)}
      {...props}
    />
  );
}

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  ref?: Ref<HTMLHeadingElement>;
}

export function CardTitle({ className, ref, ...props }: HeadingProps) {
  return (
    <h3
      ref={ref}
      className={cn(
        'text-base font-semibold leading-tight text-[#1c1b1b]',
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ref, ...props }: DivProps) {
  return (
    <div
      ref={ref}
      className={cn('p-6 pt-0 text-[#4c4640]', className)}
      {...props}
    />
  );
}

export function CardFooter({ className, ref, ...props }: DivProps) {
  return (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-4 border-t border-[#cfc5bd]', className)}
      {...props}
    />
  );
}
