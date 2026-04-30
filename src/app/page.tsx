import Link from 'next/link';

const features = [
  {
    icon: '🔍',
    title: 'Deep compatibility',
    body: 'Matched on lifestyle, schedule, cleanliness, and values — not just price and location.',
  },
  {
    icon: '✅',
    title: 'Verified community',
    body: 'ID checks and clear reporting so you can trust everyone you meet.',
  },
  {
    icon: '🤝',
    title: 'Inclusive by design',
    body: 'Every background, faith, and identity is welcome. Your preferences, respected.',
  },
];

const steps = [
  { num: '01', title: 'Build your profile', body: 'Answer a few questions about your lifestyle and what you\'re looking for in a roommate.' },
  { num: '02', title: 'Discover matches', body: 'Swipe through compatible roommates curated for you daily — like and connect.' },
  { num: '03', title: 'Chat & move in', body: 'Match, start a conversation, and find your perfect living situation.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
        <span className="text-xl font-bold text-gray-900 tracking-tight">
          harmony<span className="text-teal-600">.</span>living
        </span>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-teal-600 text-white px-5 py-2.5 rounded-xl hover:bg-teal-700 active:scale-95 transition-all shadow-sm"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left — copy */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span className="text-xs font-semibold text-teal-700 uppercase tracking-wide">Calgary · AB</span>
            </div>

            <h1 className="text-5xl md:text-[3.75rem] font-bold text-gray-900 leading-[1.08] tracking-tight">
              Find a home.<br />
              Find a roommate.<br />
              <span className="text-teal-600">Find harmony.</span>
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed max-w-md">
              Compatibility-based roommate matching. Meet people who share your lifestyle,
              values, and schedule — not just your budget.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-teal-600 text-white font-semibold px-8 py-4 rounded-2xl text-base hover:bg-teal-700 active:scale-95 transition-all shadow-lg shadow-teal-600/25"
              >
                Get started — it&apos;s free
              </Link>
              <Link
                href="/listings"
                className="inline-flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-2xl text-base hover:bg-gray-100 transition-colors"
              >
                Browse rooms
              </Link>
            </div>

            <p className="text-xs text-gray-400">No credit card required · Takes 3 minutes</p>
          </div>

          {/* Right — CSS app mockup */}
          <div className="flex justify-center md:justify-end items-center">
            <div className="relative w-[280px] h-[560px]">
              {/* Phone body */}
              <div className="absolute inset-0 bg-gray-900 rounded-[44px] shadow-2xl border-[8px] border-gray-800 overflow-hidden">
                {/* Teal status bar */}
                <div className="bg-teal-700 h-10 flex items-center justify-between px-5 shrink-0">
                  <span className="text-white/80 text-[11px] font-semibold">9:41</span>
                  <div className="w-20 h-4 bg-gray-900 rounded-full" />
                  <div className="flex gap-1 items-center">
                    <div className="w-3 h-1.5 rounded-sm bg-white/40" />
                    <div className="w-1 h-1.5 rounded-sm bg-white/40" />
                  </div>
                </div>

                {/* App screen */}
                <div className="bg-gray-50 h-full flex flex-col">
                  {/* Discover card */}
                  <div className="mx-3 mt-3 rounded-2xl overflow-hidden shadow-lg bg-white flex-shrink-0" style={{ height: 320 }}>
                    {/* Photo gradient */}
                    <div className="relative bg-gradient-to-br from-teal-300 via-teal-500 to-teal-700" style={{ height: 210 }}>
                      <div className="absolute top-2.5 right-2.5 bg-emerald-400 rounded-full px-2 py-0.5 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-white" />
                        <span className="text-white text-[9px] font-bold">Active</span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                          <span className="text-3xl">👤</span>
                        </div>
                      </div>
                      {/* Overlay */}
                      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/60 to-transparent flex items-end px-3 pb-2">
                        <div>
                          <p className="text-white font-bold text-sm leading-none">Sarah, 26</p>
                          <p className="text-white/70 text-[10px]">Calgary, AB</p>
                        </div>
                      </div>
                    </div>
                    {/* Card body */}
                    <div className="p-3">
                      <div className="flex gap-1.5 flex-wrap mb-2">
                        <span className="bg-teal-50 text-teal-700 text-[9px] font-bold px-2 py-0.5 rounded-full">UX Designer</span>
                        <span className="bg-gray-100 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded-full">Non-smoker</span>
                        <span className="bg-gray-100 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded-full">Pet-free</span>
                      </div>
                      <p className="text-gray-400 text-[10px] leading-relaxed line-clamp-2">Looking for a quiet, respectful roommate in NW Calgary.</p>
                    </div>
                    {/* Swipe row */}
                    <div className="flex justify-center gap-6 px-3">
                      <div className="w-11 h-11 rounded-full bg-white border border-red-100 shadow flex items-center justify-center">
                        <span className="text-red-400 text-base">✕</span>
                      </div>
                      <div className="w-11 h-11 rounded-full bg-teal-600 shadow-md shadow-teal-500/30 flex items-center justify-center">
                        <span className="text-white text-base">♥</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom nav mock */}
                  <div className="mt-auto border-t border-gray-100 bg-white flex justify-around px-2 py-2">
                    {['🏠', '🔍', '💫', '💬', '👤'].map((icon, i) => (
                      <div key={i} className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg ${i === 1 ? 'bg-teal-50' : ''}`}>
                        <span className="text-sm">{icon}</span>
                        {i === 1 && <span className="w-1 h-1 rounded-full bg-teal-500" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating match card */}
              <div className="absolute -right-6 top-16 bg-white rounded-2xl shadow-xl px-3 py-2.5 w-44 border border-gray-100 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-sm shrink-0">🎉</div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-900 leading-none">It&apos;s a match!</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">You &amp; Sarah connected</p>
                  </div>
                </div>
              </div>

              {/* Floating compatibility */}
              <div className="absolute -left-10 bottom-28 bg-white rounded-2xl shadow-xl px-3 py-2.5 border border-gray-100 z-10">
                <p className="text-[9px] text-gray-400 mb-1 font-medium uppercase tracking-wide">Compatibility</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-teal-600">94</span>
                  <span className="text-xs text-gray-400 font-semibold">%</span>
                </div>
                <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1.5">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Built differently</h2>
          <p className="text-gray-500 text-lg">Not another classified ads board.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-gray-50 rounded-2xl p-7 border border-gray-100 hover:border-teal-200 hover:bg-teal-50/40 transition-all group cursor-default"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl mb-5 shadow-sm group-hover:shadow-md transition-shadow">
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-base">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — dark section */}
      <section className="bg-gray-900 px-6 md:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">How it works</h2>
            <p className="text-gray-400 text-lg">From sign-up to move-in in days.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((s) => (
              <div key={s.num}>
                <div className="text-7xl font-black text-teal-600/20 mb-4 leading-none">{s.num}</div>
                <h3 className="font-bold text-white mb-2 text-lg">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-14 text-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white font-bold px-10 py-4 rounded-2xl text-base hover:bg-teal-500 transition-colors shadow-lg shadow-teal-600/30"
            >
              Start now →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 md:px-12 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-lg font-bold text-gray-900">
            harmony<span className="text-teal-600">.</span>living
          </span>
          <p className="text-sm text-gray-400">
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
