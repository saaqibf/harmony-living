import Link from 'next/link';
import { requireDbUser } from '@/lib/auth/session';

const REFERENCES = [
  {
    id: 'r1',
    quote: 'Incredibly tidy, respectful of shared spaces, and always paid rent on time. Would absolutely live with her again.',
    reviewer: 'Sara M.',
    relation: 'Former roommate · 2 years',
    date: 'April 2025',
    verified: true,
  },
  {
    id: 'r2',
    quote: 'One of the most considerate people I\'ve shared a home with. She communicates clearly and respects boundaries.',
    reviewer: 'Noor R.',
    relation: 'Former roommate · 8 months',
    date: 'January 2025',
    verified: true,
  },
  {
    id: 'r3',
    quote: 'Super clean, quiet after 10pm, and very kind. I always felt comfortable and safe at home.',
    reviewer: 'Zara K.',
    relation: 'Former housemate · 1 year',
    date: 'September 2024',
    verified: false,
  },
];

export default async function ReferencesPage() {
  await requireDbUser();

  return (
    <div className="bg-[#F2E6E0] min-h-screen">
      <div className="bg-white border-b border-[#cfc5bd] px-6 pt-8 pb-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">References</h1>
          <p className="text-sm text-[#7d766f] mt-0.5">Vouches from people you&apos;ve lived with</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-5">
        {/* Trust banner */}
        <div className="bg-[#edf4f1] border border-[#c4dbd4] rounded-2xl px-5 py-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-[#2d4a3e] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-[#2d4a3e]">References build trust</p>
            <p className="text-xs text-[#4c4640] mt-0.5 leading-relaxed">
              Profiles with 2+ references get 4× more connections. We verify each reference by confirming both parties knew each other.
            </p>
          </div>
        </div>

        {/* Reference cards */}
        <div>
          <p className="text-[10px] font-mono tracking-widest uppercase text-[#C4909A] px-1 mb-3">
            {REFERENCES.length} references
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {REFERENCES.map((ref) => (
              <div key={ref.id} className="bg-white rounded-2xl border border-[#cfc5bd] p-5 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-[#4c4640] leading-relaxed italic mb-4">&ldquo;{ref.quote}&rdquo;</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-[#1c1b1b]">{ref.reviewer}</p>
                    {ref.verified && (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-[#2d4a3e] bg-[#edf4f1] border border-[#c4dbd4] rounded-full px-2 py-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#7d766f]">{ref.relation}</p>
                  <p className="text-[10px] text-[#7d766f] font-mono mt-1">{ref.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add a reference panel */}
        <div className="bg-white rounded-2xl border border-[#cfc5bd] p-5">
          <p className="text-[10px] font-mono tracking-widest uppercase text-[#C4909A] mb-3">Add a reference</p>
          <p className="text-sm text-[#4c4640] mb-4 leading-relaxed">
            Know someone you&apos;ve lived with? Send them a reference request by email or phone.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Email or phone number"
              className="flex-1 text-sm bg-[#F2E6E0] border border-[#cfc5bd] rounded-xl px-4 py-2.5 text-[#1c1b1b] placeholder:text-[#7d766f] focus:outline-none focus:border-[#A86472] transition-colors"
            />
            <Link
              href="/references/request"
              className="bg-[#A86472] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#8A505E] active:scale-95 transition-all whitespace-nowrap"
            >
              Send request
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
