import { z } from 'zod';

export const onboardingDraftSchema = z.object({
  // Step 3 (housing)
  budgetMin: z.number().int().positive().optional(),
  budgetMax: z.number().int().positive().optional(),
  moveInDate: z.string().datetime().optional(),
  moveInFlexibilityDays: z.number().int().min(0).optional(),
  leaseMinMonths: z.number().int().min(1).optional(),
  leaseMaxMonths: z.number().int().min(1).optional(),
  preferredCities: z.array(z.string()).optional(),
  preferredNeighborhoods: z.array(z.string()).optional(),

  // Step 4 (lifestyle)
  cleanliness: z.enum(['VERY_TIDY', 'TIDY', 'AVERAGE', 'RELAXED']).optional(),
  schedule: z.enum(['EARLY_BIRD', 'NIGHT_OWL', 'FLEXIBLE', 'SHIFT_WORKER']).optional(),
  smokingSelf: z.boolean().optional(),
  smokingRoommate: z.boolean().optional(),
  drinkingSelf: z.string().optional(),
  drinkingRoommate: z.string().optional(),
  pets: z.boolean().optional(),
  petsRoommate: z.string().optional(),
  guests: z.string().optional(),
  noiseTolerance: z.string().optional(),
  cookingFrequency: z.string().optional(),

  // Step 5 (values)
  faithPractice: z.enum(['PRACTICING', 'CULTURAL', 'NOT_PRACTICING', 'PREFER_NOT_TO_SAY']).optional(),
  faith: z.string().optional(),
  dietaryPractice: z.string().optional(),
  prayerSpaceNeeded: z.boolean().optional(),
  genderPreference: z.enum(['MALE_ONLY', 'FEMALE_ONLY', 'ANY', 'NON_BINARY_INCLUSIVE']).optional(),
  ageMin: z.number().int().min(18).optional(),
  ageMax: z.number().int().max(99).optional(),
  faithMatchRequired: z.boolean().optional(),
  personality: z.string().optional(),
  socialLevel: z.number().int().min(1).max(5).optional(),
  dealbreakers: z.array(z.unknown()).optional(),
});

export type OnboardingDraft = z.infer<typeof onboardingDraftSchema>;

/**
 * Returns true if the draft contains every field required to construct a
 * complete Preferences row. When true, the calling server action MUST
 * promote the draft into a Preferences row inside a transaction and clear
 * draftData.
 *
 * See ADR 0004 invariant 2.
 */
export function isDraftPromotable(draft: OnboardingDraft): boolean {
  return (
    draft.budgetMin !== undefined &&
    draft.budgetMax !== undefined &&
    draft.moveInDate !== undefined &&
    draft.cleanliness !== undefined &&
    draft.schedule !== undefined &&
    Array.isArray(draft.preferredCities) &&
    draft.preferredCities.length > 0
  );
}
