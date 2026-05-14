import { requireDbUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { PreferencesForm } from './_form';

export default async function PreferencesPage() {
  const { userId } = await requireDbUser();
  const prefs = await prisma.preferences.findUnique({ where: { userId } });

  return (
    <div className="min-h-screen bg-[#F2E6E0]">
      <div className="px-6 pt-8 pb-5 border-b border-[#cfc5bd] bg-white">
        <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">Housing preferences</h1>
        <p className="text-sm text-[#7d766f] mt-1">Used to calculate your compatibility with potential roommates.</p>
      </div>
      <div className="max-w-lg mx-auto px-4 py-6">
        <PreferencesForm initial={prefs} />
      </div>
    </div>
  );
}
