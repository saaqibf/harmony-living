import type { ButtonHTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  ref?: Ref<HTMLButtonElement>;
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1916]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#1c1916] text-white hover:bg-[#2e2b28] active:bg-[#3d3a37]',
  secondary:
    'bg-white text-[#4c4640] border border-[#cfc5bd] hover:bg-[#f7f3f1] active:bg-[#f1edec]',
  ghost:
    'bg-transparent text-[#4c4640] hover:bg-[#f1edec] active:bg-[#e6e1e0]',
  destructive:
    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-4 text-sm',
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-12 px-7 text-base',
};

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  type,
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={buttonClasses({ variant, size, className })}
      {...props}
    />
  );
}
