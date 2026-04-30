import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { ListingForm } from '@/features/listings/components/listing-form';
import { PhotoUpload } from '@/features/listings/components/photo-upload';
import { publishListingAction, deleteListingAction } from '@/features/listings/lib/actions';
import { buttonClasses } from '@/components/ui/button';
import { Button } from '@/components/ui/button';

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auth = await requireUser();

  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { id: true },
  });
  if (!user) redirect('/login');

  const listing = await prisma.listing.findUnique({
    where: { id, deletedAt: null },
    include: { images: { orderBy: { orderIdx: 'asc' } } },
  });

  if (!listing || listing.ownerId !== user.id) notFound();

  return (
    <div className="min-h-screen bg-[--color-bg]">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[--color-fg]">Edit listing</h1>
          <div className="flex gap-2">
            <Link href={`/listings/${id}`} className={buttonClasses({ variant: 'secondary' })}>View</Link>
            {listing.status === 'DRAFT' && (
              <form action={publishListingAction.bind(null, id)}>
                <Button type="submit">Publish</Button>
              </form>
            )}
            <form action={deleteListingAction.bind(null, id)}>
              <Button type="submit" variant="secondary">Delete</Button>
            </form>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="font-semibold text-[--color-fg]">Photos</h2>
          <div className="flex flex-wrap gap-3">
            {listing.images.map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt={img.caption ?? 'Listing photo'}
                className="w-24 h-24 object-cover rounded-lg border border-[--color-border]"
              />
            ))}
          </div>
          <PhotoUpload
            endpoint="/api/upload/listing-image"
            extraFields={{ listingId: id, orderIdx: String(listing.images.length) }}
            label="Add photo"
          />
        </section>

        <section>
          <h2 className="font-semibold text-[--color-fg] mb-6">Details</h2>
          <ListingForm
            listingId={id}
            initial={{
              type: listing.type as 'PRIVATE_ROOM' | 'SHARED_ROOM' | 'WHOLE_UNIT',
              title: listing.title,
              description: listing.description,
              addressLine: listing.addressLine,
              city: listing.city,
              neighborhood: listing.neighborhood ?? undefined,
              postalCode: listing.postalCode,
              latitude: listing.latitude,
              longitude: listing.longitude,
              rentAmount: listing.rentAmount,
              depositAmount: listing.depositAmount ?? undefined,
              utilitiesIncluded: listing.utilitiesIncluded,
              availableFrom: listing.availableFrom.toISOString().slice(0, 10),
              leaseMonths: listing.leaseMonths,
              bedroomsTotal: listing.bedroomsTotal,
              bathroomsTotal: listing.bathroomsTotal,
              furnished: listing.furnished,
              smokingAllowed: listing.smokingAllowed,
              petsAllowed: listing.petsAllowed,
              genderPref: listing.genderPref as 'ANY' | 'FEMALE_ONLY' | 'MALE_ONLY' | 'NON_BINARY_INCLUSIVE',
              amenities: listing.amenities,
            }}
          />
        </section>
      </div>
    </div>
  );
}
