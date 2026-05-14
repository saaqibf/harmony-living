import Link from 'next/link';
import { requireDbUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

const EXAMPLE_TAGS = [
  'Halal kitchen',
  'Quiet weekdays',
  'Early riser',
  'No smoking',
  'Cat-friendly',
  'Graduate student',
];

export default async function ProfilePreviewPage() {
  const { userId } = await requireDbUser();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      profile: {
        select: {
          firstName: true,
          photoUrl: true,
          bio: true,
          occupation: true,
          city: true,
        },
      },
    },
  });

  const profile = user?.profile;
  const firstName = profile?.firstName ?? 'Preview';

  return (
    <div className="bg-[#F2E6E0] min-h-screen">
      <div className="bg-white border-b border-[#cfc5bd] px-6 pt-8 pb-5">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono tracking-widest uppercase text-[#C4909A] mb-1">Profile preview</p>
              <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">How you show up to others</h1>
            </div>
            <Link
              href="/settings"
              className="text-sm text-[#7d766f] hover:text-[#1c1b1b] transition-colors"
            >
              ← Back
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-5">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-[#cfc5bd] overflow-hidden">
          {/* Photo area */}
          <div className="h-48 bg-gradient-to-br from-[#F9F0EE] via-[#F5EAE4] to-[#E8D5D0] relative flex items-center justify-center">
            {profile?.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={firstName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#E8D5D0] flex items-center justify-center">
                <svg className="w-9 h-9 text-[#A86472]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            )}
            <div className="absolute bottom-3 right-3">
              <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-[#2d4a3e] bg-white/90 border border-[#c4dbd4] rounded-full px-2.5 py-1 backdrop-blur-sm">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                ID Verified
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-xl font-serif font-semibold text-[#1c1b1b]">{firstName}</h2>
                {(profile?.occupation || profile?.city) && (
                  <p className="text-sm text-[#7d766f] mt-0.5">
                    {[profile?.occupation, profile?.city].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            </div>

            {profile?.bio ? (
              <p className="text-sm text-[#4c4640] leading-relaxed mb-4">{profile.bio}</p>
            ) : (
              <p className="text-sm text-[#7d766f] italic mb-4 leading-relaxed">
                No bio yet. Add one to help people connect with you.
              </p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {EXAMPLE_TAGS.map((tag) => (
                <span key={tag} className="text-xs text-[#4c4640] bg-[#F5EAE4] border border-[#cfc5bd] rounded-full px-2.5 py-0.5">
                  {tag}
                </span>
              ))}
            </div>

            {/* References quote */}
            <div className="bg-[#F9F0EE] border border-[#E8D5D0] rounded-xl px-4 py-3">
              <p className="text-xs text-[#4c4640] italic leading-relaxed">
                &ldquo;Incredibly tidy, respectful of shared spaces, and always paid rent on time.&rdquo;
              </p>
              <p className="text-[10px] font-semibold text-[#A86472] mt-1.5">Sara M. · Former roommate</p>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-[#F5EAE4] border border-[#cfc5bd] rounded-xl px-4 py-3">
          <p className="text-xs text-[#7d766f] leading-relaxed">
            This is how your profile appears to other members after you match. Tags and preferences are pulled from your profile and preference settings.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/settings/profile"
            className="flex-1 border border-[#cfc5bd] text-[#4c4640] font-semibold text-sm py-3 rounded-xl hover:bg-[#F5EAE4] text-center transition-colors"
          >
            Edit profile
          </Link>
          <Link
            href="/settings"
            className="flex-1 bg-[#A86472] text-white font-semibold text-sm py-3 rounded-xl hover:bg-[#8A505E] text-center transition-all"
          >
            Looks good
          </Link>
        </div>
      </div>
    </div>
  );
}
