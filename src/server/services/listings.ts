import 'server-only';

import type { ListingStatus, GenderPreference } from '@generated/prisma/client';
import { prisma } from '@/lib/db/prisma';
import { AppError } from '@/lib/errors';

export class ListingError extends AppError {
  constructor(
    public readonly code: 'NOT_FOUND' | 'FORBIDDEN' | 'NOT_PUBLISHABLE',
    message: string,
  ) {
    super(code, message);
    this.name = 'ListingError';
  }
}

async function assertOwner(listingId: string, ownerId: string) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new ListingError('NOT_FOUND', 'Listing not found');
  if (listing.ownerId !== ownerId) throw new ListingError('FORBIDDEN', 'Not your listing');
  return listing;
}

export type CreateListingInput = {
  type: 'PRIVATE_ROOM' | 'SHARED_ROOM' | 'WHOLE_UNIT';
  title: string;
  description: string;
  addressLine: string;
  city: string;
  neighborhood?: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  rentAmount: number;
  depositAmount?: number;
  utilitiesIncluded: boolean;
  availableFrom: string;
  leaseMonths: number;
  bedroomsTotal: number;
  bathroomsTotal: number;
  furnished: boolean;
  smokingAllowed: boolean;
  petsAllowed: boolean;
  genderPref: GenderPreference;
  ageMin?: number;
  ageMax?: number;
  amenities: string[];
};

export type UpdateListingInput = Partial<CreateListingInput>;

const APPROX_OFFSET_KM = 0.3;
const DEG_PER_KM = 1 / 111;

function approxCoords(lat: number, lng: number) {
  const offset = APPROX_OFFSET_KM * DEG_PER_KM;
  return {
    approxLatitude: Math.round((lat + offset) * 10000) / 10000,
    approxLongitude: Math.round((lng + offset) * 10000) / 10000,
  };
}

export async function createListing(ownerId: string, input: CreateListingInput) {
  const { approxLatitude, approxLongitude } = approxCoords(input.latitude, input.longitude);

  return prisma.listing.create({
    data: {
      ownerId,
      type: input.type,
      status: 'DRAFT',
      title: input.title,
      description: input.description,
      addressLine: input.addressLine,
      city: input.city,
      neighborhood: input.neighborhood,
      postalCode: input.postalCode,
      latitude: input.latitude,
      longitude: input.longitude,
      approxLatitude,
      approxLongitude,
      rentAmount: input.rentAmount,
      depositAmount: input.depositAmount,
      utilitiesIncluded: input.utilitiesIncluded,
      availableFrom: new Date(input.availableFrom),
      leaseMonths: input.leaseMonths,
      bedroomsTotal: input.bedroomsTotal,
      bathroomsTotal: input.bathroomsTotal,
      furnished: input.furnished,
      smokingAllowed: input.smokingAllowed,
      petsAllowed: input.petsAllowed,
      genderPref: input.genderPref,
      ageMin: input.ageMin,
      ageMax: input.ageMax,
      amenities: input.amenities,
    },
  });
}

export async function updateListing(
  listingId: string,
  ownerId: string,
  input: UpdateListingInput,
) {
  await assertOwner(listingId, ownerId);

  const coordUpdate =
    input.latitude !== undefined && input.longitude !== undefined
      ? approxCoords(input.latitude, input.longitude)
      : {};

  return prisma.listing.update({
    where: { id: listingId },
    data: {
      ...(input as object),
      ...(input.availableFrom ? { availableFrom: new Date(input.availableFrom) } : {}),
      ...coordUpdate,
    },
  });
}

export async function publishListing(listingId: string, ownerId: string) {
  await assertOwner(listingId, ownerId);

  const imageCount = await prisma.listingImage.count({ where: { listingId } });
  if (imageCount === 0) {
    throw new ListingError('NOT_PUBLISHABLE', 'Add at least one photo before publishing');
  }

  return prisma.listing.update({
    where: { id: listingId },
    data: { status: 'ACTIVE' },
  });
}

export async function deleteListing(listingId: string, ownerId: string) {
  await assertOwner(listingId, ownerId);
  return prisma.listing.update({
    where: { id: listingId },
    data: { deletedAt: new Date(), status: 'ARCHIVED' as ListingStatus },
  });
}

export async function getActiveListing(listingId: string) {
  return prisma.listing.findFirst({
    where: { id: listingId, status: 'ACTIVE', deletedAt: null },
    include: { images: { orderBy: { orderIdx: 'asc' } } },
  });
}

export async function getMyListings(ownerId: string) {
  return prisma.listing.findMany({
    where: { ownerId, deletedAt: null },
    include: { images: { orderBy: { orderIdx: 'asc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getActiveListings(opts: { city?: string; limit?: number; offset?: number } = {}) {
  return prisma.listing.findMany({
    where: {
      status: 'ACTIVE',
      deletedAt: null,
      ...(opts.city ? { city: { contains: opts.city, mode: 'insensitive' } } : {}),
    },
    include: { images: { orderBy: { orderIdx: 'asc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
    take: opts.limit ?? 50,
    skip: opts.offset ?? 0,
  });
}
