import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { redirect } from 'next/navigation';
import { ListingForm } from '@/features/listings/components/listing-form';

export default async function NewListingPage() {
  const auth = await requireUser();
  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { roles: true },
  });

  const canList = user?.roles.includes('LISTER') || user?.roles.includes('ADMIN');
  if (!canList) redirect('/listings');

  return (
    <div className="min-h-screen bg-[--color-bg]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[--color-fg] mb-8">Create a listing</h1>
        <ListingForm />
      </div>
    </div>
  );
}
