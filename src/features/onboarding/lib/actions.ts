'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { Gender } from '@generated/prisma/client';
import { requireDbUser } from '@/lib/auth/session';
import { setOnboardedCookie } from '@/lib/auth/onboarding-cookie';
import { log } from '@/lib/log';
import {
  basicsSchema,
  housingPrefsSchema,
  intentSchema,
  lifestyleSchema,
  profileFinishSchema,
  valuesSchema,
} from '@/lib/onboarding/step-schemas';
import { onboardingService, OnboardingError } from '@/server/services/onboarding';

export async function saveIntentAction(input: unknown) {
  const { userId } = await requireDbUser();
  const data = intentSchema.parse(input);
  try {
    await onboardingService.saveIntent(userId, data);
    await onboardingService.markStepComplete(userId, 1);
  } catch (err) {
    log.error('saveIntentAction failed', { userId, err: String(err) });
    if (err instanceof OnboardingError) throw err;
    throw new OnboardingError('UNKNOWN', String(err));
  }
  redirect('/onboarding/2');
}

export async function saveBasicsAction(input: unknown) {

  const { userId } = await requireDbUser();
  const data = basicsSchema.parse(input);
  try {
    await onboardingService.saveBasics(userId, {
      firstName: data.firstName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender as Gender,
      occupation: data.occupation,
      city: data.city,
    });
    await onboardingService.markStepComplete(userId, 2);
  } catch (err) {
    log.error('saveBasicsAction failed', { userId, err: String(err) });
    if (err instanceof OnboardingError) throw err;
    throw new OnboardingError('UNKNOWN', String(err));
  }
  redirect('/onboarding/3');
}

// Step 3: lifestyle + essential values (gender preference)
const vibeSchema = z.object({
  cleanliness: z.enum(['VERY_TIDY', 'TIDY', 'AVERAGE', 'RELAXED']),
  schedule: z.enum(['EARLY_BIRD', 'NIGHT_OWL', 'FLEXIBLE', 'SHIFT_WORKER']),
  smokingSelf: z.boolean(),
  smokingRoommate: z.boolean(),
  drinkingSelf: z.string(),
  pets: z.boolean(),
  genderPreference: z.enum(['MALE_ONLY', 'FEMALE_ONLY', 'ANY', 'NON_BINARY_INCLUSIVE']),
  personality: z.string().max(2000).optional(),
});

export async function saveVibeAction(input: unknown) {

  const { userId } = await requireDbUser();
  const data = vibeSchema.parse(input);
  try {
    await onboardingService.saveLifestyle(userId, {
      cleanliness: data.cleanliness,
      schedule: data.schedule,
      smokingSelf: data.smokingSelf,
      smokingRoommate: data.smokingRoommate,
      drinkingSelf: (data.drinkingSelf as 'never' | 'rarely' | 'socially' | 'regularly'),
      drinkingRoommate: 'any',
      pets: data.pets,
      petsRoommate: 'any',
      guests: 'sometimes',
      noiseTolerance: 'moderate',
      cookingFrequency: 'sometimes',
    });
    await onboardingService.saveValues(userId, {
      genderPreference: data.genderPreference,
      prayerSpaceNeeded: false,
      ageMin: 18,
      ageMax: 99,
      faithMatchRequired: false,
      socialLevel: 3,
      dealbreakers: [],
      personality: data.personality,
    });
    await onboardingService.markStepComplete(userId, 3);
  } catch (err) {
    log.error('saveVibeAction failed', { userId, err: String(err) });
    if (err instanceof OnboardingError) throw err;
    throw new OnboardingError('UNKNOWN', String(err));
  }
  redirect('/onboarding/4');
}

// Step 4: housing prefs + proximity + profile finish (completes onboarding)
const wrapupSchema = z.object({
  budgetMin: z.number().int().positive(),
  budgetMax: z.number().int().positive(),
  moveInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferredCities: z.array(z.string().min(1)).min(1),
  proximityPriorities: z.array(z.string()).default([]),
  nearUniversity: z.string().optional(),
  bio: z.string().max(500).optional(),
  privacyMode: z.enum(['PUBLIC', 'MATCHES_ONLY', 'HIDDEN']),
});

export async function saveWrapupAction(input: unknown) {

  const { userId } = await requireDbUser();
  const data = wrapupSchema.parse(input);
  try {
    await onboardingService.saveHousingPrefs(userId, {
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      moveInDate: data.moveInDate,
      moveInFlexibilityDays: 14,
      leaseMinMonths: 6,
      leaseMaxMonths: 12,
      preferredCities: data.preferredCities,
      preferredNeighborhoods: [],
      proximityPriorities: data.proximityPriorities,
      nearUniversity: data.nearUniversity,
    });
    await onboardingService.finishOnboarding(userId, {
      bio: data.bio,
      languages: [],
      privacyMode: data.privacyMode,
    });
  } catch (err) {
    log.error('saveWrapupAction failed', { userId, err: String(err) });
    if (err instanceof OnboardingError) throw err;
    throw new OnboardingError('UNKNOWN', String(err));
  }
  await setOnboardedCookie();
  redirect('/dashboard?welcome=1');
}

// Kept for backwards-compat (settings profile page still uses these)
export async function saveHousingPrefsAction(input: unknown) {

  const { userId } = await requireDbUser();
  const data = housingPrefsSchema.parse(input);
  try {
    await onboardingService.saveHousingPrefs(userId, data);
  } catch (err) {
    log.error('saveHousingPrefsAction failed', { userId, err: String(err) });
    if (err instanceof OnboardingError) throw err;
    throw new OnboardingError('UNKNOWN', String(err));
  }
}

export async function saveLifestyleAction(input: unknown) {

  const { userId } = await requireDbUser();
  const data = lifestyleSchema.parse(input);
  try {
    await onboardingService.saveLifestyle(userId, data);
  } catch (err) {
    log.error('saveLifestyleAction failed', { userId, err: String(err) });
    if (err instanceof OnboardingError) throw err;
    throw new OnboardingError('UNKNOWN', String(err));
  }
}

export async function saveValuesAction(input: unknown) {

  const { userId } = await requireDbUser();
  const data = valuesSchema.parse(input);
  try {
    await onboardingService.saveValues(userId, data);
  } catch (err) {
    log.error('saveValuesAction failed', { userId, err: String(err) });
    if (err instanceof OnboardingError) throw err;
    throw new OnboardingError('UNKNOWN', String(err));
  }
}

export async function saveProfileFinishAction(input: unknown) {

  const { userId } = await requireDbUser();
  const data = profileFinishSchema.parse(input);
  try {
    await onboardingService.finishOnboarding(userId, {
      bio: data.bio,
      languages: data.languages,
      privacyMode: data.privacyMode,
    });
  } catch (err) {
    log.error('saveProfileFinishAction failed', { userId, err: String(err) });
    if (err instanceof OnboardingError) throw err;
    throw new OnboardingError('UNKNOWN', String(err));
  }
  await setOnboardedCookie();
  redirect('/dashboard?welcome=1');
}
