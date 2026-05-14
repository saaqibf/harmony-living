import Link from 'next/link';
import { requireDbUser } from '@/lib/auth/session';

const INFO_CARDS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
    title: 'Daily picks',
    desc: 'Every morning we surface your top 3 most compatible roommate candidates. No endless scrolling.',
    color: '#c96d4d',
    bg: '#fff5f2',
    border: '#f5d4c8',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Verified circle',
    desc: 'Everyone here has passed ID verification. Photos blur until you connect, keeping your privacy protected.',
    color: '#2d4a3e',
    bg: '#edf4f1',
    border: '#c4dbd4',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: 'Safety toolkit',
    desc: 'Plan safe first meetings, send location check-ins, and block anyone with one tap.',
    color: '#A86472',
    bg: '#F9F0EE',
    border: '#E8D5D0',
  },
];

export default async function WelcomePage() {
  await requireDbUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F0EE] via-[#fdfbfc] to-[#F5EAE4] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <p className="text-center font-serif text-lg font-semibold text-[#1c1b1b] mb-10">
          Harmony<span className="text-[#A86472]">.</span>Living
        </p>

        {/* Eyebrow */}
        <p className="text-center text-[10px] font-mono tracking-widest uppercase text-[#C4909A] mb-3">
          You&apos;re in
        </p>

        {/* Headline */}
        <h1 className="text-center text-4xl font-serif font-semibold text-[#1c1b1b] leading-tight mb-3">
          Welcome to Harmony.
        </h1>

        {/* Subtext */}
        <p className="text-center text-sm text-[#7d766f] mb-8 leading-relaxed max-w-xs mx-auto">
          We&apos;ve already found 10 people who match your lifestyle and values. They&apos;re waiting in your daily picks.
        </p>

        {/* Info cards */}
        <div className="space-y-3 mb-8">
          {INFO_CARDS.map((card) => (
            <div
              key={card.title}
              className="flex items-start gap-4 rounded-2xl border p-4"
              style={{ background: card.bg, borderColor: card.border }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'white', color: card.color }}
              >
                {card.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1c1b1b] mb-0.5">{card.title}</p>
                <p className="text-xs text-[#4c4640] leading-relaxed">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/discover"
            className="w-full bg-[#A86472] text-white font-semibold text-sm py-3.5 rounded-xl hover:bg-[#8A505E] active:scale-95 transition-all text-center"
          >
            Open today&apos;s picks →
          </Link>
          <Link
            href="/dashboard"
            className="w-full border border-[#cfc5bd] text-[#4c4640] font-semibold text-sm py-3.5 rounded-xl hover:bg-white active:scale-95 transition-all text-center"
          >
            See my dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
