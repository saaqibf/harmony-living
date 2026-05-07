import type { ReactNode } from 'react';
import Link from 'next/link';

/**
 * (auth) route group layout — centered single-column wrapper for all auth pages.
 * This route group does NOT appear in the URL (no segment is added).
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand mark */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              harmony<span className="text-primary-600">.</span>living
            </span>
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
