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
    <div className="min-h-screen bg-[#fdfbfc]">
      {/* Nav */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-[#e8cede] sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10 flex items-center justify-between h-16">
          <span className="font-serif font-semibold text-xl text-[#1c1b1b]">
            Harmony<span className="text-[#7B2D5C]">.</span>Living
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm font-medium text-[#4c4640] hover:text-[#1c1b1b] px-4 py-2 rounded-lg hover:bg-[#fdf4f9] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-[#7B2D5C] text-white px-5 py-2.5 rounded-lg hover:bg-[#5A1F43] transition-colors"
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
            <div
              className="inline-flex items-center gap-2 bg-[#fdf4f9] text-[#7B2D5C] text-xs font-semibold px-4 py-2 rounded-full border border-[#e8cede] mb-8 animate-fade-in"
              style={{ animationDelay: '0s' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#7B2D5C]" />
              Now live in Calgary, AB
            </div>

            <h1
              className="font-serif font-bold text-[#1c1b1b] text-5xl md:text-[60px] leading-[1.05] mb-6 animate-fade-up"
              style={{ animationDelay: '0.1s' }}
            >
              Find a home<br />
              where you truly<br />
              <em className="text-[#7B2D5C] not-italic">belong.</em>
            </h1>

            <p
              className="text-[#4c4640] text-lg leading-relaxed mb-8 max-w-md animate-fade-up"
              style={{ animationDelay: '0.2s' }}
            >
              Harmony matches you with roommates based on how you actually live — not just what you can afford. Welcoming to absolutely everyone.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-3 mb-8 animate-fade-up"
              style={{ animationDelay: '0.3s' }}
            >
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-[#7B2D5C] text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-[#5A1F43] transition-colors text-sm"
              >
                Find your match — it&apos;s free
              </Link>
              <Link
                href="/listings"
                className="inline-flex items-center justify-center bg-white text-[#1c1b1b] font-medium px-7 py-3.5 rounded-xl border border-[#cfc5bd] hover:bg-[#fdf4f9] hover:border-[#e8cede] transition-colors text-sm"
              >
                Browse rooms
              </Link>
            </div>

            <p className="text-xs text-[#7d766f] animate-fade-in" style={{ animationDelay: '0.4s' }}>
              No credit card required · Takes 3 minutes
            </p>
          </div>

          {/* Illustration grid */}
          <div
            className="hidden md:grid grid-cols-2 gap-3 h-[440px] animate-fade-up"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="bg-gradient-to-br from-[#7B2D5C] to-[#1A0A14] rounded-2xl col-span-1 row-span-2 overflow-hidden relative flex flex-col justify-end p-5">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="relative">
                <p className="text-white font-serif font-semibold text-lg">Amara, 29</p>
                <p className="text-white/70 text-xs">Nurse · Calgary NW</p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] bg-white/15 text-white px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/20">Cat lover</span>
                  <span className="text-[10px] bg-white/15 text-white px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/20">Early riser</span>
                </div>
              </div>
            </div>
            <div className="bg-[#2d4a3e] rounded-2xl overflow-hidden relative flex flex-col justify-end p-4">
              <div className="relative">
                <p className="text-white font-serif text-base font-semibold">Sarah, 26</p>
                <p className="text-white/70 text-xs">Engineer · Calgary</p>
              </div>
            </div>
            <div className="bg-[#fdf4f9] rounded-2xl flex flex-col items-center justify-center p-4 border border-[#e8cede]">
              <div className="w-10 h-10 rounded-full bg-[#7B2D5C] flex items-center justify-center mb-2">
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
      <section className="bg-white border-y border-[#e8cede] py-20 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#7B2D5C] text-xs font-semibold uppercase tracking-widest mb-3">How it works</p>
            <h2 className="font-serif font-semibold text-[#1c1b1b] text-3xl md:text-4xl">Finding harmony is simple</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="relative">
                <span className="text-7xl font-bold text-[#7B2D5C]/10 leading-none select-none absolute -top-4 -left-2 font-mono">{s.step}</span>
                <div className="relative pt-8">
                  <div className="w-8 h-8 rounded-full bg-[#7B2D5C] text-white flex items-center justify-center text-xs font-bold font-mono mb-4">{s.step}</div>
                  <h3 className="font-serif font-semibold text-[#1c1b1b] text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-[#4c4640] leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 md:px-10 bg-gradient-to-b from-[#fdfbfc] to-[#fdf4f9]/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#7B2D5C] text-xs font-semibold uppercase tracking-widest mb-3">Our promise</p>
            <h2 className="font-serif font-semibold text-[#1c1b1b] text-3xl md:text-4xl">Built for real life</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: '🔍', title: 'Compatibility first', body: 'Lifestyle, schedule, cleanliness, and values — matched thoughtfully, not randomly.' },
              { icon: '🛡️', title: 'Safe and trusted', body: 'ID verification and clear reporting keep our community kind and trustworthy.' },
              { icon: '🌍', title: 'Everyone belongs', body: 'Every background, faith, and identity is welcome here. No exceptions, ever.' },
            ].map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-7 border border-[#e8cede] hover:shadow-sm transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-[#fdf4f9] flex items-center justify-center text-2xl mb-5">{v.icon}</div>
                <h3 className="font-serif font-semibold text-[#1c1b1b] text-lg mb-2">{v.title}</h3>
                <p className="text-sm text-[#4c4640] leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white border-y border-[#e8cede] py-20 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#7B2D5C] text-xs font-semibold uppercase tracking-widest mb-3">Stories</p>
            <h2 className="font-serif font-semibold text-[#1c1b1b] text-3xl md:text-4xl">Real people, real harmony</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-[#fdf4f9] rounded-2xl p-7 border border-[#e8cede]">
                <div className="text-3xl text-[#7B2D5C] font-serif leading-none mb-4">&ldquo;</div>
                <p className="font-serif text-[#1c1b1b] text-lg leading-relaxed mb-4">{t.quote}&rdquo;</p>
                <p className="text-sm text-[#7d766f]">— {t.name}, {t.city}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-10 py-20">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-[#7B2D5C] to-[#1A0A14] rounded-2xl px-8 py-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-white/5 -translate-x-1/3 translate-y-1/3" />
          <div className="relative">
            <h2 className="font-serif font-semibold text-white text-3xl md:text-4xl mb-3">Ready to find your person?</h2>
            <p className="text-white/70 text-sm mb-8 leading-relaxed">Join thousands finding harmony in their homes.</p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-white text-[#7B2D5C] font-semibold px-8 py-3.5 rounded-xl hover:bg-[#fdf4f9] transition-colors text-sm"
            >
              Create your free account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e8cede] px-6 md:px-10 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-serif font-semibold text-[#1c1b1b] text-lg">
            Harmony<span className="text-[#7B2D5C]">.</span>Living
          </span>
          <p className="text-sm text-[#7d766f]">
            © {new Date().getFullYear()} Harmony Living · Calgary, AB ·{' '}
            <Link href="/login" className="hover:text-[#7B2D5C] transition-colors">Log in</Link>
            {' / '}
            <Link href="/signup" className="hover:text-[#7B2D5C] transition-colors">Sign up</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
