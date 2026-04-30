import { z } from 'zod';
import {
  cookingFrequencySchema,
  dietaryPracticeSchema,
  drinkingRoommateSchema,
  drinkingSelfSchema,
  guestsSchema,
  noiseToleranceSchema,
  petsRoommateSchema,
} from '@/lib/onboarding/vocabulary';

export const intentSchema = z.object({
  intent: z.enum(['seeker', 'lister', 'both']),
});

export type IntentForm = z.infer<typeof intentSchema>;

export const basicsSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(80),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date'),
  gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY']),
  occupation: z.string().max(120).optional(),
  city: z.string().min(1, 'City is required').max(120),
});

export type BasicsForm = z.infer<typeof basicsSchema>;

export const housingPrefsSchema = z
  .object({
    budgetMin: z.number().int().positive(),
    budgetMax: z.number().int().positive(),
    moveInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    moveInFlexibilityDays: z.number().int().min(0).default(14),
    leaseMinMonths: z.number().int().min(1).default(6),
    leaseMaxMonths: z.number().int().min(1).default(12),
    preferredCities: z.array(z.string().min(1)).min(1),
    preferredNeighborhoods: z.array(z.string()).optional().default([]),
    proximityPriorities: z.array(z.string()).optional().default([]),
    nearUniversity: z.string().optional(),
  })
  .refine((d) => d.budgetMin <= d.budgetMax, {
    message: 'Minimum budget must be less than or equal to maximum',
    path: ['budgetMax'],
  })
  .refine((d) => d.leaseMinMonths <= d.leaseMaxMonths, {
    message: 'Minimum lease must be less than or equal to maximum lease',
    path: ['leaseMaxMonths'],
  });

export type HousingPrefsForm = z.infer<typeof housingPrefsSchema>;

export const lifestyleSchema = z.object({
  cleanliness: z.enum(['VERY_TIDY', 'TIDY', 'AVERAGE', 'RELAXED']),
  schedule: z.enum(['EARLY_BIRD', 'NIGHT_OWL', 'FLEXIBLE', 'SHIFT_WORKER']),
  smokingSelf: z.boolean(),
  smokingRoommate: z.boolean(),
  drinkingSelf: drinkingSelfSchema,
  drinkingRoommate: drinkingRoommateSchema,
  pets: z.boolean(),
  petsRoommate: petsRoommateSchema,
  guests: guestsSchema,
  noiseTolerance: noiseToleranceSchema,
  cookingFrequency: cookingFrequencySchema,
});

export type LifestyleForm = z.infer<typeof lifestyleSchema>;

export const valuesSchema = z
  .object({
    faithPractice: z
      .enum(['PRACTICING', 'CULTURAL', 'NOT_PRACTICING', 'PREFER_NOT_TO_SAY'])
      .optional(),
    faith: z.string().optional(),
    dietaryPractice: dietaryPracticeSchema.optional(),
    prayerSpaceNeeded: z.boolean(),
    genderPreference: z.enum([
      'MALE_ONLY',
      'FEMALE_ONLY',
      'ANY',
      'NON_BINARY_INCLUSIVE',
    ]),
    ageMin: z.number().int().min(18),
    ageMax: z.number().int().max(99),
    faithMatchRequired: z.boolean(),
    personality: z.string().max(2000).optional(),
    socialLevel: z.number().int().min(1).max(5),
    dealbreakers: z.array(z.unknown()).optional(),
  })
  .refine(
    (d) =>
      !d.faithMatchRequired ||
      (typeof d.faith === 'string' && d.faith.trim().length > 0),
    {
      message: 'If faith match is required, please specify your faith.',
      path: ['faith'],
    },
  );

export type ValuesForm = z.infer<typeof valuesSchema>;

export const profileFinishSchema = z.object({
  bio: z.string().max(500).optional(),
  languages: z.array(z.string()).optional().default([]),
  privacyMode: z.enum(['PUBLIC', 'MATCHES_ONLY', 'HIDDEN']),
});

export type ProfileFinishForm = z.infer<typeof profileFinishSchema>;
