import Link from 'next/link';

const HOW_IT_WORKS = [
  {
    num: '01',
    icon: '✍️',
    title: 'Tell us about yourself',
    body: 'A few quick questions about your lifestyle, schedule, and what you need in a home.',
    color: 'bg-amber-50 border-amber-100 text-amber-600',
  },
  {
    num: '02',
    icon: '✨',
    title: 'Discover your matches',
    body: 'We surface compatible roommates every day — swipe to connect with people who fit your world.',
    color: 'bg-teal-50 border-teal-100 text-teal-600',
  },
  {
    num: '03',
    icon: '🏡',
    title: 'Move in together',
    body: 'Chat, meet up, and find your perfect living situation. It really is that simple.',
    color: 'bg-rose-50 border-rose-100 text-rose-500',
  },
];

const VALUES = [
  {
    emoji: '🔍',
    title: 'Compatibility first',
    body: 'Lifestyle, schedule, cleanliness, and values — matched thoughtfully, not randomly.',
  },
  {
    emoji: '🛡️',
    title: 'Safe and trusted',
    body: 'ID verification and clear reporting keep our community kind and trustworthy.',
  },
  {
    emoji: '🌍',
    title: 'Everyone belongs',
    body: 'Every background, faith, and identity is welcome here. No exceptions, ever.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* ── NAV ── */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-stone-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-5 md:px-10 flex items-center justify-between h-16">
          <span className="text-xl font-extrabold text-gray-900 tracking-tight">
            harmony<span className="text-teal-600">.</span>living
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm font-semibold text-stone-500 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-stone-100 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-bold bg-teal-600 text-white px-5 py-2.5 rounded-2xl hover:bg-teal-700 active:scale-95 transition-all shadow-md shadow-teal-600/20"
            >
              Join free →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-stone-50 to-teal-50">
        {/* Warm decorative blobs */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-teal-100 opacity-40 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-amber-100 opacity-50 -translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-5 md:px-10 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid md:grid-cols-5 gap-12 items-center">
            {/* Copy */}
            <div className="md:col-span-3">
              <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-xs font-bold px-4 py-2 rounded-full border border-teal-100 mb-7">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                Now live · Calgary, AB
              </div>

              <h1 className="text-5xl md:text-[60px] font-extrabold text-gray-900 leading-[1.06] tracking-tight mb-6">
                Your next home.<br />
                <span className="text-teal-600">Your kind of people.</span>
              </h1>

              <p className="text-[17px] text-stone-500 leading-relaxed mb-9 max-w-lg">
                Harmony matches you with roommates based on how you actually live —
                not just what you can afford. Welcoming to absolutely everyone.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center bg-teal-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-teal-700 active:scale-[0.98] transition-all shadow-lg shadow-teal-600/25 text-base"
                >
                  Get started — it&apos;s free
                </Link>
                <Link
                  href="/listings"
                  className="inline-flex items-center justify-center bg-white text-gray-700 font-semibold px-8 py-4 rounded-2xl hover:bg-stone-50 border border-stone-200 transition-colors text-base shadow-sm"
                >
                  Browse rooms
                </Link>
              </div>

              <div className="flex items-center gap-5">
                <p className="text-xs text-stone-400">No credit card required · Takes 3 minutes</p>
                <div className="flex -space-x-2">
                  {['from-amber-300 to-orange-400', 'from-teal-400 to-teal-600', 'from-violet-400 to-purple-600'].map((g, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full bg-gradient-to-br ${g} border-2 border-white`} />
                  ))}
                  <div className="w-7 h-7 rounded-full bg-stone-100 border-2 border-white flex items-center justify-center">
                    <span className="text-[9px] font-bold text-stone-500">+2k</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card collage */}
            <div className="md:col-span-2 hidden md:flex items-center justify-center">
              <div className="relative w-full h-[420px]">
                {/* Card — back left */}
                <div className="absolute left-0 top-8 w-40 h-56 rounded-3xl bg-gradient-to-br from-amber-200 via-orange-300 to-rose-300 shadow-xl rotate-[-7deg] overflow-hidden flex flex-col justify-end p-4">
                  <div className="flex gap-1.5 mb-2 flex-wrap">
                    <span className="bg-white/30 text-white text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">Nurse</span>
                    <span className="bg-white/30 text-white text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">Cat lover</span>
                  </div>
                  <p className="text-white font-bold text-sm leading-none">Amara, 29</p>
                  <p className="text-white/60 text-[10px] mt-0.5">📍 Calgary NW</p>
                </div>

                {/* Card — front center (teal) */}
                <div
                  className="absolute left-1/2 top-4 -translate-x-1/2 z-10 w-48 rounded-3xl bg-gradient-to-br from-teal-400 via-teal-500 to-teal-700 shadow-2xl rotate-[2deg] overflow-hidden flex flex-col justify-end p-5"
                  style={{ height: 280 }}
                >
                  <div className="absolute top-4 left-4 bg-emerald-400 rounded-full px-2.5 py-0.5 flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span className="text-white text-[10px] font-bold">Active</span>
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">♥</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    <span className="bg-white/25 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">Engineer</span>
                    <span className="bg-white/25 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">Early bird</span>
                  </div>
                  <p className="text-white font-extrabold text-xl leading-tight">Sarah, 26</p>
                  <p className="text-white/70 text-xs mt-1">📍 Calgary, AB</p>
                </div>

                {/* Card — back right */}
                <div
                  className="absolute right-0 top-14 rounded-3xl bg-gradient-to-br from-violet-300 via-purple-400 to-indigo-500 shadow-xl rotate-[9deg] overflow-hidden flex flex-col justify-end p-4"
                  style={{ width: 152, height: 212 }}
                >
                  <div className="flex gap-1.5 mb-2">
                    <span className="bg-white/30 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Student</span>
                    <span className="bg-white/30 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Yoga</span>
                  </div>
                  <p className="text-white font-bold text-sm leading-none">Priya, 23</p>
                  <p className="text-white/60 text-[10px] mt-0.5">📍 Calgary</p>
                </div>

                {/* Match banner */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 bg-white rounded-2xl shadow-xl px-5 py-3 flex items-center gap-3 border border-stone-100 whitespace-nowrap">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">It&apos;s a match!</p>
                    <p className="text-xs text-stone-400">94% compatible</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white border-y border-stone-100 py-16 px-5 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-teal-600 text-sm font-bold uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Finding harmony is easy</h2>
            <p className="text-stone-500 text-lg">Three steps to your perfect living match.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.num} className="relative">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl border text-2xl mb-5 ${s.color}`}>
                  {s.icon}
                </div>
                <span className="absolute top-0 right-0 text-7xl font-black text-stone-100 leading-none select-none">
                  {s.num}
                </span>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-16 px-5 md:px-10 bg-gradient-to-b from-stone-50 to-amber-50/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-teal-600 text-sm font-bold uppercase tracking-widest mb-3">Our promise</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Built for real life</h2>
            <p className="text-stone-500 text-lg">Finding a roommate should feel good, not stressful.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="bg-white rounded-3xl p-7 border border-stone-100 shadow-sm hover:shadow-md hover:border-teal-100 transition-all group cursor-default"
              >
                <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center text-3xl mb-5 group-hover:bg-teal-50 transition-colors">
                  {v.emoji}
                </div>
                <h3 className="font-bold text-gray-900 text-[17px] mb-2">{v.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="bg-white border-y border-stone-100 py-12 px-5 md:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
          </div>
          <p className="text-gray-900 text-xl font-semibold mb-3 max-w-xl mx-auto leading-snug">
            &ldquo;Found my perfect roommate in under a week. Harmony actually gets what matters to me.&rdquo;
          </p>
          <p className="text-stone-400 text-sm font-medium">— Jordan M., Calgary</p>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="px-5 md:px-10 py-16">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl px-8 py-14 text-center shadow-xl shadow-teal-600/25 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white -translate-x-1/3 translate-y-1/3" />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-extrabold text-white mb-3">Ready to find your person?</h2>
            <p className="text-teal-100 text-lg mb-8 leading-relaxed">
              Join thousands of people finding harmony in their homes.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-white text-teal-700 font-bold px-10 py-4 rounded-2xl hover:bg-teal-50 transition-colors shadow-lg text-base"
            >
              Create your free account →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-stone-100 px-5 md:px-10 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-extrabold text-gray-900 text-lg">
            harmony<span className="text-teal-600">.</span>living
          </span>
          <p className="text-sm text-stone-400">
            © {new Date().getFullYear()} Harmony Living · Calgary, AB ·{' '}
            <Link href="/login" className="hover:text-teal-600 transition-colors">Log in</Link>
            {' / '}
            <Link href="/signup" className="hover:text-teal-600 transition-colors">Sign up</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
