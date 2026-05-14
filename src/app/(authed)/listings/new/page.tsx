import Link from 'next/link';
import { requireDbUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { ListingForm } from '@/features/listings/components/listing-form';

export default async function NewListingPage() {
  const { userId } = await requireDbUser();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { roles: true, verifications: { where: { status: 'APPROVED' }, select: { id: true } } },
  });

  const isVerified = (user?.verifications.length ?? 0) > 0;
  const isAdmin = user?.roles.includes('ADMIN') ?? false;

  if (!isVerified && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#F2E6E0] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#edf4f1] flex items-center justify-center text-3xl mb-6">
          🛡️
        </div>
        <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b] mb-3">Verification required</h1>
        <p className="text-[#7d766f] mb-8 max-w-sm text-sm">
          Only verified users can post listings. Verify your identity to get started.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/settings/verify"
            className="w-full py-3 rounded-xl bg-[#1c1916] text-white font-semibold text-center text-sm hover:bg-[#2e2b28] transition-colors"
          >
            Verify my identity →
          </Link>
          <Link
            href="/browse"
            className="w-full py-3 rounded-xl bg-white border border-[#cfc5bd] text-[#4c4640] font-semibold text-center text-sm hover:bg-[#F2E6E0] transition-colors"
          >
            Browse rooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2E6E0]">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b] mb-8">Create a listing</h1>
        <ListingForm />
      </div>
    </div>
  );
}
