import Link from 'next/link';

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

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* Left: copy */}
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 text-[#A86472] text-xs font-semibold tracking-widest uppercase mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A86472] animate-pulse" />
              Now live in Calgary, AB
            </div>

            <h1 className="font-serif font-semibold text-[#1c1b1b] leading-[1.0] mb-8 animate-fade-up" style={{ fontSize: 'clamp(52px, 6vw, 80px)' }}>
              Find your<br />
              people.<br />
              Find your<br />
              <em className="text-[#A86472]">home.</em>
            </h1>

            <p className="text-[#4c4640] text-lg leading-relaxed mb-10 max-w-sm animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Compatibility-based roommate matching for people who actually want to live together.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-[#A86472] text-white font-semibold px-7 py-3.5 rounded-full hover:bg-[#8A505E] transition-colors text-sm"
              >
                Find your match. It&apos;s free.
              </Link>
              <Link
                href="/listings"
                className="inline-flex items-center justify-center text-[#1c1b1b] font-medium px-7 py-3.5 rounded-full border border-[#cfc5bd] hover:bg-white hover:border-[#A86472]/30 transition-colors text-sm"
              >
                Browse rooms
              </Link>
            </div>

            <p className="text-xs text-[#7d766f] animate-fade-in" style={{ animationDelay: '0.25s' }}>
              Free &middot; Takes 3 minutes &middot; No credit card
            </p>
          </div>

          {/* Right: card collage */}
          <div className="hidden md:flex flex-col gap-3 h-[520px] relative animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {/* Large card */}
            <div className="flex gap-3 flex-1">
              <div className="flex-1 rounded-3xl overflow-hidden relative flex flex-col justify-end p-6 bg-gradient-to-b from-[#C4909A] to-[#8A505E]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <div className="relative">
                  <p className="text-white font-serif font-semibold text-xl leading-tight">Amara, 29</p>
                  <p className="text-white/75 text-sm mt-0.5">Nurse &middot; NW Calgary</p>
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/15">Cat lover</span>
                    <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/15">Early riser</span>
                  </div>
                </div>
              </div>

              {/* Right column cards */}
              <div className="w-48 flex flex-col gap-3">
                <div className="flex-1 bg-[#2d4a3e] rounded-3xl flex flex-col justify-end p-5">
                  <p className="text-white font-serif font-semibold leading-tight">Sarah, 26</p>
                  <p className="text-white/65 text-xs mt-0.5">Engineer &middot; Calgary</p>
                </div>
                <div className="h-36 bg-white rounded-3xl flex flex-col items-center justify-center p-4 border border-[#E8D5D0] shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[#F9F0EE] flex items-center justify-center mb-2 ring-4 ring-[#F9F0EE]">
                    <svg className="w-5 h-5 text-[#A86472]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-[#1c1b1b] text-center">It&apos;s a match!</p>
                  <p className="text-[10px] text-[#A86472] font-mono font-semibold mt-0.5">94% compatible</p>
                </div>
              </div>
            </div>

            {/* Bottom strip */}
            <div className="h-20 bg-white rounded-3xl border border-[#E8D5D0] flex items-center px-6 gap-4 shadow-sm">
              <div className="flex -space-x-2">
                {['#E8D5D0', '#d4e8df', '#F5E6D0', '#EFE0D8'].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white" style={{ background: c }} />
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1c1b1b]">2,000+ members in Calgary</p>
                <p className="text-xs text-[#7d766f]">Finding harmony, one home at a time.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-[#E8D5D0]">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div>
              <p className="text-[10px] font-mono tracking-widest uppercase text-[#A86472] mb-3">Process</p>
              <h2 className="font-serif font-semibold text-[#1c1b1b] text-4xl md:text-5xl leading-tight">
                Three steps<br />to home.
              </h2>
            </div>
            <Link href="/signup" className="text-sm text-[#A86472] hover:underline font-medium shrink-0">
              Start now →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-[#E8D5D0]">
            {[
              { step: '01', title: 'Tell us who you are', body: 'Lifestyle, schedule, cleanliness, values. The things that actually matter when you share a home.' },
              { step: '02', title: 'Meet your matches', body: 'We surface compatible people every day. Real compatibility, not just proximity and price.' },
              { step: '03', title: 'Move in together', body: 'Chat, meet, decide. No pressure, no algorithms pushing urgency. Just the right fit.' },
            ].map((s) => (
              <div key={s.step} className="bg-white p-10">
                <span className="font-mono text-5xl font-bold text-[#A86472]/15 block mb-6 leading-none">{s.step}</span>
                <h3 className="font-serif font-semibold text-[#1c1b1b] text-xl mb-3">{s.title}</h3>
                <p className="text-sm text-[#4c4640] leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Harmony */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-[10px] font-mono tracking-widest uppercase text-[#A86472] mb-3">Why us</p>
          <h2 className="font-serif font-semibold text-[#1c1b1b] text-4xl md:text-5xl">Built different.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: (
                <svg className="w-6 h-6 text-[#A86472]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              ),
              title: 'Values-first matching',
              body: 'We look at lifestyle, sleep schedule, cleanliness, and personal values, not just budget.',
            },
            {
              icon: (
                <svg className="w-6 h-6 text-[#2d4a3e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              ),
              title: 'Identity verified',
              body: 'Every member is verified. You always know exactly who you are talking to.',
            },
            {
              icon: (
                <svg className="w-6 h-6 text-[#C4A070]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              ),
              title: 'Mutual connections only',
              body: 'Nobody can message you unless you both connected first. Privacy is built in, not bolted on.',
            },
          ].map((v) => (
            <div key={v.title} className="bg-white rounded-3xl p-8 border border-[#E8D5D0] hover:shadow-sm transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#F9F0EE] flex items-center justify-center mb-6">
                {v.icon}
              </div>
              <h3 className="font-serif font-semibold text-[#1c1b1b] text-xl mb-3">{v.title}</h3>
              <p className="text-sm text-[#4c4640] leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white border-y border-[#E8D5D0]">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <p className="text-[10px] font-mono tracking-widest uppercase text-[#A86472] mb-12">Real stories</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#F9F0EE] rounded-3xl p-10 border border-[#E8D5D0]">
              <p className="font-serif italic text-[#1c1b1b] text-2xl leading-relaxed mb-6">
                &ldquo;Found my perfect roommate in under a week. Harmony actually gets what matters to me.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#E8D5D0]" />
                <div>
                  <p className="text-sm font-semibold text-[#1c1b1b]">Jordan M.</p>
                  <p className="text-xs text-[#7d766f]">Calgary, AB</p>
                </div>
              </div>
            </div>
            <div className="bg-[#F9F0EE] rounded-3xl p-10 border border-[#E8D5D0]">
              <p className="font-serif italic text-[#1c1b1b] text-2xl leading-relaxed mb-6">
                &ldquo;The compatibility matching is unlike anything else. My roommate and I are genuinely great friends now.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#d4e8df]" />
                <div>
                  <p className="text-sm font-semibold text-[#1c1b1b]">Priya K.</p>
                  <p className="text-xs text-[#7d766f]">Calgary, AB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="bg-[#A86472] rounded-3xl px-10 py-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/8 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/8 -translate-x-1/3 translate-y-1/3" />
          <div className="relative">
            <p className="text-white/60 text-xs font-mono tracking-widest uppercase mb-4">Calgary, AB</p>
            <h2 className="font-serif font-semibold text-white text-4xl md:text-5xl mb-4 leading-tight">
              Ready to find<br />your person?
            </h2>
            <p className="text-white/70 text-base mb-10 leading-relaxed">
              Join thousands finding harmony in their homes.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-white text-[#A86472] font-semibold px-9 py-4 rounded-full hover:bg-[#F9F0EE] transition-colors text-sm"
            >
              Create your free account
            </Link>
          </div>
        </div>
      </section>

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
