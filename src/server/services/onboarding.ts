import 'server-only';

import type { Gender, Preferences, PrivacyMode, Profile } from '@generated/prisma/client';
import { AppError } from '@/lib/errors';
import { prisma } from '@/lib/db/prisma';
import { dobToStoredDate, isAtLeast18 } from '@/lib/dates';
import { log } from '@/lib/log';
import {
  type OnboardingDraft,
  isDraftPromotable,
  onboardingDraftSchema,
} from '@/lib/onboarding/draft-schema';
import { dealbreakersSchema } from '@/lib/onboarding/schemas';
import {
  housingPrefsSchema,
  lifestyleSchema,
  type HousingPrefsForm,
  type IntentValue,
  type LifestyleForm,
  type ValuesForm,
  valuesSchema,
} from '@/lib/onboarding/step-schemas';
import { CURRENT_ONBOARDING_VERSION } from '@/lib/onboarding/version';

export type OnboardingErrorCode =
  | 'NOT_FOUND'
  | 'INVALID_INPUT'
  | 'INVALID_STEP'
  | 'INCOMPLETE_STEPS'
  | 'UNDERAGE'
  | 'GENDER_MISMATCH_FOR_FEMALE_ONLY'
  | 'UNKNOWN';

export class OnboardingError extends AppError {
  constructor(
    public readonly code: OnboardingErrorCode,
    message?: string,
  ) {
    super(code, message);
    this.name = 'OnboardingError';
  }
}

export type HousingPrefsInput = HousingPrefsForm;
export type LifestyleInput = LifestyleForm;
export type ValuesInput = ValuesForm;

export type ProfileFinishInput = {
  bio?: string;
  languages?: string[];
  privacyMode: 'PUBLIC' | 'MATCHES_ONLY' | 'HIDDEN';
};

export type UnifiedOnboardingData = {
  intent: string | null;
  profile: Profile | null;
  preferences: Preferences | null;
  draft: OnboardingDraft;
  /** Virtual merge: promoted Preferences ⊕ in-flight draftData (for form defaults). */
  mergedDraft: OnboardingDraft;
  completedSteps: number[];
  completedAt: Date | null;
};

function omitUndefinedRecord<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

function intentToRoles(intent: IntentValue): Array<'SEEKER' | 'LISTER'> {
  switch (intent) {
    case 'room_seeker':
    case 'seeker':
      return ['SEEKER'];
    case 'roommate_finder':
    case 'tenant_lister':
    case 'landlord':
    case 'lister':
      return ['LISTER'];
    case 'room_seeker_and_lister':
    case 'both':
      return ['SEEKER', 'LISTER'];
  }
}

function parseDraftJson(data: unknown): OnboardingDraft {
  if (data === null || data === undefined) return {};
  if (typeof data !== 'object' || Array.isArray(data)) return {};
  const parsed = onboardingDraftSchema.partial().safeParse(data);
  if (!parsed.success) {
    log.warn('onboarding.draft_parse_failed', { issues: parsed.error.issues });
    return {};
  }
  return parsed.data as OnboardingDraft;
}

function preferencesToDraftShape(prefs: Preferences | null): OnboardingDraft {
  if (!prefs) return {};
  const dealRaw = prefs.dealbreakers;
  const dealArr = Array.isArray(dealRaw) ? dealRaw : [];
  return {
    budgetMin: prefs.budgetMin,
    budgetMax: prefs.budgetMax,
    moveInDate: prefs.moveInDate.toISOString(),
    moveInFlexibilityDays: prefs.moveInFlexibilityDays,
    leaseMinMonths: prefs.leaseMinMonths,
    leaseMaxMonths: prefs.leaseMaxMonths,
    preferredCities: [...prefs.preferredCities],
    preferredNeighborhoods: [...prefs.preferredNeighborhoods],
    cleanliness: prefs.cleanliness,
    schedule: prefs.schedule,
    smokingSelf: prefs.smokingSelf,
    smokingRoommate: prefs.smokingRoommate,
    drinkingSelf: prefs.drinkingSelf,
    drinkingRoommate: prefs.drinkingRoommate,
    pets: prefs.pets,
    petsRoommate: prefs.petsRoommate,
    guests: prefs.guests,
    noiseTolerance: prefs.noiseTolerance,
    cookingFrequency: prefs.cookingFrequency,
    faithPractice: prefs.faithPractice ?? undefined,
    faith: prefs.faith ?? undefined,
    dietaryPractice: prefs.dietaryPractice ?? undefined,
    prayerSpaceNeeded: prefs.prayerSpaceNeeded,
    genderPreference: prefs.genderPreference,
    ageMin: prefs.ageMin,
    ageMax: prefs.ageMax,
    faithMatchRequired: prefs.faithMatchRequired,
    personality: prefs.personality ?? undefined,
    socialLevel: prefs.socialLevel,
    dealbreakers: dealArr.length > 0 ? dealArr : undefined,
    proximityPriorities: prefs.proximityPriorities.length > 0 ? prefs.proximityPriorities : undefined,
    nearUniversity: prefs.nearUniversity ?? undefined,
  };
}

function mergeVirtualDraft(
  prefs: Preferences | null,
  diskDraft: OnboardingDraft,
): OnboardingDraft {
  return {
    ...preferencesToDraftShape(prefs),
    ...diskDraft,
  };
}

function buildPrefsUpdateFromDraft(draft: OnboardingDraft) {
  const dealParsed = dealbreakersSchema.safeParse(draft.dealbreakers ?? []);
  const dealJson = dealParsed.success ? dealParsed.data : [];

  if (
    draft.budgetMin === undefined ||
    draft.budgetMax === undefined ||
    draft.moveInDate === undefined ||
    draft.cleanliness === undefined ||
    draft.schedule === undefined ||
    !Array.isArray(draft.preferredCities) ||
    draft.preferredCities.length === 0
  ) {
    throw new OnboardingError('INVALID_INPUT', 'Draft missing required preference fields');
  }

  return {
    budgetMin: draft.budgetMin,
    budgetMax: draft.budgetMax,
    moveInDate: new Date(draft.moveInDate),
    moveInFlexibilityDays: draft.moveInFlexibilityDays ?? 14,
    leaseMinMonths: draft.leaseMinMonths ?? 6,
    leaseMaxMonths: draft.leaseMaxMonths ?? 12,
    preferredCities: draft.preferredCities,
    preferredNeighborhoods: draft.preferredNeighborhoods ?? [],
    cleanliness: draft.cleanliness,
    schedule: draft.schedule,
    smokingSelf: draft.smokingSelf ?? false,
    smokingRoommate: draft.smokingRoommate ?? false,
    drinkingSelf: draft.drinkingSelf ?? 'never',
    drinkingRoommate: draft.drinkingRoommate ?? 'any',
    pets: draft.pets ?? false,
    petsRoommate: draft.petsRoommate ?? 'any',
    guests: draft.guests ?? 'sometimes',
    noiseTolerance: draft.noiseTolerance ?? 'moderate',
    cookingFrequency: draft.cookingFrequency ?? 'sometimes',
    faithPractice: draft.faithPractice ?? null,
    faith: draft.faith ?? null,
    dietaryPractice: draft.dietaryPractice ?? null,
    prayerSpaceNeeded: draft.prayerSpaceNeeded ?? false,
    genderPreference: draft.genderPreference ?? 'ANY',
    ageMin: draft.ageMin ?? 18,
    ageMax: draft.ageMax ?? 99,
    facultyFriendly: false,
    faithMatchRequired: draft.faithMatchRequired ?? false,
    personality: draft.personality ?? null,
    socialLevel: draft.socialLevel ?? 3,
    dealbreakers: dealJson,
    proximityPriorities: draft.proximityPriorities ?? [],
    nearUniversity: draft.nearUniversity ?? null,
  };
}

async function getOnboardingState(userId: string) {
  let state = await prisma.onboardingState.findUnique({ where: { userId } });
  if (!state) {
    state = await prisma.onboardingState.create({
      data: {
        userId,
        version: CURRENT_ONBOARDING_VERSION,
      },
    });
  } else if (state.version !== CURRENT_ONBOARDING_VERSION) {
    log.warn('onboarding.version_mismatch', {
      userId,
      rowVersion: state.version,
      current: CURRENT_ONBOARDING_VERSION,
    });
  }
  return state;
}

async function saveIntent(
  userId: string,
  input: { intent: IntentValue },
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({ where: { id: userId } });
    if (!existing) {
      throw new OnboardingError('NOT_FOUND', 'User not found');
    }

    const adminRoles = existing.roles.filter(
      (r) => r === 'MODERATOR' || r === 'ADMIN' || r === 'SUPPORT',
    );
    const previousIntentRoles = existing.roles.filter(
      (r) => r === 'SEEKER' || r === 'LISTER',
    );
    const newIntentRoles = intentToRoles(input.intent);
    const newRoles = Array.from(
      new Set([...adminRoles, ...previousIntentRoles, ...newIntentRoles]),
    );

    await tx.user.update({ where: { id: userId }, data: { roles: newRoles } });

    await tx.onboardingState.upsert({
      where: { userId },
      create: {
        userId,
        intent: input.intent,
        version: CURRENT_ONBOARDING_VERSION,
      },
      update: { intent: input.intent },
    });
  });
}

async function saveBasics(
  userId: string,
  input: {
    firstName: string;
    dateOfBirth: string;
    gender: Gender;
    occupation?: string;
    city: string;
  },
): Promise<void> {
  const dob = dobToStoredDate(input.dateOfBirth);
  if (!isAtLeast18(dob)) {
    throw new OnboardingError('UNDERAGE', 'You must be at least 18');
  }

  await prisma.$transaction(async (tx) => {
    await tx.profile.upsert({
      where: { userId },
      create: {
        userId,
        firstName: input.firstName,
        dateOfBirth: dob,
        gender: input.gender,
        occupation: input.occupation,
        city: input.city,
      },
      update: {
        firstName: input.firstName,
        dateOfBirth: dob,
        gender: input.gender,
        ...(input.occupation !== undefined ? { occupation: input.occupation } : {}),
        city: input.city,
      },
    });

    // ADR 0005 invariant 3: female-only mode is derived from self-reported gender.
    await tx.user.update({
      where: { id: userId },
      data: { femaleOnlyMode: input.gender === 'FEMALE' },
    });
  });
}

async function promoteDraftIfNeeded(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  userId: string,
  diskDraft: OnboardingDraft,
): Promise<void> {
  const prefs = await tx.preferences.findUnique({ where: { userId } });
  const virtual = mergeVirtualDraft(prefs, diskDraft);

  if (!isDraftPromotable(virtual)) {
    await tx.onboardingState.update({
      where: { userId },
      data: { draftData: diskDraft as object },
    });
    return;
  }

  const payload = buildPrefsUpdateFromDraft(virtual);
  await tx.preferences.upsert({
    where: { userId },
    create: { userId, ...payload },
    update: payload,
  });

  await tx.onboardingState.update({
    where: { userId },
    data: { draftData: {} },
  });
}

async function saveHousingPrefs(userId: string, input: HousingPrefsInput): Promise<void> {
  const validated = housingPrefsSchema.parse(input);
  const asDraft: OnboardingDraft = {
    ...validated,
    moveInDate: `${validated.moveInDate}T00:00:00.000Z`,
  };

  await prisma.$transaction(async (tx) => {
    await tx.onboardingState.upsert({
      where: { userId },
      create: { userId, version: CURRENT_ONBOARDING_VERSION },
      update: {},
    });

    const state = await tx.onboardingState.findUniqueOrThrow({ where: { userId } });
    const existingDraft = parseDraftJson(state.draftData);
    const mergedOnDisk: OnboardingDraft = { ...existingDraft, ...asDraft };

    await promoteDraftIfNeeded(tx, userId, mergedOnDisk);
  });
}

async function saveLifestyle(userId: string, input: LifestyleInput): Promise<void> {
  const validated = lifestyleSchema.parse(input);

  await prisma.$transaction(async (tx) => {
    await tx.onboardingState.upsert({
      where: { userId },
      create: { userId, version: CURRENT_ONBOARDING_VERSION },
      update: {},
    });

    const state = await tx.onboardingState.findUniqueOrThrow({ where: { userId } });
    const existingDraft = parseDraftJson(state.draftData);
    const mergedOnDisk: OnboardingDraft = { ...existingDraft, ...validated };

    await promoteDraftIfNeeded(tx, userId, mergedOnDisk);
  });
}

async function saveValues(userId: string, input: ValuesInput): Promise<void> {
  const validated = valuesSchema.parse(input);

  await prisma.$transaction(async (tx) => {
    await tx.onboardingState.upsert({
      where: { userId },
      create: { userId, version: CURRENT_ONBOARDING_VERSION },
      update: {},
    });

    const state = await tx.onboardingState.findUniqueOrThrow({ where: { userId } });
    const existingDraft = parseDraftJson(state.draftData);
    const mergedOnDisk: OnboardingDraft = {
      ...existingDraft,
      ...omitUndefinedRecord(validated),
    };

    await promoteDraftIfNeeded(tx, userId, mergedOnDisk);
  });
}

async function finishOnboarding(
  userId: string,
  input: ProfileFinishInput,
): Promise<void> {
  const privacyMode = input.privacyMode as PrivacyMode;

  await prisma.$transaction(async (tx) => {
    const [profile, state] = await Promise.all([
      tx.profile.findUnique({ where: { userId } }),
      tx.onboardingState.findUnique({ where: { userId } }),
    ]);

    if (!profile) {
      throw new OnboardingError('NOT_FOUND', 'Profile missing. Complete basics first.');
    }
    if (!state) {
      throw new OnboardingError('NOT_FOUND', 'Onboarding state missing');
    }

    await tx.profile.update({
      where: { userId },
      data: {
        bio: input.bio ?? null,
        languages: input.languages ?? [],
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { privacyMode },
    });

    const completed = new Set([...state.completedSteps, 4]);
    const sorted = [...completed].sort((a, b) => a - b);
    const needed = [1, 2, 3, 4];
    if (!needed.every((s) => sorted.includes(s))) {
      throw new OnboardingError('INCOMPLETE_STEPS');
    }

    await tx.onboardingState.update({
      where: { userId },
      data: {
        completedSteps: sorted,
        currentStep: 4,
        completedAt: new Date(),
      },
    });
  });
}

function lowestIncompleteStep(completed: number[]): number {
  const set = new Set(completed);
  for (let s = 1; s <= 4; s += 1) {
    if (!set.has(s)) return s;
  }
  return 5;
}

async function markStepComplete(userId: string, step: number): Promise<void> {
  if (step < 1 || step > 4) {
    throw new OnboardingError('INVALID_STEP');
  }

  const state = await getOnboardingState(userId);
  const completed = new Set([...state.completedSteps, step]);
  const sorted = [...completed].sort((a, b) => a - b);
  const next = lowestIncompleteStep(sorted);

  await prisma.onboardingState.update({
    where: { userId },
    data: {
      completedSteps: sorted,
      currentStep: next === 5 ? 4 : next,
    },
  });
}

async function getResumeStep(userId: string): Promise<number> {
  const state = await prisma.onboardingState.findUnique({ where: { userId } });
  if (!state) return 1;
  return lowestIncompleteStep(state.completedSteps);
}

async function completeOnboarding(userId: string): Promise<void> {
  const state = await prisma.onboardingState.findUnique({ where: { userId } });
  if (!state) {
    throw new OnboardingError('NOT_FOUND');
  }
  const needed = [1, 2, 3, 4];
  if (!needed.every((s) => state.completedSteps.includes(s))) {
    throw new OnboardingError('INCOMPLETE_STEPS');
  }

  await prisma.onboardingState.update({
    where: { userId },
    data: { completedAt: new Date() },
  });
}

async function getOnboardingFormData(userId: string): Promise<UnifiedOnboardingData> {
  const [profile, prefs, state] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.preferences.findUnique({ where: { userId } }),
    prisma.onboardingState.findUnique({ where: { userId } }),
  ]);

  const draft = parseDraftJson(state?.draftData);
  const mergedDraft = mergeVirtualDraft(prefs, draft);

  return {
    intent: state?.intent ?? null,
    profile,
    preferences: prefs,
    draft,
    mergedDraft,
    completedSteps: state?.completedSteps ?? [],
    completedAt: state?.completedAt ?? null,
  };
}

export const onboardingService = {
  getOnboardingState,
  saveIntent,
  saveBasics,
  saveHousingPrefs,
  saveLifestyle,
  saveValues,
  finishOnboarding,
  markStepComplete,
  getResumeStep,
  completeOnboarding,
  getOnboardingFormData,
};
