import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getActiveListing } from '@/server/services/listings';
import { ListingMap } from '@/features/listings/components/listing-map';
import { buttonClasses } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { publishListingAction } from '@/features/listings/lib/actions';

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auth = await requireUser();

  const [listing, user] = await Promise.all([
    getActiveListing(id),
    prisma.user.findUnique({
      where: { cognitoSub: auth.cognitoSub },
      select: { id: true },
    }),
  ]);

  if (!listing) notFound();

  const isOwner = user?.id === listing.ownerId;
  const available = new Intl.DateTimeFormat('en-CA', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(listing.availableFrom));

  const pin = {
    id: listing.id,
    lat: listing.approxLatitude,
    lng: listing.approxLongitude,
    label: listing.title,
    rent: listing.rentAmount,
  };

  return (
    <div className="min-h-screen bg-[--color-bg]">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/listings" className="text-sm text-[--color-muted-fg] hover:underline">
            ← Back to listings
          </Link>
          {isOwner && (
            <div className="flex gap-2">
              <Link href={`/listings/${id}/edit`} className={buttonClasses({ variant: 'secondary' })}>Edit</Link>
              <form action={publishListingAction.bind(null, id)}>
                <Button type="submit">Publish</Button>
              </form>
            </div>
          )}
        </div>

        {listing.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
            <img
              src={listing.images[0].url}
              alt={listing.title}
              className="col-span-2 w-full aspect-[16/9] object-cover"
            />
            {listing.images.slice(1, 3).map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt={img.caption ?? listing.title}
                className="w-full aspect-square object-cover"
              />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[--color-fg]">{listing.title}</h1>
              <p className="text-[--color-muted-fg] mt-1">
                {listing.neighborhood ? `${listing.neighborhood}, ` : ''}{listing.city}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[--color-muted-fg]">Type</span>
                <p className="font-medium capitalize">{listing.type.replace('_', ' ').toLowerCase()}</p>
              </div>
              <div>
                <span className="text-[--color-muted-fg]">Rent</span>
                <p className="font-bold text-lg">{listing.currency} {listing.rentAmount.toLocaleString()}/mo</p>
              </div>
              <div>
                <span className="text-[--color-muted-fg]">Bedrooms · Bathrooms</span>
                <p className="font-medium">{listing.bedroomsTotal} bd · {listing.bathroomsTotal} ba</p>
              </div>
              <div>
                <span className="text-[--color-muted-fg]">Available</span>
                <p className="font-medium">{available}</p>
              </div>
              <div>
                <span className="text-[--color-muted-fg]">Lease</span>
                <p className="font-medium">{listing.leaseMonths} months</p>
              </div>
              {listing.depositAmount && (
                <div>
                  <span className="text-[--color-muted-fg]">Deposit</span>
                  <p className="font-medium">{listing.currency} {listing.depositAmount.toLocaleString()}</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              {listing.utilitiesIncluded && <span className="px-3 py-1 rounded-full bg-[--color-muted] text-[--color-fg]">Utilities included</span>}
              {listing.furnished && <span className="px-3 py-1 rounded-full bg-[--color-muted] text-[--color-fg]">Furnished</span>}
              {listing.smokingAllowed && <span className="px-3 py-1 rounded-full bg-[--color-muted] text-[--color-fg]">Smoking OK</span>}
              {listing.petsAllowed && <span className="px-3 py-1 rounded-full bg-[--color-muted] text-[--color-fg]">Pets OK</span>}
              {listing.genderPref !== 'ANY' && (
                <span className="px-3 py-1 rounded-full bg-[--color-muted] text-[--color-fg]">
                  {listing.genderPref === 'FEMALE_ONLY' ? 'Female tenants only' : listing.genderPref === 'MALE_ONLY' ? 'Male tenants only' : 'Non-binary inclusive'}
                </span>
              )}
            </div>

            {listing.description && (
              <div>
                <h2 className="font-semibold text-[--color-fg] mb-2">About this space</h2>
                <p className="text-[--color-fg] whitespace-pre-line leading-relaxed">{listing.description}</p>
              </div>
            )}

            {listing.amenities.length > 0 && (
              <div>
                <h2 className="font-semibold text-[--color-fg] mb-2">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((a) => (
                    <span key={a} className="text-sm px-3 py-1 rounded-full bg-[--color-muted] text-[--color-fg]">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border border-[--color-border]" style={{ height: 240 }}>
              <ListingMap pins={[pin]} className="w-full h-full" />
            </div>
            <p className="text-xs text-[--color-muted-fg]">Approximate location shown for privacy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
