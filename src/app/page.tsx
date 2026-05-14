import Link from 'next/link';
import { LandingHero } from './_components/LandingHero';
import { LandingSections } from './_components/LandingSections';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F2E6E0] font-serif">

      {/* Nav */}
      <nav className="bg-[#F2E6E0]/95 backdrop-blur-sm sticky top-0 z-20 border-b border-[#E8D5D0]/60">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between h-16">
          <span className="font-serif font-semibold text-xl text-[#1c1b1b] tracking-tight">
            Harmony Living
          </span>
          <div className="flex items-center gap-1">
            <Link
              href="/login"
              className="text-sm font-medium text-[#4c4640] hover:text-[#1c1b1b] px-4 py-2 rounded-lg transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-[#A86472] text-white px-5 py-2 rounded-full hover:bg-[#8A505E] transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <LandingHero />
      <LandingSections />

      {/* Footer */}
      <footer className="border-t border-[#E8D5D0] px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-serif font-semibold text-[#1c1b1b] text-lg">Harmony Living</span>
          <p className="text-sm text-[#7d766f]">
            &copy; {new Date().getFullYear()} Harmony Living &middot; Calgary, AB &middot;{' '}
            <Link href="/login" className="hover:text-[#A86472] transition-colors">Log in</Link>
            {' / '}
            <Link href="/signup" className="hover:text-[#A86472] transition-colors">Sign up</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
