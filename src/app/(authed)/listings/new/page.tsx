import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { ListingForm } from '@/features/listings/components/listing-form';

export default async function NewListingPage() {
  const auth = await requireUser();
  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { roles: true, verifications: { where: { status: 'APPROVED' }, select: { id: true } } },
  });

  const isVerified = (user?.verifications.length ?? 0) > 0;
  const isAdmin = user?.roles.includes('ADMIN') ?? false;

  if (!isVerified && !isAdmin) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-3xl mb-6">
          🛡️
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Verification required</h1>
        <p className="text-gray-500 mb-8 max-w-sm">
          Only verified users can post listings. Verify your identity to get started.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/settings/verify"
            className="w-full py-3 rounded-2xl bg-teal-600 text-white font-semibold text-center hover:bg-teal-700 transition-colors"
          >
            Verify my identity →
          </Link>
          <Link
            href="/browse"
            className="w-full py-3 rounded-2xl bg-stone-100 text-gray-600 font-semibold text-center hover:bg-stone-200 transition-colors"
          >
            Browse rooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Create a listing</h1>
        <ListingForm />
      </div>
    </div>
  );
}
