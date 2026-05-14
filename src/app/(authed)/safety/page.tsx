import Link from 'next/link';
import { requireDbUser } from '@/lib/auth/session';

const FEATURE_CARDS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    iconBg: '#edf4f1',
    iconColor: '#2d4a3e',
    title: 'ID-verified members',
    desc: 'Every active member has passed government ID verification before messaging.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    iconBg: '#F9F0EE',
    iconColor: '#A86472',
    title: 'Photo blur by default',
    desc: 'Profile photos are blurred until you mutually connect, keeping your face private until you choose.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    iconBg: '#F5EAE4',
    iconColor: '#4c4640',
    title: 'Female-only mode',
    desc: 'Toggle this in Privacy settings to only see and be seen by women. No exceptions.',
  },
];

const MEET_STEPS = [
  'Suggest a public place: coffee shop, library, or busy park.',
  'Tell a trusted friend where you\'re going and when.',
  'Meet during daytime on your first in-person visit.',
  'Keep your first meeting short (30-45 min). You can always extend.',
  'Trust your gut. You can leave at any time, no explanation needed.',
];

export default async function SafetyPage() {
  await requireDbUser();

  return (
    <div className="bg-[#F2E6E0] min-h-screen">
      <div className="bg-white border-b border-[#cfc5bd] px-6 pt-8 pb-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">Safety center</h1>
          <p className="text-sm text-[#7d766f] mt-1">
            Harmony is built for women. Every feature here is designed with your safety first.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Feature cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {FEATURE_CARDS.map((card) => (
            <div key={card.title} className="bg-white rounded-2xl border border-[#cfc5bd] p-5">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                style={{ background: card.iconBg, color: card.iconColor }}
              >
                {card.icon}
              </div>
              <p className="text-sm font-semibold text-[#1c1b1b] mb-1">{card.title}</p>
              <p className="text-xs text-[#7d766f] leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Meeting in person checklist */}
        <div className="bg-white rounded-2xl border border-[#cfc5bd] p-5">
          <p className="text-[10px] font-mono tracking-widest uppercase text-[#C4909A] mb-3">Meeting in person</p>
          <h2 className="text-base font-semibold text-[#1c1b1b] mb-4">Before you meet, do these 5 things</h2>
          <ol className="space-y-3">
            {MEET_STEPS.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#F9F0EE] border border-[#E8D5D0] flex items-center justify-center text-xs font-mono font-bold text-[#A86472] shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-[#4c4640] leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
          <div className="mt-5 pt-4 border-t border-[#EFE0D8]">
            <Link
              href="/meet"
              className="inline-flex items-center gap-2 bg-[#A86472] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#8A505E] active:scale-95 transition-all"
            >
              Plan a safe meeting →
            </Link>
          </div>
        </div>

        {/* Two-column: Report + Resources */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Report / Block */}
          <div className="bg-white rounded-2xl border border-[#cfc5bd] p-5">
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#C4909A] mb-3">Report &amp; Block</p>
            <p className="text-sm text-[#4c4640] leading-relaxed mb-4">
              See something wrong? You can report any profile or block a user at any time. Our team reviews every report within 24 hours.
            </p>
            <p className="text-xs text-[#7d766f] mb-4">
              Blocking is immediate and silent. The person will not be notified.
            </p>
            <button className="w-full text-sm font-semibold text-[#c96d4d] border border-[#c96d4d] rounded-xl py-2.5 hover:bg-[#fff5f2] transition-colors">
              Report a user
            </button>
          </div>

          {/* External resources */}
          <div className="bg-white rounded-2xl border border-[#cfc5bd] p-5">
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#C4909A] mb-3">Resources</p>
            <div className="space-y-3">
              <a
                href="https://www.thehotline.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#edf4f1] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-[#2d4a3e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1c1b1b] group-hover:text-[#A86472] transition-colors">National Domestic Violence Hotline</p>
                  <p className="text-xs text-[#7d766f]">thehotline.org · 1-800-799-7233</p>
                </div>
              </a>
              <a
                href="https://www.alberta.ca/rental-homes"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#F5EAE4] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-[#4c4640]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1c1b1b] group-hover:text-[#A86472] transition-colors">Alberta Renter Rights</p>
                  <p className="text-xs text-[#7d766f]">alberta.ca/rental-homes</p>
                </div>
              </a>
              <a
                href="https://www.crisistextline.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#F9F0EE] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-[#A86472]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1c1b1b] group-hover:text-[#A86472] transition-colors">Crisis Text Line</p>
                  <p className="text-xs text-[#7d766f]">crisistextline.org · Text HOME to 741741</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
