'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { log } from '@/lib/log';
import {
  createListing,
  updateListing,
  publishListing,
  deleteListing,
} from '@/server/services/listings';

const listingSchema = z.object({
  type: z.enum(['PRIVATE_ROOM', 'SHARED_ROOM', 'WHOLE_UNIT']),
  title: z.string().min(5).max(120),
  description: z.string().min(20).max(2000),
  addressLine: z.string().min(3).max(200),
  city: z.string().min(1).max(120),
  neighborhood: z.string().max(120).optional(),
  postalCode: z.string().min(3).max(10),
  latitude: z.number(),
  longitude: z.number(),
  rentAmount: z.number().int().positive(),
  depositAmount: z.number().int().positive().optional(),
  utilitiesIncluded: z.boolean(),
  availableFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  leaseMonths: z.number().int().min(1),
  bedroomsTotal: z.number().int().min(0),
  bathroomsTotal: z.number().min(0),
  furnished: z.boolean(),
  smokingAllowed: z.boolean(),
  petsAllowed: z.boolean(),
  genderPref: z.enum(['MALE_ONLY', 'FEMALE_ONLY', 'ANY', 'NON_BINARY_INCLUSIVE']),
  ageMin: z.number().int().min(18).optional(),
  ageMax: z.number().int().max(99).optional(),
  amenities: z.array(z.string()).default([]),
});

async function requireDbUserId(cognitoSub: string) {
  const row = await prisma.user.findUnique({
    where: { cognitoSub },
    select: { id: true },
  });
  if (!row) throw new Error('User not found');
  return row.id;
}

export async function createListingAction(input: unknown) {
  const auth = await requireUser();
  const userId = await requireDbUserId(auth.cognitoSub);
  const data = listingSchema.parse(input);
  let listing;
  try {
    listing = await createListing(userId, data);
  } catch (err) {
    log.error('createListingAction failed', { userId, err: String(err) });
    throw err;
  }
  redirect(`/listings/${listing.id}/edit`);
}

export async function updateListingAction(listingId: string, input: unknown) {
  const auth = await requireUser();
  const userId = await requireDbUserId(auth.cognitoSub);
  const data = listingSchema.partial().parse(input);
  try {
    await updateListing(listingId, userId, data);
  } catch (err) {
    log.error('updateListingAction failed', { userId, listingId, err: String(err) });
    throw err;
  }
}

export async function publishListingAction(listingId: string) {
  const auth = await requireUser();
  const userId = await requireDbUserId(auth.cognitoSub);
  try {
    await publishListing(listingId, userId);
  } catch (err) {
    log.error('publishListingAction failed', { userId, listingId, err: String(err) });
    throw err;
  }
  redirect(`/listings/${listingId}`);
}

export async function deleteListingAction(listingId: string) {
  const auth = await requireUser();
  const userId = await requireDbUserId(auth.cognitoSub);
  try {
    await deleteListing(listingId, userId);
  } catch (err) {
    log.error('deleteListingAction failed', { userId, listingId, err: String(err) });
    throw err;
  }
  redirect('/listings/my');
}
