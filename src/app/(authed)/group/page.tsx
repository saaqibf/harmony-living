import Link from 'next/link';
import { requireDbUser } from '@/lib/auth/session';

const OPEN_HOUSEHOLDS = [
  {
    id: 'g1',
    name: 'The Beltline House',
    neighborhood: 'Beltline · SW Calgary',
    tags: ['Halal kitchen', 'Quiet nights', '3 of 4 filled'],
    fitScore: 94,
    avatarColors: ['#E8D5D0', '#EFE0D8', '#d4e8df'],
    initials: ['L', 'P', '+1'],
  },
  {
    id: 'g2',
    name: 'Kensington Circle',
    neighborhood: 'Kensington · NW Calgary',
    tags: ['Graduate students', 'Cat-friendly', '2 of 3 filled'],
    fitScore: 87,
    avatarColors: ['#F9F0EE', '#E8D5D0', '#F5EAE4'],
    initials: ['H', 'N', '+1'],
  },
  {
    id: 'g3',
    name: 'Mission Quarter',
    neighborhood: 'Mission · SW Calgary',
    tags: ['Healthcare workers', 'Early risers', '1 of 3 filled'],
    fitScore: 81,
    avatarColors: ['#d4e8df', '#F9F0EE', '#EFE0D8'],
    initials: ['S', '+2'],
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Match as a group',
    desc: 'We score compatibility across all household members, not just one-on-one.',
  },
  {
    step: '02',
    title: 'One open spot',
    desc: 'Households that are nearly full post for exactly one more compatible person.',
  },
  {
    step: '03',
    title: 'Group chat first',
    desc: 'You\'ll be introduced to the whole household in a group message thread.',
  },
  {
    step: '04',
    title: 'Tour together',
    desc: 'If it feels right, arrange a house visit with the whole group. No surprises.',
  },
];

export default async function GroupPage() {
  await requireDbUser();

  return (
    <div className="bg-[#F2E6E0] min-h-screen">
      <div className="bg-white border-b border-[#cfc5bd] px-6 pt-8 pb-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] font-mono tracking-widest uppercase text-[#C4909A] mb-2">Group living</p>
          <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">Find a house, not just a roommate.</h1>
          <p className="text-sm text-[#7d766f] mt-1 max-w-lg">
            Some households have a spare room and need the right person. We match you with groups that already work. You just complete them.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Left: open households */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#1c1b1b]">Open households accepting one more</h2>
              <span className="text-xs text-[#7d766f] font-mono">3 near you</span>
            </div>

            {OPEN_HOUSEHOLDS.map((group) => (
              <div key={group.id} className="bg-white rounded-2xl border border-[#cfc5bd] p-5 hover:shadow-sm transition-shadow">
                {/* Avatar stack */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex -space-x-2">
                    {group.avatarColors.map((color, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-[#1c1b1b]"
                        style={{ background: color }}
                      >
                        {group.initials[i]}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1c1b1b]">{group.name}</p>
                    <p className="text-xs text-[#7d766f]">{group.neighborhood}</p>
                  </div>
                  <span className="ml-auto font-mono text-xs font-semibold text-[#A86472] bg-[#F9F0EE] border border-[#E8D5D0] rounded-full px-2.5 py-1">
                    {group.fitScore}% fit
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {group.tags.map((tag) => (
                    <span key={tag} className="text-xs text-[#4c4640] bg-[#F5EAE4] border border-[#cfc5bd] rounded-full px-2.5 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  href="/messages"
                  className="text-sm font-semibold text-[#A86472] hover:text-[#8A505E] transition-colors"
                >
                  Request introduction →
                </Link>
              </div>
            ))}

            <div className="pt-2">
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 bg-[#A86472] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#8A505E] active:scale-95 transition-all"
              >
                Start a group →
              </Link>
            </div>
          </div>

          {/* Right: how it works */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[#cfc5bd] p-5 sticky top-6">
              <p className="text-[10px] font-mono tracking-widest uppercase text-[#C4909A] mb-4">How group matching works</p>
              <div className="space-y-5">
                {HOW_IT_WORKS.map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <span className="font-mono text-xs font-bold text-[#cfc5bd] mt-0.5 shrink-0">{item.step}</span>
                    <div>
                      <p className="text-sm font-semibold text-[#1c1b1b] mb-0.5">{item.title}</p>
                      <p className="text-xs text-[#7d766f] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-[#EFE0D8]">
                <p className="text-xs text-[#7d766f] leading-relaxed">
                  Group matching is in early access. You&apos;ll be notified when a household reaches out.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
