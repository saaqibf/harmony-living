'use server';

import { redirect } from 'next/navigation';
import type { Gender } from '@generated/prisma/client';
import { requireUser } from '@/lib/auth/session';
import { setOnboardedCookie } from '@/lib/auth/onboarding-cookie';
import { prisma } from '@/lib/db/prisma';
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

async function requireDbUserId(cognitoSub: string): Promise<string> {
  const row = await prisma.user.findUnique({
    where: { cognitoSub },
    select: { id: true },
  });
  if (!row) {
    throw new OnboardingError('NOT_FOUND', 'User row missing — sign in again.');
  }
  return row.id;
}

export async function saveIntentAction(input: unknown) {
  const user = await requireUser();
  const userId = await requireDbUserId(user.cognitoSub);
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
  const user = await requireUser();
  const userId = await requireDbUserId(user.cognitoSub);
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

export async function saveHousingPrefsAction(input: unknown) {
  const user = await requireUser();
  const userId = await requireDbUserId(user.cognitoSub);
  const data = housingPrefsSchema.parse(input);
  try {
    await onboardingService.saveHousingPrefs(userId, data);
    await onboardingService.markStepComplete(userId, 3);
  } catch (err) {
    log.error('saveHousingPrefsAction failed', { userId, err: String(err) });
    if (err instanceof OnboardingError) throw err;
    throw new OnboardingError('UNKNOWN', String(err));
  }
  redirect('/onboarding/4');
}

export async function saveLifestyleAction(input: unknown) {
  const user = await requireUser();
  const userId = await requireDbUserId(user.cognitoSub);
  const data = lifestyleSchema.parse(input);
  try {
    await onboardingService.saveLifestyle(userId, data);
    await onboardingService.markStepComplete(userId, 4);
  } catch (err) {
    log.error('saveLifestyleAction failed', { userId, err: String(err) });
    if (err instanceof OnboardingError) throw err;
    throw new OnboardingError('UNKNOWN', String(err));
  }
  redirect('/onboarding/5');
}

export async function saveValuesAction(input: unknown) {
  const user = await requireUser();
  const userId = await requireDbUserId(user.cognitoSub);
  const data = valuesSchema.parse(input);
  try {
    await onboardingService.saveValues(userId, data);
    await onboardingService.markStepComplete(userId, 5);
  } catch (err) {
    log.error('saveValuesAction failed', { userId, err: String(err) });
    if (err instanceof OnboardingError) throw err;
    throw new OnboardingError('UNKNOWN', String(err));
  }
  redirect('/onboarding/6');
}

export async function saveProfileFinishAction(input: unknown) {
  const user = await requireUser();
  const userId = await requireDbUserId(user.cognitoSub);
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
