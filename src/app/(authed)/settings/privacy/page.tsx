import { requireDbUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { PrivacyForm } from './_form';

export default async function PrivacyPage() {
  const { userId } = await requireDbUser();
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { photoVisibility: true },
  });

  return (
    <div className="min-h-screen bg-[#F2E6E0]">
      <div className="px-6 pt-8 pb-5 border-b border-[#cfc5bd] bg-white">
        <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">Privacy</h1>
        <p className="text-sm text-[#7d766f] mt-1">Control who sees your profile and photos.</p>
      </div>
      <div className="max-w-lg mx-auto px-4 py-6">
        <PrivacyForm initial={profile?.photoVisibility ?? 'UNTIL_MATCH'} />
      </div>
    </div>
  );
}
