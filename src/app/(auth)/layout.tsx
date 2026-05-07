import type { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fdf8f7] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center">
            <span className="font-serif text-2xl font-semibold text-[#1c1b1b]">
              Harmony<span className="text-[#c96d4d]">.</span>Living
            </span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
