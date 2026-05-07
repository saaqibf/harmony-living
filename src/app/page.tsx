import Link from 'next/link';

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Tell us about yourself',
    body: 'A few quick questions about your lifestyle, schedule, and what you need in a home.',
  },
  {
    step: '02',
    title: 'Discover your matches',
    body: 'We surface compatible roommates every day — connect with people who fit your world.',
  },
  {
    step: '03',
    title: 'Move in together',
    body: 'Chat, meet up, and find your perfect living situation. It really is that simple.',
  },
];

const TESTIMONIALS = [
  {
    quote: "Found my perfect roommate in under a week. Harmony actually gets what matters to me.",
    name: 'Jordan M.',
    city: 'Calgary, AB',
  },
  {
    quote: "The compatibility matching is unlike anything I've seen. My roommate and I are genuinely great friends now.",
    name: 'Priya K.',
    city: 'Calgary, AB',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fdf8f7]">
      {/* Nav */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-[#cfc5bd] sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10 flex items-center justify-between h-16">
          <span className="font-serif font-semibold text-xl text-[#1c1b1b]">
            Harmony<span className="text-[#c96d4d]">.</span>Living
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm font-medium text-[#4c4640] hover:text-[#1c1b1b] px-4 py-2 rounded-lg hover:bg-[#f1edec] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-[#1c1916] text-white px-5 py-2.5 rounded-lg hover:bg-[#2e2b28] transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#f7f3f1] text-[#b05e3d] text-xs font-semibold px-4 py-2 rounded-full border border-[#cfc5bd] mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c96d4d]" />
              Now live in Calgary, AB
            </div>

            <h1 className="font-serif font-semibold text-[#1c1b1b] text-5xl md:text-[56px] leading-[1.1] mb-6">
              Find a home<br />
              where you truly<br />
              <em className="text-[#c96d4d] not-italic">belong.</em>
            </h1>

            <p className="text-[#4c4640] text-lg leading-relaxed mb-8 max-w-md">
              Harmony matches you with roommates based on how you actually live — not just what you can afford. Welcoming to absolutely everyone.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-[#1c1916] text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-[#2e2b28] transition-colors text-sm"
              >
                Find your match — it&apos;s free
              </Link>
              <Link
                href="/listings"
                className="inline-flex items-center justify-center bg-white text-[#1c1b1b] font-medium px-7 py-3.5 rounded-xl border border-[#cfc5bd] hover:bg-[#f1edec] transition-colors text-sm"
              >
                Browse rooms
              </Link>
            </div>

            <p className="text-xs text-[#7d766f]">No credit card required · Takes 3 minutes</p>
          </div>

          {/* Illustration grid */}
          <div className="hidden md:grid grid-cols-2 gap-3 h-[440px]">
            <div className="bg-[#cfc5bd] rounded-2xl col-span-1 row-span-2 overflow-hidden relative flex flex-col justify-end p-5">
              <div className="absolute inset-0 bg-gradient-to-br from-[#c96d4d]/20 to-[#2d4a3e]/30" />
              <div className="relative">
                <p className="text-white font-serif font-semibold text-lg">Amara, 29</p>
                <p className="text-white/70 text-xs">Nurse · Calgary NW</p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">Cat lover</span>
                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">Early riser</span>
                </div>
              </div>
            </div>
            <div className="bg-[#2d4a3e] rounded-2xl overflow-hidden relative flex flex-col justify-end p-4">
              <div className="relative">
                <p className="text-white font-serif text-base font-semibold">Sarah, 26</p>
                <p className="text-white/70 text-xs">Engineer · Calgary</p>
              </div>
            </div>
            <div className="bg-[#f7f3f1] rounded-2xl flex flex-col items-center justify-center p-4 border border-[#cfc5bd]">
              <div className="w-10 h-10 rounded-full bg-[#c96d4d] flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-[#1c1b1b]">It&apos;s a match!</p>
              <p className="text-[10px] text-[#7d766f]">94% compatible</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-[#cfc5bd] py-20 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#c96d4d] text-xs font-semibold uppercase tracking-widest mb-3">How it works</p>
            <h2 className="font-serif font-semibold text-[#1c1b1b] text-3xl md:text-4xl">Finding harmony is simple</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="relative">
                <span className="text-8xl font-bold text-[#f1edec] leading-none select-none absolute -top-4 -left-2">{s.step}</span>
                <div className="relative pt-8">
                  <h3 className="font-serif font-semibold text-[#1c1b1b] text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-[#4c4640] leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#c96d4d] text-xs font-semibold uppercase tracking-widest mb-3">Our promise</p>
            <h2 className="font-serif font-semibold text-[#1c1b1b] text-3xl md:text-4xl">Built for real life</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: '🔍', title: 'Compatibility first', body: 'Lifestyle, schedule, cleanliness, and values — matched thoughtfully, not randomly.' },
              { icon: '🛡️', title: 'Safe and trusted', body: 'ID verification and clear reporting keep our community kind and trustworthy.' },
              { icon: '🌍', title: 'Everyone belongs', body: 'Every background, faith, and identity is welcome here. No exceptions, ever.' },
            ].map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-7 border border-[#cfc5bd]">
                <div className="w-12 h-12 rounded-xl bg-[#f1edec] flex items-center justify-center text-2xl mb-5">{v.icon}</div>
                <h3 className="font-serif font-semibold text-[#1c1b1b] text-lg mb-2">{v.title}</h3>
                <p className="text-sm text-[#4c4640] leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white border-y border-[#cfc5bd] py-20 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#c96d4d] text-xs font-semibold uppercase tracking-widest mb-3">Stories</p>
            <h2 className="font-serif font-semibold text-[#1c1b1b] text-3xl md:text-4xl">Real people, real harmony</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-[#fdf8f7] rounded-2xl p-7 border border-[#cfc5bd]">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} className="w-4 h-4 text-[#c96d4d]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <p className="font-serif text-[#1c1b1b] text-lg leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <p className="text-sm text-[#7d766f]">— {t.name}, {t.city}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-10 py-20">
        <div className="max-w-2xl mx-auto bg-[#1c1916] rounded-2xl px-8 py-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 -translate-x-1/3 translate-y-1/3" />
          <div className="relative">
            <h2 className="font-serif font-semibold text-white text-3xl md:text-4xl mb-3">Ready to find your person?</h2>
            <p className="text-white/80 text-sm mb-8 leading-relaxed">Join thousands finding harmony in their homes.</p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-white text-[#1c1916] font-semibold px-8 py-3.5 rounded-xl hover:bg-[#fdf8f7] transition-colors text-sm"
            >
              Create your free account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#cfc5bd] px-6 md:px-10 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-serif font-semibold text-[#1c1b1b] text-lg">
            Harmony<span className="text-[#c96d4d]">.</span>Living
          </span>
          <p className="text-sm text-[#7d766f]">
            © {new Date().getFullYear()} Harmony Living · Calgary, AB ·{' '}
            <Link href="/login" className="hover:text-[#c96d4d] transition-colors">Log in</Link>
            {' / '}
            <Link href="/signup" className="hover:text-[#c96d4d] transition-colors">Sign up</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
