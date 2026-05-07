'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireDbUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

const profileSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().max(80).optional(),
  occupation: z.string().max(120).optional(),
  bio: z.string().max(500).optional(),
  city: z.string().min(1).max(120),
});

const privacySchema = z.object({
  photoVisibility: z.enum(['ALWAYS', 'UNTIL_MATCH', 'PRIVATE']),
});

const prefsSchema = z.object({
  budgetMin: z.number().int().min(0),
  budgetMax: z.number().int().min(0),
  cleanliness: z.enum(['VERY_TIDY', 'TIDY', 'AVERAGE', 'RELAXED']),
  schedule: z.enum(['EARLY_BIRD', 'NIGHT_OWL', 'FLEXIBLE', 'SHIFT_WORKER']),
  smokingRoommate: z.boolean(),
  pets: z.boolean(),
  petsRoommate: z.string(),
  guests: z.string(),
});

export async function updateProfileAction(input: unknown) {
  const { userId } = await requireDbUser();
  const data = profileSchema.parse(input);
  await prisma.profile.update({
    where: { userId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName ?? null,
      occupation: data.occupation ?? null,
      bio: data.bio ?? null,
      city: data.city,
    },
  });
  revalidatePath('/settings/profile');
  revalidatePath('/dashboard');
}

export async function updatePrivacyAction(input: unknown) {
  const { userId } = await requireDbUser();
  const data = privacySchema.parse(input);
  await prisma.profile.update({
    where: { userId },
    data: { photoVisibility: data.photoVisibility },
  });
  revalidatePath('/settings/privacy');
}

export async function updatePreferencesAction(input: unknown) {
  const { userId } = await requireDbUser();
  const data = prefsSchema.parse(input);
  await prisma.preferences.update({
    where: { userId },
    data: {
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      cleanliness: data.cleanliness,
      schedule: data.schedule,
      smokingRoommate: data.smokingRoommate,
      pets: data.pets,
      petsRoommate: data.petsRoommate,
      guests: data.guests,
    },
  });
  revalidatePath('/settings/preferences');
}
