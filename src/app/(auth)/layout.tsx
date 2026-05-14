import type { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel: brand */}
      <div className="hidden md:flex md:w-[420px] lg:w-[480px] bg-gradient-to-br from-[#A86472] via-[#8A505E] to-[#1A0A14] flex-col justify-between px-10 py-12 shrink-0">
        <Link href="/" className="inline-flex items-center">
          <span className="font-serif text-2xl font-semibold text-white">
            Harmony<span className="text-[#C4909A]">.</span>Living
          </span>
        </Link>

        <div>
          <p className="font-serif text-white text-3xl lg:text-4xl font-semibold leading-[1.2] mb-8">
            Find a home<br />where you truly<br /><em className="not-italic text-[#C4909A]">belong.</em>
          </p>
          <ul className="space-y-4">
            {[
              'Compatibility-based matching, not just budget',
              'Verified profiles and safe community',
              'Every background, faith, and identity welcome',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-white/75 text-sm leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C4909A] mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-white/30 text-xs">© {new Date().getFullYear()} Harmony Living</p>
      </div>

      {/* Right panel: form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#fdfbfc] px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 md:hidden text-center">
          <Link href="/" className="inline-flex items-center">
            <span className="font-serif text-2xl font-semibold text-[#1c1b1b]">
              Harmony<span className="text-[#A86472]">.</span>Living
            </span>
          </Link>
        </div>
        <div className="w-full max-w-md animate-fade-up">
          {children}
        </div>
      </div>
    </div>
  );
}
