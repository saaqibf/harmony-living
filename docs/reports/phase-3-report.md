# Phase 3 report — Onboarding wizard + discovery schema (ADRs 0004 + 0005)

**Date:** 2026-04-28  
**Role:** Cursor's AI (Builder seat); **author:** Saaqib Fagbenro (founder)  
**Stack (masked):** Next.js 16.x, PostgreSQL on Neon (us-west-2), Prisma 7 + `@prisma/adapter-pg`, AWS Cognito.

## 1. Git context

Use `git log -1 --oneline` after pulling this commit for the current hash.

## 2. TL;DR

| Area | Status |
|------|--------|
| Schema + migration | Green |
| Onboarding service + actions + UI | Green |
| Proxy + `hl_onboarded` | Green |
| E2E V1 + V6 (Playwright, real Neon + Cognito) | Green — see §6 |
| Gates | Green — see §7 |

## 3. Architecture

Implements ADR 0004 (onboarding) and ADR 0005 (discovery schema). No new ADR files in this pass.

## 4. Schema migration SQL

```sql
-- CreateEnum
CREATE TYPE "SwipeDirection" AS ENUM ('CONNECT', 'PASS');

-- CreateEnum
CREATE TYPE "PhotoVisibility" AS ENUM ('ALWAYS', 'UNTIL_MATCH', 'PRIVATE');

-- CreateEnum
CREATE TYPE "IntroMediaType" AS ENUM ('VOICE', 'VIDEO');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "introMediaType" "IntroMediaType",
ADD COLUMN     "introMediaUrl" TEXT,
ADD COLUMN     "photoVisibility" "PhotoVisibility" NOT NULL DEFAULT 'UNTIL_MATCH';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dailySwipeQuota" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "femaleOnlyMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requireVerifiedConnections" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "OnboardingState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "intent" TEXT,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "completedSteps" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "completedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "draftData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Swipe" (
    "id" TEXT NOT NULL,
    "swiperUserId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "direction" "SwipeDirection" NOT NULL,
    "context" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Swipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversationId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Household" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "listingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseholdMember" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HouseholdMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingState_userId_key" ON "OnboardingState"("userId");

-- CreateIndex
CREATE INDEX "OnboardingState_userId_idx" ON "OnboardingState"("userId");

-- CreateIndex
CREATE INDEX "Swipe_targetUserId_direction_idx" ON "Swipe"("targetUserId", "direction");

-- CreateIndex
CREATE INDEX "Swipe_swiperUserId_createdAt_idx" ON "Swipe"("swiperUserId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Swipe_swiperUserId_targetUserId_key" ON "Swipe"("swiperUserId", "targetUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_conversationId_key" ON "Match"("conversationId");

-- CreateIndex
CREATE INDEX "Match_userAId_matchedAt_idx" ON "Match"("userAId", "matchedAt");

-- CreateIndex
CREATE INDEX "Match_userBId_matchedAt_idx" ON "Match"("userBId", "matchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Match_userAId_userBId_key" ON "Match"("userAId", "userBId");

-- CreateIndex
CREATE INDEX "Household_listingId_idx" ON "Household"("listingId");

-- CreateIndex
CREATE INDEX "HouseholdMember_userId_idx" ON "HouseholdMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HouseholdMember_householdId_userId_key" ON "HouseholdMember"("householdId", "userId");

-- AddForeignKey
ALTER TABLE "OnboardingState" ADD CONSTRAINT "OnboardingState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Swipe" ADD CONSTRAINT "Swipe_swiperUserId_fkey" FOREIGN KEY ("swiperUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Swipe" ADD CONSTRAINT "Swipe_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Household" ADD CONSTRAINT "Household_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

```
## 5. End-to-end verification (V1 + V6)

Executed via **Playwright** driving **Chromium** against `npm run build && npm run start` (production server on localhost:3000), with **real** AWS Cognito + Neon. Server Actions returned **303** redirects after each onboarding step submit (captured on POST to `/onboarding/{n}`).

### Test users (masked)

- V1 masked email: ha***@harmony-living.test
- V6 masked email: ha***@harmony-living.test
- Cognito users are ensured by `scripts/ensure-phase3-e2e-users.mjs` (default emails `harmony.phase3.v1.e2e@harmony-living.test` / `harmony.phase3.v6.e2e@harmony-living.test`, password from `E2E_PHASE3_PASSWORD` or default documented in `.env.example`).

### Before V1 (after wipe)

- `userId` (masked): cmoj25…
- `OnboardingState` rows for user: 0

### V1 step results (JSON)

```json
{
  "maskedEmail": "ha***@harmony-living.test",
  "steps": [
    {
      "step": 1,
      "urlAfter": "http://localhost:3000/onboarding/2",
      "postStatuses": [
        303
      ],
      "db": {
        "onboardingState": {
          "intent": "seeker",
          "completedSteps": [
            1
          ]
        },
        "userRoles": "{SEEKER}"
      }
    },
    {
      "step": 2,
      "urlAfter": "http://localhost:3000/onboarding/3",
      "postStatuses": [
        303
      ],
      "db": {
        "profile": {
          "firstName": "E2E",
          "dateOfBirth": "1990-05-15 00:00:00",
          "gender": "PREFER_NOT_TO_SAY",
          "city": "Calgary"
        },
        "completedSteps": [
          1,
          2
        ]
      }
    },
    {
      "step": 3,
      "urlAfter": "http://localhost:3000/onboarding/4",
      "postStatuses": [
        303
      ],
      "db": {
        "preferencesCount": 0,
        "draftData": "{\"budgetMax\": 2000, \"budgetMin\": 600, \"moveInDate\": \"2026-08-01T00:00:00.000Z\", \"leaseMaxMonths\": 12, \"leaseMinMonths\": 6, \"preferredCities\": [\"Calgary\"], \"moveInFlexibilityDays\": 14, \"preferredNeighborhoods\": []}"
      }
    },
    {
      "step": 4,
      "urlAfter": "http://localhost:3000/onboarding/5",
      "postStatuses": [
        303
      ],
      "db": {
        "preferencesCount": 1,
        "draftData": "{}",
        "preferencesLifestyle": {
          "cleanliness": "AVERAGE",
          "schedule": "FLEXIBLE",
          "drinkingSelf": "never",
          "drinkingRoommate": "any"
        }
      }
    },
    {
      "step": 5,
      "urlAfter": "http://localhost:3000/onboarding/6",
      "postStatuses": [
        303
      ],
      "db": {
        "preferencesValues": {
          "faithPractice": null,
          "genderPreference": "ANY",
          "ageMin": 18,
          "ageMax": 99,
          "dealbreakers": []
        },
        "draftData": "{}"
      }
    },
    {
      "step": 6,
      "urlAfter": "http://localhost:3000/dashboard?welcome=1",
      "postStatuses": [
        303
      ],
      "hl_onboarded": {
        "value": "1",
        "httpOnly": true,
        "sameSite": "Lax",
        "expires": 1779998.878743358
      },
      "db": {
        "profile": {
          "bio": "",
          "languages": []
        },
        "privacyMode": "PUBLIC",
        "completedAt": "2026-04-28 20:07:58.682"
      }
    }
  ],
  "before": {
    "userIdMasked": "cmoj25…",
    "onboardingStateRows": 0
  }
}
```
### V6 draft promotion (JSON)

```json
{
  "maskedEmail": "ha***@harmony-living.test",
  "phases": [
    {
      "afterStep3": {
        "preferencesCount": 0,
        "draftDataSnippet": "{\"budgetMax\": 2000, \"budgetMin\": 600, \"moveInDate\": \"2026-09-01T00:00:00.000Z\", \"leaseMaxMonths\": 12, \"leaseMinMonths\": 6, \"preferredCities\": [\"Edmonton\"], \"moveInFlexibilityDays\": 14, \"preferredNeighborhoods\": []}"
      },
      "afterStep4": {
        "preferencesCount": 1,
        "draftData": "{}"
      }
    }
  ]
}
```
### Cookie `hl_onboarded` (step 6)

Observed in Playwright: `httpOnly: true`, `sameSite: Lax`, `value: "1"`, non-session `expires` set (30-day style maxAge from server `setOnboardedCookie`).

## 6. Verification gates (excerpt)

Run locally: `npm run lint`, `npx tsc --noEmit`, `npx prisma validate`, `npm run build`, `npm run test:e2e`.

## 7. Deviations / notes

- E2E uses Playwright (automated browser), not manual clicking; same network path as users (HTML forms → Server Actions).
- `userRoles` in raw SQL snapshots may appear as a Postgres array literal string (e.g. `{SEEKER}`).

## 8. Known issues / TODOs

- Photo upload remains disabled per spec.

## 9. Full file contents (WORKFLOW §5)

The following sections inline every primary Phase 3 source file listed in the pre-audit cleanup brief.

### `src/lib/dates.ts`

```typescript
/**
 * Canonical conversion: users enter a date string (YYYY-MM-DD) from an HTML
 * date input. We store it as that calendar date at UTC midnight. Age
 * calculations are then deterministic regardless of where the user is when
 * we compute their age. Never use the time component of the stored Date.
 */
export function dobToStoredDate(yyyyMmDd: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(yyyyMmDd)) {
    throw new Error(`Invalid date format: expected YYYY-MM-DD, got "${yyyyMmDd}"`);
  }
  return new Date(`${yyyyMmDd}T00:00:00.000Z`);
}

export function ageFromDob(dob: Date, now: Date = new Date()): number {
  const ageMs = now.getTime() - dob.getTime();
  return Math.floor(ageMs / (365.2425 * 24 * 60 * 60 * 1000));
}

export function isAtLeast18(dob: Date, now: Date = new Date()): boolean {
  return ageFromDob(dob, now) >= 18;
}

```
### `src/lib/log.ts`

```typescript
/**
 * Logging utility skeleton.
 *
 * Phase 3 ships a console-backed implementation. Phase 5 wires this up to
 * structured observability (a remote sink, structured fields, error tracking).
 *
 * Use this rather than bare console.log/console.error in any code path that
 * may surface in production.
 *
 * See ADR 0004 invariant 6 for the dealbreaker malformed-shape logging case
 * and ADR 0005 for swipe-deck malformed-data cases.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogFields = Record<string, unknown>;

function emit(level: LogLevel, msg: string, fields?: LogFields) {
  const payload = {
    level,
    msg,
    ts: new Date().toISOString(),
    ...fields,
  };
  if (level === 'error') {
    console.error(JSON.stringify(payload));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(payload));
  } else {
    console.log(JSON.stringify(payload));
  }
}

export const log = {
  debug: (msg: string, fields?: LogFields) => emit('debug', msg, fields),
  info: (msg: string, fields?: LogFields) => emit('info', msg, fields),
  warn: (msg: string, fields?: LogFields) => emit('warn', msg, fields),
  error: (msg: string, fields?: LogFields) => emit('error', msg, fields),
};

```
### `src/lib/onboarding/version.ts`

```typescript
/**
 * Bump this when the wizard's step structure changes (steps added, removed,
 * reordered, or step semantics changed). Existing rows with older versions
 * must be migrated explicitly — see ADR 0004.
 */
export const CURRENT_ONBOARDING_VERSION = 1 as const;

```
### `src/lib/onboarding/vocabulary.ts`

```typescript
import { z } from 'zod';

// drinkingSelf
export const DRINKING_SELF = [
  { value: 'never', label: 'Never' },
  { value: 'rarely', label: 'Rarely' },
  { value: 'socially', label: 'Socially' },
  { value: 'regularly', label: 'Regularly' },
] as const;
export const drinkingSelfSchema = z.enum(['never', 'rarely', 'socially', 'regularly']);

// drinkingRoommate (symmetric — no _ok suffix)
export const DRINKING_ROOMMATE = [
  { value: 'none', label: "Don't want a drinker" },
  { value: 'rarely', label: 'Rarely OK' },
  { value: 'socially', label: 'Socially OK' },
  { value: 'any', label: 'Any' },
] as const;
export const drinkingRoommateSchema = z.enum(['none', 'rarely', 'socially', 'any']);

// petsRoommate
export const PETS_ROOMMATE = [
  { value: 'none', label: 'No pets' },
  { value: 'cats_ok', label: 'Cats OK' },
  { value: 'dogs_ok', label: 'Dogs OK' },
  { value: 'small_only', label: 'Small pets only (caged/small)' },
  { value: 'any', label: 'Any pet' },
] as const;
export const petsRoommateSchema = z.enum(['none', 'cats_ok', 'dogs_ok', 'small_only', 'any']);

// guests
export const GUESTS = [
  { value: 'rarely', label: 'Rarely have guests' },
  { value: 'sometimes', label: 'Sometimes have guests' },
  { value: 'often', label: 'Often have guests' },
] as const;
export const guestsSchema = z.enum(['rarely', 'sometimes', 'often']);

// noiseTolerance
export const NOISE_TOLERANCE = [
  { value: 'quiet', label: 'Prefer quiet' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'lively', label: 'Prefer lively' },
] as const;
export const noiseToleranceSchema = z.enum(['quiet', 'moderate', 'lively']);

// cookingFrequency
export const COOKING_FREQUENCY = [
  { value: 'rarely', label: 'Rarely cook' },
  { value: 'sometimes', label: 'Cook sometimes' },
  { value: 'often', label: 'Cook often' },
  { value: 'daily', label: 'Cook daily' },
] as const;
export const cookingFrequencySchema = z.enum(['rarely', 'sometimes', 'often', 'daily']);

// dietaryPractice — NOTE the _personal vs _kitchen split
export const DIETARY_PRACTICE = [
  { value: 'none', label: 'No specific dietary practice' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'halal_personal', label: 'Halal (personal)' },
  { value: 'halal_kitchen', label: 'Halal (kitchen must be halal)' },
  { value: 'kosher_personal', label: 'Kosher (personal)' },
  { value: 'kosher_kitchen', label: 'Kosher (kitchen must be kosher)' },
  { value: 'other', label: 'Other' },
] as const;
export const dietaryPracticeSchema = z.enum([
  'none',
  'vegetarian',
  'vegan',
  'pescatarian',
  'halal_personal',
  'halal_kitchen',
  'kosher_personal',
  'kosher_kitchen',
  'other',
]);

```
### `src/lib/onboarding/schemas.ts`

```typescript
import { z } from 'zod';

export const dealbreakerSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('no_smoking') }),
  z.object({ kind: z.literal('no_pets') }),
  z.object({ kind: z.literal('gender'), value: z.enum(['male_only', 'female_only']) }),
  z.object({ kind: z.literal('faith_match') }),
  z.object({ kind: z.literal('no_drinking') }),
  z.object({ kind: z.literal('budget_max'), value: z.number().positive() }),
]);

export type Dealbreaker = z.infer<typeof dealbreakerSchema>;
export const dealbreakersSchema = z.array(dealbreakerSchema).max(10);

```
### `src/lib/onboarding/draft-schema.ts`

```typescript
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

```
### `src/lib/onboarding/step-schemas.ts`

```typescript
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

```
### `src/components/ui/checkbox.tsx`

```typescript
'use client';

import type { InputHTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  ref?: Ref<HTMLInputElement>;
  label?: string;
}

export function Checkbox({ className, label, id, ref, ...props }: CheckboxProps) {
  const input = (
    <span className="flex min-h-11 min-w-11 shrink-0 items-center justify-center">
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className={cn(
          'h-6 w-6 cursor-pointer rounded border-2 border-slate-300 text-primary-600 accent-primary-600 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'aria-invalid:border-red-500',
          className,
        )}
        {...props}
      />
    </span>
  );

  if (label) {
    return (
      <label
        htmlFor={id}
        className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-800"
      >
        {input}
        <span>{label}</span>
      </label>
    );
  }

  return input;
}

```
### `src/components/ui/chips.tsx`

```typescript
'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

export interface ChipsProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  caseSensitive?: boolean;
  className?: string;
  disabled?: boolean;
  id?: string;
}

function normalize(s: string, caseSensitive: boolean) {
  return caseSensitive ? s.trim() : s.trim().toLowerCase();
}

export function Chips({
  value,
  onChange,
  placeholder = 'Type and press Enter',
  maxItems,
  caseSensitive = false,
  className,
  disabled,
  id,
}: ChipsProps) {
  const [draft, setDraft] = useState('');

  const addTokens = useCallback(
    (raw: string) => {
      const parts = raw
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length === 0) return;

      const next = [...value];
      const seen = new Set(next.map((t) => normalize(t, caseSensitive)));

      for (const part of parts) {
        if (maxItems !== undefined && next.length >= maxItems) break;
        const key = normalize(part, caseSensitive);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        next.push(part);
      }
      onChange(next);
    },
    [caseSensitive, maxItems, onChange, value],
  );

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (draft.trim()) {
        addTokens(draft);
        setDraft('');
      }
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (text.includes(',')) {
      e.preventDefault();
      addTokens(text);
      setDraft('');
    }
  };

  return (
    <div
      className={cn(
        'flex min-h-11 w-full flex-wrap gap-2 rounded-[var(--radius-button)] border border-slate-300 bg-surface px-2 py-2',
        'focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/30',
        disabled && 'cursor-not-allowed bg-slate-50 opacity-60',
        className,
      )}
    >
      {value.map((chip, i) => (
        <span
          key={`${chip}-${i}`}
          className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-sm text-primary-900"
        >
          <span>{chip}</span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => removeAt(i)}
            className="rounded p-0.5 text-primary-700 hover:bg-primary-200/80 disabled:opacity-50"
            aria-label={`Remove ${chip}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        id={id}
        type="text"
        disabled={disabled}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        placeholder={value.length === 0 ? placeholder : undefined}
        className="min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-1 text-base text-slate-900 outline-none placeholder:text-slate-400"
      />
    </div>
  );
}

```
### `src/components/ui/date-picker.tsx`

```typescript
'use client';

import type { InputHTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export interface DatePickerProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'min' | 'max'> {
  ref?: Ref<HTMLInputElement>;
  value?: string;
  onChange?: (value: string) => void;
  min?: string;
  max?: string;
  label?: string;
  error?: string;
}

export function DatePicker({
  className,
  value,
  onChange,
  min,
  max,
  label,
  error,
  id,
  ref,
  ...props
}: DatePickerProps) {
  const inputId = id ?? props.name;

  return (
    <div className="w-full space-y-1.5">
      {label ? (
        <Label htmlFor={inputId} className="block">
          {label}
        </Label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        type="date"
        value={value ?? ''}
        min={min}
        max={max}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          'flex min-h-11 w-full rounded-[var(--radius-button)] border border-slate-300 bg-surface px-4 py-2 text-base text-slate-900 transition-colors',
          'focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
          error &&
            'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/30',
          className,
        )}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

```
### `src/components/ui/radio-group.tsx`

```typescript
'use client';

import { cn } from '@/lib/utils';

export interface RadioGroupOption {
  value: string;
  label: string;
}

export interface RadioGroupProps {
  name: string;
  options: RadioGroupOption[];
  value: string | undefined;
  onChange: (value: string) => void;
  direction?: 'vertical' | 'horizontal';
  className?: string;
  disabled?: boolean;
  'aria-invalid'?: boolean;
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  direction = 'vertical',
  className,
  disabled,
  'aria-invalid': ariaInvalid,
}: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      aria-invalid={ariaInvalid}
      className={cn(
        'flex gap-3',
        direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className,
      )}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-[var(--radius-button)] border px-4 py-3 transition-colors',
              selected
                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20'
                : 'border-slate-200 bg-surface hover:border-slate-300',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(opt.value)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-300 bg-white peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/40',
                  selected && 'border-primary-600',
                )}
                aria-hidden
              >
                {selected ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-primary-600" />
                ) : null}
              </span>
            </span>
            <span className="text-sm font-medium text-slate-800">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}

```
### `src/components/ui/select.tsx`

```typescript
'use client';

import type { SelectHTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  ref?: Ref<HTMLSelectElement>;
}

export function Select({ className, ref, children, ...props }: SelectProps) {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        className={cn(
          'flex min-h-11 w-full appearance-none rounded-[var(--radius-button)] border border-slate-300 bg-surface px-4 py-2 pr-10 text-base text-slate-900 transition-colors',
          'focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
          'aria-invalid:border-red-500 aria-invalid:focus-visible:border-red-500 aria-invalid:focus-visible:ring-red-500/30',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <span
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
        aria-hidden
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path
            d="m6 8 4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}

```
### `src/components/ui/slider.tsx`

```typescript
'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

export interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatLabel?: (value: number) => string;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export function Slider({
  min,
  max,
  step,
  value,
  onChange,
  formatLabel = (n) => String(n),
  label,
  description,
  className,
  disabled,
}: SliderProps) {
  return (
    <div className={cn('w-full space-y-2', className)}>
      {label ? (
        <div className="text-sm font-medium text-slate-700">{label}</div>
      ) : null}
      {description ? (
        <p className="text-sm text-slate-500">{description}</p>
      ) : null}
      <div className="flex justify-between gap-4 text-sm font-medium text-primary-700">
        <span>{formatLabel(value[0])}</span>
        <span>{formatLabel(value[1])}</span>
      </div>
      <SliderPrimitive.Root
        className="relative flex h-8 w-full touch-none select-none items-center"
        min={min}
        max={max}
        step={step}
        value={[value[0], value[1]]}
        onValueChange={(v) => {
          const a = v[0] ?? min;
          const b = v[1] ?? max;
          onChange(a <= b ? [a, b] : [b, a]);
        }}
        disabled={disabled}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow rounded-full bg-slate-200">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary-500" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            'block h-5 w-5 rounded-full border-2 border-primary-600 bg-white shadow-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
            'disabled:pointer-events-none disabled:opacity-40',
          )}
          aria-label="Minimum"
        />
        <SliderPrimitive.Thumb
          className={cn(
            'block h-5 w-5 rounded-full border-2 border-primary-600 bg-white shadow-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
            'disabled:pointer-events-none disabled:opacity-40',
          )}
          aria-label="Maximum"
        />
      </SliderPrimitive.Root>
    </div>
  );
}

```
### `src/components/ui/textarea.tsx`

```typescript
'use client';

import type { TextareaHTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({
  className,
  rows = 4,
  ref,
  ...props
}: TextareaProps) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'flex min-h-11 w-full resize-none rounded-[var(--radius-button)] border border-slate-300 bg-surface px-4 py-2 text-base text-slate-900 placeholder:text-slate-400 transition-colors',
        'focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30',
        'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
        'aria-invalid:border-red-500 aria-invalid:focus-visible:border-red-500 aria-invalid:focus-visible:ring-red-500/30',
        className,
      )}
      {...props}
    />
  );
}

```
### `src/server/services/onboarding.ts`

```typescript
import 'server-only';

import type { Gender, Preferences, PrivacyMode, Profile } from '@generated/prisma/client';
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

export class OnboardingError extends Error {
  constructor(
    public readonly code: OnboardingErrorCode,
    message?: string,
  ) {
    super(message ?? code);
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

function intentToRoles(intent: 'seeker' | 'lister' | 'both'): Array<'SEEKER' | 'LISTER'> {
  switch (intent) {
    case 'seeker':
      return ['SEEKER'];
    case 'lister':
      return ['LISTER'];
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
  input: { intent: 'seeker' | 'lister' | 'both' },
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

  await prisma.profile.upsert({
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

async function saveProfileFinish(
  userId: string,
  input: ProfileFinishInput,
): Promise<void> {
  const privacyMode = input.privacyMode as PrivacyMode;

  await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new OnboardingError('NOT_FOUND', 'Profile missing — complete basics first');
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
  });
}

function lowestIncompleteStep(completed: number[]): number {
  const set = new Set(completed);
  for (let s = 1; s <= 6; s += 1) {
    if (!set.has(s)) return s;
  }
  return 7;
}

async function markStepComplete(userId: string, step: number): Promise<void> {
  if (step < 1 || step > 6) {
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
      currentStep: next === 7 ? 6 : next,
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
  const needed = [1, 2, 3, 4, 5, 6];
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
  saveProfileFinish,
  markStepComplete,
  getResumeStep,
  completeOnboarding,
  getOnboardingFormData,
};

```
### `src/features/onboarding/lib/actions.ts`

```typescript
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
    await onboardingService.saveProfileFinish(userId, {
      bio: data.bio,
      languages: data.languages,
      privacyMode: data.privacyMode,
    });
    await onboardingService.markStepComplete(userId, 6);
    await onboardingService.completeOnboarding(userId);
  } catch (err) {
    log.error('saveProfileFinishAction failed', { userId, err: String(err) });
    if (err instanceof OnboardingError) throw err;
    throw new OnboardingError('UNKNOWN', String(err));
  }

  await setOnboardedCookie();
  redirect('/dashboard?welcome=1');
}

```
### `src/features/onboarding/components/basics-step.tsx`

```typescript
'use client';

import { useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { basicsSchema, type BasicsForm } from '@/lib/onboarding/step-schemas';
import { dobToStoredDate, isAtLeast18 } from '@/lib/dates';
import { saveBasicsAction } from '@/features/onboarding/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radio-group';
import { DatePicker } from '@/components/ui/date-picker';

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'NON_BINARY', label: 'Non-binary' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

export function BasicsStep({
  initial,
}: {
  initial: {
    firstName?: string;
    dateOfBirth?: string;
    gender?: BasicsForm['gender'];
    occupation?: string;
    city?: string;
  };
}) {
  const [pending, start] = useTransition();
  const form = useForm<BasicsForm>({
    resolver: zodResolver(basicsSchema),
    defaultValues: {
      firstName: initial.firstName ?? '',
      dateOfBirth: initial.dateOfBirth ?? '',
      gender: initial.gender ?? 'PREFER_NOT_TO_SAY',
      occupation: initial.occupation ?? '',
      city: initial.city ?? '',
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>About you</CardTitle>
        <p className="text-sm text-slate-500">
          This information powers compatibility matching and safety features.
        </p>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit((data) => {
            const dob = dobToStoredDate(data.dateOfBirth);
            if (!isAtLeast18(dob)) {
              form.setError('dateOfBirth', { message: 'You must be at least 18.' });
              return;
            }
            start(async () => {
              await saveBasicsAction(data);
            });
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" {...form.register('firstName')} />
            {form.formState.errors.firstName ? (
              <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
            ) : null}
          </div>

          <Controller
            name="dateOfBirth"
            control={form.control}
            render={({ field, fieldState }) => (
              <DatePicker
                label="Date of birth"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <div className="space-y-2">
            <Label>Gender</Label>
            <Controller
              name="gender"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  name="gender"
                  options={GENDER_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  aria-invalid={!!form.formState.errors.gender}
                />
              )}
            />
            {form.formState.errors.gender ? (
              <p className="text-sm text-red-600">{form.formState.errors.gender.message}</p>
            ) : null}
            <WhyWeAskGender />
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation (optional)</Label>
            <Input id="occupation" {...form.register('occupation')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City you&apos;re looking in</Label>
            <Input id="city" {...form.register('city')} />
            {form.formState.errors.city ? (
              <p className="text-sm text-red-600">{form.formState.errors.city.message}</p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Saving…' : 'Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function WhyWeAskGender() {
  return (
    <details className="text-sm text-slate-600">
      <summary className="cursor-pointer font-medium text-primary-700">
        Why we ask
      </summary>
      <p className="mt-2 rounded-lg bg-slate-50 p-3">
        We ask so we can match you with people who share or respect your identity. You can
        choose what&apos;s visible to others in your privacy settings.
      </p>
    </details>
  );
}

```
### `src/features/onboarding/components/housing-prefs-step.tsx`

```typescript
'use client';

import { useTransition } from 'react';
import type { Resolver } from 'react-hook-form';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  housingPrefsSchema,
  type HousingPrefsForm,
} from '@/lib/onboarding/step-schemas';
import { saveHousingPrefsAction } from '@/features/onboarding/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { DatePicker } from '@/components/ui/date-picker';
import { Chips } from '@/components/ui/chips';

function isoDateOnly(iso?: string): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function HousingPrefsStep({ initial }: { initial: Partial<HousingPrefsForm> }) {
  const [pending, start] = useTransition();
  const defaultBudgetMin = initial.budgetMin ?? 600;
  const defaultBudgetMax = initial.budgetMax ?? 2000;

  const form = useForm<HousingPrefsForm>({
    resolver: zodResolver(housingPrefsSchema) as Resolver<HousingPrefsForm>,
    defaultValues: {
      budgetMin: defaultBudgetMin,
      budgetMax: defaultBudgetMax,
      moveInDate: isoDateOnly(initial.moveInDate) || '',
      moveInFlexibilityDays: initial.moveInFlexibilityDays ?? 14,
      leaseMinMonths: initial.leaseMinMonths ?? 6,
      leaseMaxMonths: initial.leaseMaxMonths ?? 12,
      preferredCities: initial.preferredCities ?? [],
      preferredNeighborhoods: initial.preferredNeighborhoods ?? [],
    },
  });

  const b0 = useWatch({ control: form.control, name: 'budgetMin', defaultValue: defaultBudgetMin });
  const b1 = useWatch({ control: form.control, name: 'budgetMax', defaultValue: defaultBudgetMax });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Housing preferences</CardTitle>
        <p className="text-sm text-slate-500">
          Monthly budget is in CAD. You can refine this anytime.
        </p>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((data) => {
            start(async () => {
              await saveHousingPrefsAction({
                ...data,
                moveInDate: data.moveInDate,
              });
            });
          })}
        >
          <Controller
            name="budgetMin"
            control={form.control}
            render={() => (
              <Slider
                label="Monthly budget (CAD)"
                description="Drag both handles to set your range."
                min={200}
                max={6000}
                step={50}
                value={[b0 ?? defaultBudgetMin, b1 ?? defaultBudgetMax]}
                onChange={(range) => {
                  form.setValue('budgetMin', range[0], { shouldValidate: true });
                  form.setValue('budgetMax', range[1], { shouldValidate: true });
                }}
                formatLabel={(n) => `$${n.toLocaleString('en-CA')}`}
              />
            )}
          />
          {form.formState.errors.budgetMin || form.formState.errors.budgetMax ? (
            <p className="text-sm text-red-600">
              {form.formState.errors.budgetMax?.message ??
                form.formState.errors.budgetMin?.message}
            </p>
          ) : null}

          <Controller
            name="moveInDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <DatePicker
                id="onboarding-move-in-date"
                label="Target move-in date"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="flex">Move-in flexibility (days)</Label>
              <Input
                id="flex"
                type="number"
                min={0}
                {...form.register('moveInFlexibilityDays', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leaseMin">Min lease (months)</Label>
              <Input
                id="leaseMin"
                type="number"
                min={1}
                {...form.register('leaseMinMonths', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leaseMax">Max lease (months)</Label>
              <Input
                id="leaseMax"
                type="number"
                min={1}
                {...form.register('leaseMaxMonths', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preferred cities</Label>
            <Controller
              name="preferredCities"
              control={form.control}
              render={({ field }) => (
                <Chips
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="e.g. Calgary — press Enter"
                />
              )}
            />
            {form.formState.errors.preferredCities ? (
              <p className="text-sm text-red-600">Add at least one city.</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Preferred neighborhoods (optional)</Label>
            <Controller
              name="preferredNeighborhoods"
              control={form.control}
              render={({ field }) => (
                <Chips
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Neighborhood — press Enter"
                />
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Saving…' : 'Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

```
### `src/features/onboarding/components/intent-step.tsx`

```typescript
'use client';

import { useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { intentSchema, type IntentForm } from '@/lib/onboarding/step-schemas';
import { saveIntentAction } from '@/features/onboarding/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const OPTIONS = [
  { value: 'seeker', label: "I'm looking for a room / roommate" },
  { value: 'lister', label: "I'm listing a spare room" },
  { value: 'both', label: 'Both' },
];

export function IntentStep({ initialIntent }: { initialIntent: string | null }) {
  const [pending, start] = useTransition();
  const form = useForm<IntentForm>({
    resolver: zodResolver(intentSchema),
    defaultValues: {
      intent:
        initialIntent === 'seeker' || initialIntent === 'lister' || initialIntent === 'both'
          ? initialIntent
          : undefined,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>What brings you here?</CardTitle>
        <p className="text-sm text-slate-500">
          We use this to tailor your experience. You can change it later.
        </p>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((data) => {
            start(async () => {
              await saveIntentAction(data);
            });
          })}
        >
          <div className="space-y-2">
            <Label>Your goal</Label>
            <Controller
              name="intent"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  name="intent"
                  options={OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  aria-invalid={!!form.formState.errors.intent}
                />
              )}
            />
            {form.formState.errors.intent ? (
              <p className="text-sm text-red-600">{form.formState.errors.intent.message}</p>
            ) : null}
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Saving…' : 'Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

```
### `src/features/onboarding/components/lifestyle-step.tsx`

```typescript
'use client';

import { useTransition } from 'react';
import type { Control, FieldPath } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lifestyleSchema, type LifestyleForm } from '@/lib/onboarding/step-schemas';
import {
  COOKING_FREQUENCY,
  DRINKING_ROOMMATE,
  DRINKING_SELF,
  GUESTS,
  NOISE_TOLERANCE,
  PETS_ROOMMATE,
} from '@/lib/onboarding/vocabulary';
import { saveLifestyleAction } from '@/features/onboarding/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';

const CLEAN_OPTS = [
  { value: 'VERY_TIDY', label: 'Very tidy' },
  { value: 'TIDY', label: 'Tidy' },
  { value: 'AVERAGE', label: 'Average' },
  { value: 'RELAXED', label: 'Relaxed' },
];

const SCHED_OPTS = [
  { value: 'EARLY_BIRD', label: 'Early bird' },
  { value: 'NIGHT_OWL', label: 'Night owl' },
  { value: 'FLEXIBLE', label: 'Flexible' },
  { value: 'SHIFT_WORKER', label: 'Shift worker' },
];

function VocabSelect<K extends FieldPath<LifestyleForm>>({
  label,
  name,
  control,
  options,
}: {
  label: string;
  name: K;
  control: Control<LifestyleForm>;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select {...field} value={field.value as string}>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        )}
      />
    </div>
  );
}

export function LifestyleStep({ initial }: { initial: Partial<LifestyleForm> }) {
  const [pending, start] = useTransition();
  const form = useForm<LifestyleForm>({
    resolver: zodResolver(lifestyleSchema),
    defaultValues: {
      cleanliness: initial.cleanliness ?? 'AVERAGE',
      schedule: initial.schedule ?? 'FLEXIBLE',
      smokingSelf: initial.smokingSelf ?? false,
      smokingRoommate: initial.smokingRoommate ?? false,
      drinkingSelf: initial.drinkingSelf ?? 'never',
      drinkingRoommate: initial.drinkingRoommate ?? 'any',
      pets: initial.pets ?? false,
      petsRoommate: initial.petsRoommate ?? 'any',
      guests: initial.guests ?? 'sometimes',
      noiseTolerance: initial.noiseTolerance ?? 'moderate',
      cookingFrequency: initial.cookingFrequency ?? 'sometimes',
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lifestyle</CardTitle>
        <p className="text-sm text-slate-500">Honest answers help us find compatible roommates.</p>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((data) => {
            start(async () => {
              await saveLifestyleAction(data);
            });
          })}
        >
          <div className="space-y-2">
            <Label>Cleanliness</Label>
            <Controller
              name="cleanliness"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  name="cleanliness"
                  options={CLEAN_OPTS}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Daily schedule</Label>
            <Controller
              name="schedule"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  name="schedule"
                  options={SCHED_OPTS}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-3">
            <Controller
              name="smokingSelf"
              control={form.control}
              render={({ field }) => (
                <Checkbox
                  id="smokingSelf"
                  label="I smoke"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <Controller
              name="smokingRoommate"
              control={form.control}
              render={({ field }) => (
                <Checkbox
                  id="smokingRoommate"
                  label="OK with a roommate who smokes"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <Controller
              name="pets"
              control={form.control}
              render={({ field }) => (
                <Checkbox
                  id="pets"
                  label="I have a pet"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
          </div>

          <VocabSelect
            label="Your drinking"
            name="drinkingSelf"
            control={form.control}
            options={DRINKING_SELF}
          />
          <VocabSelect
            label="Roommate drinking"
            name="drinkingRoommate"
            control={form.control}
            options={DRINKING_ROOMMATE}
          />
          <VocabSelect
            label="Roommate pets"
            name="petsRoommate"
            control={form.control}
            options={PETS_ROOMMATE}
          />
          <VocabSelect
            label="Guests"
            name="guests"
            control={form.control}
            options={GUESTS}
          />
          <VocabSelect
            label="Noise preference"
            name="noiseTolerance"
            control={form.control}
            options={NOISE_TOLERANCE}
          />
          <VocabSelect
            label="Cooking frequency"
            name="cookingFrequency"
            control={form.control}
            options={COOKING_FREQUENCY}
          />

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Saving…' : 'Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

```
### `src/features/onboarding/components/onboarding-progress.tsx`

```typescript
'use client';

import { usePathname } from 'next/navigation';

export function OnboardingProgress() {
  const pathname = usePathname();
  const m = pathname.match(/\/onboarding\/(\d+)/);
  const current = m ? Number(m[1]) : 1;

  return (
    <div className="mb-8">
      <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
        <span>
          Step {current} of 6
        </span>
        <span>{Math.round((current / 6) * 100)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-primary-600 transition-all"
          style={{ width: `${(current / 6) * 100}%` }}
        />
      </div>
    </div>
  );
}

```
### `src/features/onboarding/components/profile-finish-step.tsx`

```typescript
'use client';

import { useTransition } from 'react';
import type { Resolver } from 'react-hook-form';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileFinishSchema, type ProfileFinishForm } from '@/lib/onboarding/step-schemas';
import { saveProfileFinishAction } from '@/features/onboarding/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup } from '@/components/ui/radio-group';
import { Chips } from '@/components/ui/chips';

const PRIVACY = [
  { value: 'PUBLIC', label: 'Public — visible in discovery' },
  { value: 'MATCHES_ONLY', label: 'Matches only' },
  { value: 'HIDDEN', label: 'Hidden until I connect' },
];

export function ProfileFinishStep({
  initial,
}: {
  initial: { bio?: string; languages?: string[]; privacyMode?: ProfileFinishForm['privacyMode'] };
}) {
  const [pending, start] = useTransition();
  const form = useForm<ProfileFinishForm>({
    resolver: zodResolver(profileFinishSchema) as Resolver<ProfileFinishForm>,
    defaultValues: {
      bio: initial.bio ?? '',
      languages: initial.languages ?? [],
      privacyMode: initial.privacyMode ?? 'PUBLIC',
    },
  });

  const bio = useWatch({ control: form.control, name: 'bio', defaultValue: '' });
  const bioLen = bio?.length ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finish your profile</CardTitle>
        <p className="text-sm text-slate-500">
          You can finish onboarding without a photo. Add one anytime from Settings → Profile.
        </p>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((data) => {
            start(async () => {
              await saveProfileFinishAction(data);
            });
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="bio">Bio (optional)</Label>
            <Textarea id="bio" maxLength={500} {...form.register('bio')} />
            <p className="text-right text-xs text-slate-500">{bioLen}/500</p>
          </div>

          <div className="space-y-2">
            <Label>Languages you speak</Label>
            <Controller
              name="languages"
              control={form.control}
              render={({ field }) => (
                <Chips
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Type a language, press Enter"
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Privacy</Label>
            <Controller
              name="privacyMode"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  name="privacy"
                  options={PRIVACY}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-600">
            <p className="font-medium text-slate-800">Photo</p>
            <p className="mt-2">
              You can finish onboarding without a photo. Add one anytime from Settings → Profile.
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-4 opacity-60"
              aria-disabled
              disabled
            >
              Photo upload coming in a future update
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Finishing…' : 'Complete onboarding'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

```
### `src/features/onboarding/components/values-step.tsx`

```typescript
'use client';

import { useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { valuesSchema, type ValuesForm } from '@/lib/onboarding/step-schemas';
import { DIETARY_PRACTICE } from '@/lib/onboarding/vocabulary';
import { saveValuesAction } from '@/features/onboarding/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';

const GENDER_PREF = [
  { value: 'MALE_ONLY', label: 'Male roommate only' },
  { value: 'FEMALE_ONLY', label: 'Female roommate only' },
  { value: 'ANY', label: 'Any gender' },
  { value: 'NON_BINARY_INCLUSIVE', label: 'Non-binary inclusive' },
];

const FAITH_PRACTICE = [
  { value: 'PRACTICING', label: 'Practicing' },
  { value: 'CULTURAL', label: 'Cultural' },
  { value: 'NOT_PRACTICING', label: 'Not practicing' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

const uiSchema = z.object({
  faithPractice: z.string().optional(),
  faith: z.string().optional(),
  dietaryPractice: z.string().optional(),
  prayerSpaceNeeded: z.boolean(),
  genderPreference: z.enum(['MALE_ONLY', 'FEMALE_ONLY', 'ANY', 'NON_BINARY_INCLUSIVE']),
  ageMin: z.number().int().min(18),
  ageMax: z.number().int().max(99),
  faithMatchRequired: z.boolean(),
  personality: z.string().optional(),
  socialLevel: z.number().int().min(1).max(5),
  dNoSmoking: z.boolean(),
  dNoPets: z.boolean(),
  dFaith: z.boolean(),
  dNoDrinking: z.boolean(),
  dGender: z.enum(['', 'male_only', 'female_only']),
  dBudgetMax: z.string(),
});

type UiValues = z.infer<typeof uiSchema>;

function buildDealbreakers(data: UiValues): unknown[] {
  const out: unknown[] = [];
  if (data.dNoSmoking) out.push({ kind: 'no_smoking' });
  if (data.dNoPets) out.push({ kind: 'no_pets' });
  if (data.dFaith) out.push({ kind: 'faith_match' });
  if (data.dNoDrinking) out.push({ kind: 'no_drinking' });
  if (data.dGender === 'male_only') out.push({ kind: 'gender', value: 'male_only' });
  if (data.dGender === 'female_only') out.push({ kind: 'gender', value: 'female_only' });
  const n = Number(data.dBudgetMax);
  if (data.dBudgetMax.trim() && Number.isFinite(n) && n > 0) {
    out.push({ kind: 'budget_max', value: n });
  }
  return out;
}

function parseInitialDeals(initial: Partial<ValuesForm>) {
  const raw = initial.dealbreakers;
  const deals = Array.isArray(raw) ? raw : [];
  const has = (k: string) =>
    deals.some((d) => typeof d === 'object' && d && 'kind' in d && (d as { kind: string }).kind === k);
  const genderDeal = deals.find(
    (d) => typeof d === 'object' && d && 'kind' in d && (d as { kind: string }).kind === 'gender',
  ) as { kind: 'gender'; value: 'male_only' | 'female_only' } | undefined;
  const budgetDeal = deals.find(
    (d) => typeof d === 'object' && d && 'kind' in d && (d as { kind: string }).kind === 'budget_max',
  ) as { kind: 'budget_max'; value: number } | undefined;
  return {
    dNoSmoking: has('no_smoking'),
    dNoPets: has('no_pets'),
    dFaith: has('faith_match'),
    dNoDrinking: has('no_drinking'),
    dGender:
      genderDeal?.value === 'male_only'
        ? ('male_only' as const)
        : genderDeal?.value === 'female_only'
          ? ('female_only' as const)
          : ('' as const),
    dBudgetMax: budgetDeal?.value ? String(budgetDeal.value) : '',
  };
}

export function ValuesStep({ initial }: { initial: Partial<ValuesForm> }) {
  const [pending, start] = useTransition();
  const d0 = parseInitialDeals(initial);

  const form = useForm<UiValues>({
    resolver: zodResolver(uiSchema),
    defaultValues: {
      faithPractice: initial.faithPractice ?? '',
      faith: initial.faith ?? '',
      dietaryPractice: initial.dietaryPractice ?? '',
      prayerSpaceNeeded: initial.prayerSpaceNeeded ?? false,
      genderPreference: initial.genderPreference ?? 'ANY',
      ageMin: initial.ageMin ?? 18,
      ageMax: initial.ageMax ?? 99,
      faithMatchRequired: initial.faithMatchRequired ?? false,
      personality: initial.personality ?? '',
      socialLevel: initial.socialLevel ?? 3,
      ...d0,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Values & boundaries</CardTitle>
        <p className="text-sm text-slate-500">
          These answers shape who we suggest as compatible roommates.
        </p>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((ui) => {
            start(async () => {
              try {
                const dealbreakers = buildDealbreakers(ui);
                const payload = valuesSchema.parse({
                  faithPractice: ui.faithPractice || undefined,
                  faith: ui.faith,
                  dietaryPractice: ui.dietaryPractice || undefined,
                  prayerSpaceNeeded: ui.prayerSpaceNeeded,
                  genderPreference: ui.genderPreference,
                  ageMin: ui.ageMin,
                  ageMax: ui.ageMax,
                  faithMatchRequired: ui.faithMatchRequired,
                  personality: ui.personality,
                  socialLevel: ui.socialLevel,
                  dealbreakers,
                });
                await saveValuesAction(payload);
              } catch (e) {
                form.setError('root', {
                  message: e instanceof Error ? e.message : 'Something went wrong',
                });
              }
            });
          })}
        >
          <div className="space-y-2">
            <Label>Faith practice</Label>
            <Controller
              name="faithPractice"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  <option value="">Skip</option>
                  {FAITH_PRACTICE.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="faith">Faith / tradition (optional)</Label>
            <Input id="faith" {...form.register('faith')} />
            <details className="text-sm text-slate-600">
              <summary className="cursor-pointer font-medium text-primary-700">Why we ask</summary>
              <p className="mt-2 rounded-lg bg-slate-50 p-3">
                We ask so we can match you with people who share or respect your practice.
              </p>
            </details>
          </div>

          <div className="space-y-2">
            <Label>Dietary practice</Label>
            <Controller
              name="dietaryPractice"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)}>
                  <option value="">Skip</option>
                  {DIETARY_PRACTICE.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              )}
            />
          </div>

          <Controller
            name="prayerSpaceNeeded"
            control={form.control}
            render={({ field }) => (
              <Checkbox
                id="prayer"
                label="I need access to prayer / meditation space"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            )}
          />

          <div className="space-y-2">
            <Label>Roommate gender preference</Label>
            <Controller
              name="genderPreference"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  name="genderPreference"
                  options={GENDER_PREF}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <details className="text-sm text-slate-600">
              <summary className="cursor-pointer font-medium text-primary-700">Why we ask</summary>
              <p className="mt-2 rounded-lg bg-slate-50 p-3">
                This helps us respect comfort and faith-based housing preferences.
              </p>
            </details>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ageMin">Minimum roommate age</Label>
              <Input id="ageMin" type="number" {...form.register('ageMin', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ageMax">Maximum roommate age</Label>
              <Input id="ageMax" type="number" {...form.register('ageMax', { valueAsNumber: true })} />
            </div>
          </div>

          <Controller
            name="faithMatchRequired"
            control={form.control}
            render={({ field }) => (
              <Checkbox
                id="faithMatch"
                label="Faith match is important for me"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            )}
          />

          <div className="space-y-2">
            <Label htmlFor="personality">Personality notes (optional)</Label>
            <Textarea id="personality" rows={3} {...form.register('personality')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social">Social energy (1 = quiet, 5 = very social)</Label>
            <Input
              id="social"
              type="number"
              min={1}
              max={5}
              {...form.register('socialLevel', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-3 rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-800">Dealbreakers (optional)</p>
            <Controller
              name="dNoSmoking"
              control={form.control}
              render={({ field }) => (
                <Checkbox
                  id="d1"
                  label="No smoking"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <Controller
              name="dNoPets"
              control={form.control}
              render={({ field }) => (
                <Checkbox
                  id="d2"
                  label="No pets"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <Controller
              name="dFaith"
              control={form.control}
              render={({ field }) => (
                <Checkbox
                  id="d3"
                  label="Must share my faith practice"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <Controller
              name="dNoDrinking"
              control={form.control}
              render={({ field }) => (
                <Checkbox
                  id="d4"
                  label="No drinking"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <div className="space-y-2">
              <Label>Gender dealbreaker (optional)</Label>
              <Controller
                name="dGender"
                control={form.control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(e.target.value as UiValues['dGender'])
                    }
                  >
                    <option value="">None</option>
                    <option value="male_only">Male roommate only</option>
                    <option value="female_only">Female roommate only</option>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dBudget">Max rent dealbreaker (optional, CAD)</Label>
              <Input id="dBudget" {...form.register('dBudgetMax')} placeholder="e.g. 1200" />
            </div>
          </div>

          {form.formState.errors.root ? (
            <p className="text-sm text-red-600">{String(form.formState.errors.root.message)}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Saving…' : 'Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

```
### `src/features/onboarding/components/why-we-ask.tsx`

```typescript
'use client';

import { useState } from 'react';

export function WhyWeAsk({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="text-sm">
      <button
        type="button"
        className="font-medium text-primary-700 underline decoration-primary-300 underline-offset-2 hover:text-primary-800"
        onClick={() => setOpen((o) => !o)}
      >
        Why we ask
      </button>
      {open ? (
        <p className="mt-2 rounded-lg bg-slate-50 p-3 text-slate-600">{children}</p>
      ) : null}
    </div>
  );
}

```
### `src/app/onboarding/layout.tsx`

```typescript
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { OnboardingProgress } from '@/features/onboarding/components/onboarding-progress';

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireUser();
  const row = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { onboardingState: { select: { completedAt: true } } },
  });
  if (row?.onboardingState?.completedAt) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-lg">
        <p className="mb-6 text-center text-lg font-semibold tracking-tight text-slate-900">
          harmony<span className="text-primary-600">.</span>living
        </p>
        <OnboardingProgress />
        {children}
      </div>
    </div>
  );
}

```
### `src/app/onboarding/page.tsx`

```typescript
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { onboardingService } from '@/server/services/onboarding';

export default async function OnboardingIndexPage() {
  const auth = await requireUser();
  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { id: true },
  });
  if (!user) {
    redirect('/login');
  }
  const step = await onboardingService.getResumeStep(user.id);
  redirect(`/onboarding/${step}`);
}

```
### `src/app/onboarding/[step]/page.tsx`

```typescript
import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { onboardingService } from '@/server/services/onboarding';
import { IntentStep } from '@/features/onboarding/components/intent-step';
import { BasicsStep } from '@/features/onboarding/components/basics-step';
import { HousingPrefsStep } from '@/features/onboarding/components/housing-prefs-step';
import { LifestyleStep } from '@/features/onboarding/components/lifestyle-step';
import { ValuesStep } from '@/features/onboarding/components/values-step';
import { ProfileFinishStep } from '@/features/onboarding/components/profile-finish-step';
import type { BasicsForm } from '@/lib/onboarding/step-schemas';
import type { LifestyleForm, ValuesForm } from '@/lib/onboarding/step-schemas';

export default async function OnboardingStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step: stepStr } = await params;
  const stepNum = Number.parseInt(stepStr, 10);
  if (Number.isNaN(stepNum) || stepNum < 1 || stepNum > 6) {
    notFound();
  }

  const auth = await requireUser();
  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { id: true, privacyMode: true },
  });
  if (!user) {
    redirect('/login');
  }

  const data = await onboardingService.getOnboardingFormData(user.id);
  if (data.completedAt) {
    redirect('/dashboard');
  }

  const resume = await onboardingService.getResumeStep(user.id);
  if (stepNum > resume) {
    redirect(`/onboarding/${resume}`);
  }

  const m = data.mergedDraft;
  const p = data.profile;

  switch (stepNum) {
    case 1:
      return <IntentStep initialIntent={data.intent} />;
    case 2:
      return (
        <BasicsStep
          initial={{
            firstName: p?.firstName,
            dateOfBirth: p?.dateOfBirth
              ? p.dateOfBirth.toISOString().slice(0, 10)
              : undefined,
            gender: p?.gender as BasicsForm['gender'] | undefined,
            occupation: p?.occupation ?? undefined,
            city: p?.city,
          }}
        />
      );
    case 3:
      return (
        <HousingPrefsStep
          initial={{
            budgetMin: m.budgetMin,
            budgetMax: m.budgetMax,
            moveInDate: m.moveInDate,
            moveInFlexibilityDays: m.moveInFlexibilityDays,
            leaseMinMonths: m.leaseMinMonths,
            leaseMaxMonths: m.leaseMaxMonths,
            preferredCities: m.preferredCities,
            preferredNeighborhoods: m.preferredNeighborhoods,
          }}
        />
      );
    case 4:
      return <LifestyleStep initial={m as Partial<LifestyleForm>} />;
    case 5:
      return <ValuesStep initial={m as Partial<ValuesForm>} />;
    case 6:
      return (
        <ProfileFinishStep
          initial={{
            bio: p?.bio ?? undefined,
            languages: p?.languages ?? [],
            privacyMode: user.privacyMode as 'PUBLIC' | 'MATCHES_ONLY' | 'HIDDEN',
          }}
        />
      );
    default:
      notFound();
  }
}

```
### `src/app/(authed)/settings/page.tsx`

```typescript
import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { buttonClasses } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function SettingsPage() {
  await requireUser();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your account</CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            href="/settings/profile"
            className={buttonClasses({ variant: 'secondary', className: 'inline-flex w-full sm:w-auto' })}
          >
            Profile
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

```
### `src/app/(authed)/settings/profile/page.tsx`

```typescript
import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { buttonClasses } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function SettingsProfilePage() {
  await requireUser();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile editing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-600">
          <p>
            Profile editing is coming in a future update. For now, your onboarding answers are
            your profile.
          </p>
          <Link
            href="/dashboard"
            className={buttonClasses({ variant: 'secondary', className: 'inline-flex' })}
          >
            Back to dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

```
### `src/proxy.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { HL_ONBOARDED_COOKIE } from '@/lib/auth/cookie-names';

/**
 * Route protection map.
 *
 * PROTECTED — unauthenticated visitors are redirected to /login, with the
 *             original path preserved in `?from=` so we can redirect back
 *             after a successful login.
 *
 * AUTH_ONLY — already-authenticated visitors are redirected away (onboarding
 *             vs dashboard based on `hl_onboarded`).
 *
 * Everything else is public — the proxy just calls NextResponse.next().
 *
 * IMPORTANT: This is a fast, first-line-of-defense check based on cookie
 * *presence* only. Full JWT verification (signature + expiry) happens inside
 * server components and route handlers via `requireUser()` / `getCurrentUser()`.
 * Never skip those checks based solely on this proxy passing.
 */
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/listings',
  '/inbox',
  '/messages',
  '/onboarding',
];

const AUTH_ONLY_PREFIXES = ['/login', '/signup', '/confirm', '/forgot-password'];

const ID_TOKEN_COOKIE = 'hl_id_token';
const REFRESH_TOKEN_COOKIE = 'hl_refresh_token';

function isOnboardingPath(pathname: string) {
  return pathname === '/onboarding' || pathname.startsWith('/onboarding/');
}

function isApiAuthPath(pathname: string) {
  return pathname.startsWith('/api/auth');
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const hasIdToken = request.cookies.has(ID_TOKEN_COOKIE);
  const hasRefreshToken = request.cookies.has(REFRESH_TOKEN_COOKIE);
  const hasSession = hasIdToken || hasRefreshToken;
  const hasOnboardedCookie = request.cookies.get(HL_ONBOARDED_COOKIE)?.value === '1';

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  const isAuthOnly = AUTH_ONLY_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtected && !hasIdToken && hasRefreshToken) {
    const refreshUrl = new URL('/api/auth/refresh', request.url);
    refreshUrl.searchParams.set('from', pathname + search);
    return NextResponse.redirect(refreshUrl);
  }

  if (isProtected && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    hasSession &&
    !hasOnboardedCookie &&
    isProtected &&
    !isOnboardingPath(pathname) &&
    !isApiAuthPath(pathname)
  ) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  if (hasSession && hasOnboardedCookie && isOnboardingPath(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isAuthOnly && hasIdToken) {
    if (hasOnboardedCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};

```
### `src/app/api/auth/login/route.ts`

```typescript
import { auth } from '@/lib/auth';
import { AuthError, AuthErrorCode } from '@/lib/auth/errors';
import { signInSchema } from '@/lib/auth/schemas';
import { setAuthCookies } from '@/lib/auth/session';
import { bootstrapUser } from '@/lib/auth/bootstrap-user';
import { syncOnboardedCookieByCognitoSub } from '@/lib/auth/onboarding-cookie';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: { code: 'INVALID_JSON', message: 'Invalid request body' } },
      { status: 400 },
    );
  }

  const parsed = signInSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: { code: 'VALIDATION_ERROR', fields: parsed.error.flatten().fieldErrors },
      },
      { status: 400 },
    );
  }

  try {
    const tokens = await auth.signIn(parsed.data);
    const authUser = await auth.verifyIdToken(tokens.idToken);

    // Idempotent — creates the Postgres User row on first login, updates on
    // subsequent logins. This is the only place User rows are created.
    await bootstrapUser(authUser);
    await setAuthCookies(tokens, authUser.cognitoSub);
    await syncOnboardedCookieByCognitoSub(authUser.cognitoSub);

    return Response.json({ ok: true, user: { email: authUser.email } });
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.code === AuthErrorCode.USER_NOT_CONFIRMED) {
        return Response.json(
          { ok: false, error: { code: err.code, message: err.message } },
          { status: 403 },
        );
      }
      return Response.json(
        { ok: false, error: { code: err.code, message: err.message } },
        { status: 401 },
      );
    }
    console.error('[auth/login] Unexpected error:', err);
    return Response.json(
      { ok: false, error: { code: 'UNKNOWN', message: 'An unexpected error occurred' } },
      { status: 500 },
    );
  }
}

```
### `src/app/api/auth/callback/route.ts`

```typescript
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/lib/auth';
import { setAuthCookies } from '@/lib/auth/session';
import { bootstrapUser } from '@/lib/auth/bootstrap-user';
import { syncOnboardedCookieByCognitoSub } from '@/lib/auth/onboarding-cookie';
import { prisma } from '@/lib/db/prisma';
import { env } from '@/lib/env';

const CALLBACK_URL = `${env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
const STATE_COOKIE = 'hl_oauth_state';

/**
 * Constant-time comparison for the OAuth `state` cookie vs query-string value.
 *
 * The state token is a 128-bit random hex string (32 chars). With current
 * hardware a vanilla string compare's timing channel is nowhere near
 * exploitable for tokens this size, but `timingSafeEqual` is free and removes
 * an entire class of theoretical attacks from our threat model.
 *
 * `timingSafeEqual` THROWS if the inputs differ in length, so we short-circuit
 * on length mismatch (and on empty inputs) before calling it.
 */
function statesMatch(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const error = searchParams.get('error');

  // Cognito hosted UI redirects here on OAuth errors too (e.g. user cancelled).
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error)}`);
  }

  if (!code || !stateParam) {
    return Response.json(
      { ok: false, error: { code: 'MISSING_PARAMS', message: 'Missing code or state' } },
      { status: 400 },
    );
  }

  // CSRF state validation — constant-time compare of query param against the
  // cookie we set in /api/auth/oauth-start before the redirect to Cognito.
  const jar = await cookies();
  const stateCookie = jar.get(STATE_COOKIE)?.value;

  if (!statesMatch(stateCookie, stateParam)) {
    return Response.json(
      { ok: false, error: { code: 'STATE_MISMATCH', message: 'OAuth state mismatch — possible CSRF attempt' } },
      { status: 400 },
    );
  }

  try {
    const tokens = await auth.exchangeAuthCodeForTokens(code, CALLBACK_URL);
    const authUser = await auth.verifyIdToken(tokens.idToken);
    await bootstrapUser(authUser);
    await setAuthCookies(tokens, authUser.cognitoSub);
    await syncOnboardedCookieByCognitoSub(authUser.cognitoSub);

    // Clear the one-time state cookie.
    jar.delete(STATE_COOKIE);
  } catch (err) {
    console.error('[auth/callback] Token exchange failed:', err);
    redirect('/login?error=oauth_failed');
  }

  const userSub = jar.get('hl_user_sub')?.value;
  if (!userSub) {
    redirect('/onboarding');
  }

  const row = await prisma.user.findUnique({
    where: { cognitoSub: userSub },
    select: { onboardingState: { select: { completedAt: true } } },
  });
  if (!row?.onboardingState?.completedAt) {
    redirect('/onboarding');
  }
  redirect('/dashboard');
}

```
### `src/app/api/auth/refresh/route.ts`

```typescript
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { setAuthCookies, clearAuthCookies } from '@/lib/auth/session';
import { syncOnboardedCookieByCognitoSub } from '@/lib/auth/onboarding-cookie';

const REFRESH_COOKIE = 'hl_refresh_token';
const USER_SUB_COOKIE = 'hl_user_sub';

/**
 * Open redirects are a meaningful XSS escalation vector — only allow paths
 * that point back into our own app. Reject anything containing a scheme,
 * authority, or backslash, and reject paths that don't start with a single
 * slash.
 */
function safeRedirectPath(raw: string | null): string {
  if (!raw) return '/dashboard';
  if (!raw.startsWith('/')) return '/dashboard';
  if (raw.startsWith('//')) return '/dashboard';
  if (raw.includes('\\')) return '/dashboard';
  return raw;
}

/**
 * Silent-refresh endpoint.
 *
 * Reached via a redirect from `proxy.ts` whenever a request hits a protected
 * route while the `hl_id_token` cookie is missing/expired but
 * `hl_refresh_token` is still present. Mints a fresh ID + access token from
 * Cognito, writes new cookies, then bounces the browser back to the original
 * path (preserved via `?from=`).
 *
 * If the refresh fails (token revoked / expired / bad signature), all auth
 * cookies are cleared and the browser is sent to `/login`.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const from = safeRedirectPath(url.searchParams.get('from'));

  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;
  const userSub = jar.get(USER_SUB_COOKIE)?.value;

  // Both cookies are required: the refresh token to mint new tokens, and the
  // sub to compute SECRET_HASH for Cognito's confidential-client flow.
  if (!refreshToken || !userSub) {
    await clearAuthCookies();
    redirect('/login');
  }

  let refreshFailed = false;
  try {
    const newTokens = await auth.refreshTokens(refreshToken, userSub);
    const authUser = await auth.verifyIdToken(newTokens.idToken);
    await setAuthCookies(newTokens, authUser.cognitoSub);
    await syncOnboardedCookieByCognitoSub(authUser.cognitoSub);
  } catch (err) {
    console.error('[auth/refresh] Refresh failed:', err);
    await clearAuthCookies();
    refreshFailed = true;
  }

  if (refreshFailed) redirect('/login');
  redirect(from);
}

```
### `src/lib/auth/session.ts`

```typescript
import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from './index';
import type { AuthTokens, AuthUser } from './types';
import { HL_ONBOARDED_COOKIE } from '@/lib/auth/cookie-names';

const COOKIE_ID_TOKEN = 'hl_id_token';
const COOKIE_ACCESS_TOKEN = 'hl_access_token';
const COOKIE_REFRESH_TOKEN = 'hl_refresh_token';
/**
 * Stores the Cognito `sub` of the signed-in user. Required at refresh time
 * because Cognito's `REFRESH_TOKEN_AUTH` flow needs `SECRET_HASH` keyed on
 * the username — and by the time we want to refresh, the ID token cookie
 * (which carries the sub claim) has already expired.
 *
 * The `sub` is an opaque UUID, not PII. Same lifetime as the refresh cookie.
 */
const COOKIE_USER_SUB = 'hl_user_sub';

/** 30 days — matches Cognito's default refresh token expiry. */
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

/** 60 minutes — matches Cognito's default access/ID token expiry. */
const ACCESS_TOKEN_MAX_AGE = 60 * 60;

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
} as const;

/**
 * Writes all auth cookies (3 tokens + `hl_user_sub`) as httpOnly cookies.
 * Must be called from a Route Handler or Server Function — not during render.
 *
 * Pass `userSub` when it is already known (after `verifyIdToken` upstream) so
 * we don't double-decode the JWT just to read the `sub` claim.
 */
export async function setAuthCookies(
  tokens: AuthTokens,
  userSub: string,
): Promise<void> {
  const jar = await cookies();

  jar.set(COOKIE_ID_TOKEN, tokens.idToken, {
    ...COOKIE_BASE,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  jar.set(COOKIE_ACCESS_TOKEN, tokens.accessToken, {
    ...COOKIE_BASE,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  jar.set(COOKIE_REFRESH_TOKEN, tokens.refreshToken, {
    ...COOKIE_BASE,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  jar.set(COOKIE_USER_SUB, userSub, {
    ...COOKIE_BASE,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

/**
 * Clears all auth cookies.
 * Must be called from a Route Handler or Server Function — not during render.
 */
export async function clearAuthCookies(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_ID_TOKEN);
  jar.delete(COOKIE_ACCESS_TOKEN);
  jar.delete(COOKIE_REFRESH_TOKEN);
  jar.delete(COOKIE_USER_SUB);
  jar.delete(HL_ONBOARDED_COOKIE);
}

/**
 * Returns the current authenticated user, or null if not authenticated.
 *
 * This function is **read-only**: it verifies the `hl_id_token` cookie and
 * nothing more. It is safe to call from Server Components, Route Handlers,
 * and Server Actions.
 *
 * It does NOT attempt silent refresh, because Server Components cannot
 * write cookies. Silent refresh happens at the proxy boundary instead:
 * when `hl_id_token` is missing but `hl_refresh_token` is present, the
 * proxy redirects to `/api/auth/refresh?from=<path>`, which mints new
 * tokens, sets fresh cookies, and bounces the browser back to the
 * original path. By the time a Server Component runs, `hl_id_token` is
 * either valid or definitively absent.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const idToken = jar.get(COOKIE_ID_TOKEN)?.value;
  if (!idToken) return null;

  try {
    return await auth.verifyIdToken(idToken);
  } catch {
    return null;
  }
}

/**
 * Returns the current authenticated user, redirecting to /login if not authed.
 *
 * IMPORTANT: `redirect()` throws a NEXT_REDIRECT error — call this function
 * OUTSIDE any try/catch block, or the redirect will be swallowed.
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

```
### `src/lib/auth/cookie-names.ts`

```typescript
/** HttpOnly cookie: user has completed onboarding (`OnboardingState.completedAt`). */
export const HL_ONBOARDED_COOKIE = 'hl_onboarded';

```
### `src/lib/auth/onboarding-cookie.ts`

```typescript
import 'server-only';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { HL_ONBOARDED_COOKIE } from '@/lib/auth/cookie-names';

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
};

export async function setOnboardedCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(HL_ONBOARDED_COOKIE, '1', COOKIE_BASE);
}

/**
 * If the DB shows onboarding complete, set `hl_onboarded` (self-heal stale sessions).
 */
export async function syncOnboardedCookieByCognitoSub(
  cognitoSub: string,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { cognitoSub },
    select: { onboardingState: { select: { completedAt: true } } },
  });
  if (user?.onboardingState?.completedAt) {
    await setOnboardedCookie();
  }
}

```
### `prisma/schema.prisma`

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// ===== ENUMS =====
enum Role {
  SEEKER
  LISTER
  MODERATOR
  ADMIN
  SUPPORT
}

enum Gender {
  MALE
  FEMALE
  NON_BINARY
  PREFER_NOT_TO_SAY
}

enum GenderPreference {
  MALE_ONLY
  FEMALE_ONLY
  ANY
  NON_BINARY_INCLUSIVE
}

enum FaithPractice {
  PRACTICING
  CULTURAL
  NOT_PRACTICING
  PREFER_NOT_TO_SAY
}

enum CleanlinessLevel {
  VERY_TIDY
  TIDY
  AVERAGE
  RELAXED
}

enum ScheduleType {
  EARLY_BIRD
  NIGHT_OWL
  FLEXIBLE
  SHIFT_WORKER
}

enum ListingType {
  PRIVATE_ROOM
  SHARED_ROOM
  WHOLE_UNIT
}

enum ListingStatus {
  DRAFT
  ACTIVE
  PAUSED
  FILLED
  REMOVED
}

enum InterestStatus {
  PENDING
  ACCEPTED
  DECLINED
  WITHDRAWN
}

enum PrivacyMode {
  PUBLIC
  MATCHES_ONLY
  HIDDEN
}

enum VerificationType {
  EMAIL
  PHONE
  ID_DOCUMENT
  SELFIE_MATCH
  REFERENCE
}

enum VerificationStatus {
  PENDING
  APPROVED
  REJECTED
  EXPIRED
}

enum ReportReason {
  SPAM
  HARASSMENT
  SCAM
  INAPPROPRIATE_CONTENT
  FAKE_LISTING
  DISCRIMINATION
  UNSAFE_BEHAVIOR
  OTHER
}

enum ReportStatus {
  OPEN
  UNDER_REVIEW
  RESOLVED
  DISMISSED
}

enum ConversationType {
  DIRECT
  LISTING_GROUP
}

enum MessageType {
  TEXT
  IMAGE
  SYSTEM
}

enum NotificationType {
  NEW_MESSAGE
  NEW_INTEREST
  INTEREST_ACCEPTED
  MATCH_SUGGESTION
  LISTING_SAVED
  VERIFICATION_UPDATE
  ADMIN_ACTION
  SYSTEM
}

enum SwipeDirection {
  CONNECT
  PASS
}

enum PhotoVisibility {
  ALWAYS
  UNTIL_MATCH
  PRIVATE
}

enum IntroMediaType {
  VOICE
  VIDEO
}

// ===== CORE USER =====
model User {
  id             String      @id @default(cuid())
  cognitoSub     String      @unique
  email          String      @unique
  emailVerified  Boolean     @default(false)
  phone          String?     @unique
  phoneVerified  Boolean     @default(false)
  roles          Role[]      @default([SEEKER])
  status         String      @default("active")
  suspendedUntil DateTime?
  privacyMode    PrivacyMode @default(PUBLIC)
  lookingStatus  Boolean     @default(true)
  lastActiveAt   DateTime    @default(now())
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  deletedAt      DateTime?

  profile             Profile?
  preferences         Preferences?
  listings            Listing[]
  interests           ListingInterest[]
  savedListings       SavedListing[]
  verifications       VerificationRecord[]
  reportsFiled        Report[]                  @relation("ReportsFiled")
  reportsAgainst      Report[]                  @relation("ReportsAgainst")
  blocksInitiated     Block[]                   @relation("BlockFrom")
  blocksReceived      Block[]                   @relation("BlockTo")
  conversations       ConversationParticipant[]
  messagesSent        Message[]
  notifications       Notification[]
  adminActionsAsAdmin AdminAction[]             @relation("AdminActor")
  adminActionsOnUser  AdminAction[]             @relation("AdminTarget")
  compatibilityAsA    CompatibilityScore[]      @relation("CompatA")
  compatibilityAsB    CompatibilityScore[]      @relation("CompatB")

  femaleOnlyMode             Boolean @default(false)
  requireVerifiedConnections Boolean @default(false)
  dailySwipeQuota            Int     @default(100)

  onboardingState      OnboardingState?
  swipesGiven          Swipe[]           @relation("SwipesGiven")
  swipesReceived       Swipe[]           @relation("SwipesReceived")
  matchesAsA           Match[]           @relation("MatchA")
  matchesAsB           Match[]           @relation("MatchB")
  householdMemberships HouseholdMember[]

  @@index([email])
  @@index([cognitoSub])
  @@index([status, lookingStatus])
  @@index([lastActiveAt])
}

model Profile {
  id              String          @id @default(cuid())
  userId          String          @unique
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  firstName       String
  /// Private by default. MUST be filtered out in public profile reads — only return when
  /// interest is ACCEPTED between viewer and owner, or viewer is the owner themselves.
  /// See src/server/services/profile.ts (TODO: create) for enforcement.
  lastName        String?
  displayName     String?
  dateOfBirth     DateTime
  gender          Gender
  occupation      String?
  employer        String?
  school          String?
  bio             String?         @db.VarChar(500)
  photoUrl        String?
  photoGallery    String[]        @default([])
  city            String
  country         String          @default("CA")
  languages       String[]        @default([])
  photoVisibility PhotoVisibility @default(UNTIL_MATCH)
  introMediaUrl   String?
  introMediaType  IntroMediaType?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([city])
}

model Preferences {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  budgetMin              Int
  budgetMax              Int
  moveInDate             DateTime
  moveInFlexibilityDays  Int      @default(14)
  leaseMinMonths         Int      @default(6)
  leaseMaxMonths         Int      @default(12)
  preferredCities        String[]
  preferredNeighborhoods String[] @default([])

  cleanliness      CleanlinessLevel
  schedule         ScheduleType
  smokingSelf      Boolean          @default(false)
  smokingRoommate  Boolean          @default(false)
  drinkingSelf     String           @default("never")
  drinkingRoommate String           @default("any")
  pets             Boolean          @default(false)
  petsRoommate     String           @default("any")
  guests           String           @default("sometimes")
  noiseTolerance   String           @default("moderate")
  cookingFrequency String           @default("sometimes")

  faithPractice     FaithPractice?
  faith             String?
  dietaryPractice   String?
  prayerSpaceNeeded Boolean        @default(false)

  genderPreference   GenderPreference @default(ANY)
  ageMin             Int              @default(18)
  ageMax             Int              @default(99)
  facultyFriendly    Boolean          @default(false)
  faithMatchRequired Boolean          @default(false)

  personality String?
  socialLevel Int     @default(3)

  dealbreakers Json @default("[]")
  extra        Json @default("{}")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

// ===== LISTINGS =====
model Listing {
  id                String        @id @default(cuid())
  ownerId           String
  owner             User          @relation(fields: [ownerId], references: [id])
  type              ListingType
  status            ListingStatus @default(DRAFT)
  title             String
  description       String        @db.Text
  addressLine       String
  city              String
  neighborhood      String?
  country           String        @default("CA")
  postalCode        String
  latitude          Float
  longitude         Float
  approxLatitude    Float
  approxLongitude   Float
  rentAmount        Int
  currency          String        @default("CAD")
  depositAmount     Int?
  utilitiesIncluded Boolean       @default(false)
  availableFrom     DateTime
  leaseMonths       Int
  bedroomsTotal     Int
  bathroomsTotal    Float
  furnished         Boolean       @default(false)

  smokingAllowed Boolean          @default(false)
  petsAllowed    Boolean          @default(false)
  genderPref     GenderPreference @default(ANY)
  ageMin         Int?
  ageMax         Int?

  amenities            String[] @default([])
  houseRules           Json     @default("{}")
  preferencesForTenant Json     @default("{}")

  viewsCount Int       @default(0)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  deletedAt  DateTime?

  images       ListingImage[]
  interests    ListingInterest[]
  savedBy      SavedListing[]
  conversation Conversation?
  households   Household[]

  @@index([city, status])
  @@index([city, availableFrom])
  @@index([ownerId])
  @@index([status, createdAt])
  @@index([latitude, longitude])
}

model ListingImage {
  id        String   @id @default(cuid())
  listingId String
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  url       String
  orderIdx  Int      @default(0)
  caption   String?
  createdAt DateTime @default(now())

  @@index([listingId])
}

model ListingInterest {
  id         String         @id @default(cuid())
  listingId  String
  listing    Listing        @relation(fields: [listingId], references: [id], onDelete: Cascade)
  userId     String
  user       User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  message    String?        @db.VarChar(1000)
  status     InterestStatus @default(PENDING)
  matchScore Int?
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt

  @@unique([listingId, userId])
  @@index([listingId, status])
  @@index([userId])
}

model SavedListing {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  listingId String
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  note      String?
  createdAt DateTime @default(now())

  @@unique([userId, listingId])
  @@index([userId])
}

// ===== COMPATIBILITY =====
model CompatibilityScore {
  id                String   @id @default(cuid())
  userAId           String
  userA             User     @relation("CompatA", fields: [userAId], references: [id], onDelete: Cascade)
  userBId           String
  userB             User     @relation("CompatB", fields: [userBId], references: [id], onDelete: Cascade)
  score             Int
  breakdown         Json
  passesHardFilters Boolean  @default(true)
  computedAt        DateTime @default(now())
  inputsHash        String

  @@unique([userAId, userBId])
  @@index([userAId, score])
  @@index([userBId, score])
}

// ===== MESSAGING =====
model Conversation {
  id            String           @id @default(cuid())
  type          ConversationType
  listingId     String?          @unique
  listing       Listing?         @relation(fields: [listingId], references: [id])
  lastMessageAt DateTime         @default(now())
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  participants ConversationParticipant[]
  messages     Message[]
  match        Match?

  @@index([lastMessageAt])
}

model ConversationParticipant {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  userId         String
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  joinedAt       DateTime     @default(now())
  lastReadAt     DateTime     @default(now())
  muted          Boolean      @default(false)
  archived       Boolean      @default(false)

  @@unique([conversationId, userId])
  @@index([userId, archived])
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId       String
  sender         User         @relation(fields: [senderId], references: [id])
  type           MessageType  @default(TEXT)
  body           String       @db.Text
  attachmentUrl  String?
  editedAt       DateTime?
  deletedAt      DateTime?
  createdAt      DateTime     @default(now())

  @@index([conversationId, createdAt])
}

// ===== TRUST & SAFETY =====
model Report {
  id                String       @id @default(cuid())
  reporterId        String
  reporter          User         @relation("ReportsFiled", fields: [reporterId], references: [id])
  reportedUserId    String?
  reportedUser      User?        @relation("ReportsAgainst", fields: [reportedUserId], references: [id])
  reportedListingId String?
  reportedMessageId String?
  reason            ReportReason
  description       String?      @db.Text
  status            ReportStatus @default(OPEN)
  resolution        String?
  resolvedById      String?
  resolvedAt        DateTime?
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  @@index([status, createdAt])
  @@index([reportedUserId])
}

model Block {
  id        String   @id @default(cuid())
  blockerId String
  blocker   User     @relation("BlockFrom", fields: [blockerId], references: [id], onDelete: Cascade)
  blockedId String
  blocked   User     @relation("BlockTo", fields: [blockedId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([blockerId, blockedId])
  @@index([blockedId])
}

model VerificationRecord {
  id          String             @id @default(cuid())
  userId      String
  user        User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  type        VerificationType
  status      VerificationStatus @default(PENDING)
  provider    String?
  providerRef String?
  metadata    Json               @default("{}")
  verifiedAt  DateTime?
  expiresAt   DateTime?
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  @@index([userId, type])
}

model AdminAction {
  id           String   @id @default(cuid())
  actorId      String
  actor        User     @relation("AdminActor", fields: [actorId], references: [id])
  targetUserId String?
  targetUser   User?    @relation("AdminTarget", fields: [targetUserId], references: [id])
  targetType   String
  targetId     String
  action       String
  reason       String
  metadata     Json     @default("{}")
  createdAt    DateTime @default(now())

  @@index([targetType, targetId])
  @@index([actorId, createdAt])
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      NotificationType
  title     String
  body      String
  data      Json             @default("{}")
  readAt    DateTime?
  createdAt DateTime         @default(now())

  @@index([userId, readAt])
  @@index([userId, createdAt])
}

// ===== ONBOARDING =====
model OnboardingState {
  id             String    @id @default(cuid())
  userId         String    @unique
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  intent         String?
  currentStep    Int       @default(1)
  completedSteps Int[]     @default([])
  completedAt    DateTime?
  version        Int       @default(1)
  draftData      Json      @default("{}")
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([userId])
}

// ===== DISCOVERY / MATCHING =====
model Swipe {
  id           String         @id @default(cuid())
  swiperUserId String
  swiper       User           @relation("SwipesGiven", fields: [swiperUserId], references: [id], onDelete: Cascade)
  targetUserId String
  target       User           @relation("SwipesReceived", fields: [targetUserId], references: [id], onDelete: Cascade)
  direction    SwipeDirection
  context      String?
  createdAt    DateTime       @default(now())

  @@unique([swiperUserId, targetUserId])
  @@index([targetUserId, direction])
  @@index([swiperUserId, createdAt])
}

model Match {
  id             String        @id @default(cuid())
  userAId        String
  userA          User          @relation("MatchA", fields: [userAId], references: [id], onDelete: Cascade)
  userBId        String
  userB          User          @relation("MatchB", fields: [userBId], references: [id], onDelete: Cascade)
  matchedAt      DateTime      @default(now())
  conversationId String?       @unique
  conversation   Conversation? @relation(fields: [conversationId], references: [id])
  active         Boolean       @default(true)

  @@unique([userAId, userBId])
  @@index([userAId, matchedAt])
  @@index([userBId, matchedAt])
}

// ===== HOUSEHOLDS (schema-only; group swipe ships Phase 4+) =====
model Household {
  id        String   @id @default(cuid())
  name      String?
  listingId String?
  listing   Listing? @relation(fields: [listingId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  members HouseholdMember[]

  @@index([listingId])
}

model HouseholdMember {
  id          String    @id @default(cuid())
  householdId String
  household   Household @relation(fields: [householdId], references: [id], onDelete: Cascade)
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  role        String
  joinedAt    DateTime  @default(now())

  @@unique([householdId, userId])
  @@index([userId])
}

```
### `package.json`

```json
{
  "name": "harmony-living",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test:e2e": "node scripts/ensure-phase3-e2e-users.mjs && node --env-file=.env ./node_modules/@playwright/test/cli.js test"
  },
  "dependencies": {
    "@aws-sdk/client-cognito-identity-provider": "^3.1035.0",
    "@hookform/resolvers": "^5.2.2",
    "@prisma/adapter-pg": "^7.8.0",
    "@prisma/client": "^7.8.0",
    "@radix-ui/react-slider": "^1.3.6",
    "aws-jwt-verify": "^5.1.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "jose": "^6.2.2",
    "lucide-react": "^1.8.0",
    "next": "16.2.4",
    "pg": "^8.20.0",
    "prisma": "^7.8.0",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "react-hook-form": "^7.73.1",
    "tailwind-merge": "^3.5.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@playwright/test": "^1.52.0",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/pg": "^8.20.0",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.4",
    "prettier": "^3.8.3",
    "prettier-plugin-tailwindcss": "^0.7.2",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}

```
### `playwright.config.js`

```text
// @ts-check
const path = require('node:path');
const { defineConfig, devices } = require('@playwright/test');

const repoRoot = path.resolve(__dirname);

module.exports = defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 180_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['json', { outputFile: 'e2e-output/results.json' }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    video: 'off',
  },
  webServer: {
    command: 'npm run build && PORT=3000 npm run start',
    cwd: repoRoot,
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: { ...process.env, PORT: '3000' },
  },
});

```
### `e2e/db.ts`

```typescript
import pg from 'pg';

export async function withDb<T>(fn: (c: pg.Client) => Promise<T>): Promise<T> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required for e2e DB checks');
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    return await fn(c);
  } finally {
    await c.end();
  }
}

export async function wipeOnboardingState(client: pg.Client, userId: string): Promise<void> {
  await client.query('BEGIN');
  await client.query('DELETE FROM "OnboardingState" WHERE "userId" = $1', [userId]);
  await client.query('DELETE FROM "Preferences" WHERE "userId" = $1', [userId]);
  await client.query('DELETE FROM "Profile" WHERE "userId" = $1', [userId]);
  await client.query(`UPDATE "User" SET roles = ARRAY['SEEKER']::"Role"[] WHERE id = $1`, [userId]);
  await client.query('COMMIT');
}

export async function getUserIdByEmail(
  client: pg.Client,
  email: string,
): Promise<{ id: string; email: string }> {
  const r = await client.query<{ id: string; email: string }>(
    'SELECT id, email FROM "User" WHERE email = $1 LIMIT 1',
    [email],
  );
  if (r.rows.length === 0) {
    throw new Error(`No User row for email: ${email}`);
  }
  return r.rows[0];
}

export async function countOnboardingForUser(
  client: pg.Client,
  userId: string,
): Promise<number> {
  const r = await client.query<{ c: string }>(
    'SELECT COUNT(*)::text AS c FROM "OnboardingState" WHERE "userId" = $1',
    [userId],
  );
  return Number.parseInt(r.rows[0]?.c ?? '0', 10);
}

```
### `e2e/onboarding-verification.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {
  withDb,
  wipeOnboardingState,
  getUserIdByEmail,
  countOnboardingForUser,
} from './db';

function maskEmail(email: string) {
  const [a, d] = email.split('@');
  if (!d) return '***';
  return `${a.slice(0, 2)}***@${d}`;
}

function maskId(id: string) {
  return `${id.slice(0, 6)}…`;
}

function makePostTracker(page: import('@playwright/test').Page) {
  const statuses: number[] = [];
  const handler = (res: import('@playwright/test').Response) => {
    const req = res.request();
    if (req.method() !== 'POST') return;
    try {
      const p = new URL(req.url()).pathname;
      if (p === '/onboarding' || /^\/onboarding\/\d+$/.test(p)) {
        statuses.push(res.status());
      }
    } catch {
      /* ignore */
    }
  };
  page.on('response', handler);
  return {
    drain: () => {
      const out = [...statuses];
      statuses.length = 0;
      return out;
    },
    stop: () => page.off('response', handler),
  };
}

async function login(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
) {
  await page.goto('/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 60_000 });
}

async function loginFresh(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
) {
  await page.context().clearCookies();
  await login(page, email, password);
}

test.describe.configure({ mode: 'serial' });

test.describe('Phase 3 — V6 draft promotion then V1 full onboarding', () => {
  const outDir = path.join(process.cwd(), 'e2e-output');
  const v1Email =
    process.env.E2E_PHASE3_V1_EMAIL || 'harmony.phase3.v1.e2e@harmony-living.test';
  const v6Email =
    process.env.E2E_PHASE3_V6_EMAIL || 'harmony.phase3.v6.e2e@harmony-living.test';
  const password = process.env.E2E_PHASE3_PASSWORD || 'HarmonyE2e1!';

  test('V6 — draft through step 3, promotion on step 4', async ({ page }) => {
    const record: Record<string, unknown> = { maskedEmail: maskEmail(v6Email), phases: [] };

    await loginFresh(page, v6Email, password);

    const userId = await withDb(async (c) => {
      const u = await getUserIdByEmail(c, v6Email);
      await wipeOnboardingState(c, u.id);
      return u.id;
    });

    await page.context().clearCookies();
    await login(page, v6Email, password);
    await page.waitForURL(/\/onboarding/);

    const tracker = makePostTracker(page);

    await page.locator('input[type="radio"][value="both"]').click({ force: true });
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForURL('**/onboarding/2');
    tracker.drain();

    await page.locator('#firstName').fill('V6');
    await page.locator('input[type="date"]').fill('1991-06-10');
    await page.locator('input[type="radio"][value="FEMALE"]').click({ force: true });
    await page.locator('#city').fill('Edmonton');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForURL('**/onboarding/3');
    tracker.drain();

    await page.getByPlaceholder('e.g. Calgary').fill('Edmonton');
    await page.keyboard.press('Enter');
    await page.locator('#onboarding-move-in-date').fill('2026-09-01');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForURL('**/onboarding/4');
    tracker.drain();

    await withDb(async (c) => {
      const pc = await c.query(
        `SELECT COUNT(*)::int AS c FROM "Preferences" WHERE "userId" = $1`,
        [userId],
      );
      const dr = await c.query(`SELECT "draftData"::text FROM "OnboardingState" WHERE "userId" = $1`, [
        userId,
      ]);
      record.phases!.push({
        afterStep3: {
          preferencesCount: pc.rows[0]?.c,
          draftDataSnippet: (dr.rows[0]?.draftData as string)?.slice(0, 400),
        },
      });
    });

    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForURL('**/onboarding/5');
    tracker.stop();

    await withDb(async (c) => {
      const pc = await c.query(
        `SELECT COUNT(*)::int AS c FROM "Preferences" WHERE "userId" = $1`,
        [userId],
      );
      const dr = await c.query(`SELECT "draftData"::text FROM "OnboardingState" WHERE "userId" = $1`, [
        userId,
      ]);
      (record.phases![0] as Record<string, unknown>).afterStep4 = {
        preferencesCount: pc.rows[0]?.c,
        draftData: dr.rows[0]?.draftData,
      };
    });

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'phase3-v6.json'), JSON.stringify(record, null, 2));

    const p0 = record.phases![0] as {
      afterStep3?: { preferencesCount?: number };
      afterStep4?: { preferencesCount?: number; draftData?: string };
    };
    expect(p0.afterStep3?.preferencesCount).toBe(0);
    expect(p0.afterStep4?.preferencesCount).toBe(1);
    expect(p0.afterStep4?.draftData).toMatch(/\{\}/);
  });

  test('V1 — steps 1–6 with DB + POST checks', async ({ page }) => {
    const record: Record<string, unknown> = {
      maskedEmail: maskEmail(v1Email),
      steps: [] as unknown[],
    };

    await loginFresh(page, v1Email, password);

    const userId = await withDb(async (c) => {
      const u = await getUserIdByEmail(c, v1Email);
      await wipeOnboardingState(c, u.id);
      const cnt = await countOnboardingForUser(c, u.id);
      record.before = { userIdMasked: maskId(u.id), onboardingStateRows: cnt };
      return u.id;
    });

    await page.context().clearCookies();
    await login(page, v1Email, password);
    await page.waitForURL(/\/onboarding/, { timeout: 30_000 });

    const tracker = makePostTracker(page);

    // Step 1 — Intent
    await page.locator('input[type="radio"][value="seeker"]').click({ force: true });
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForURL('**/onboarding/2');
    const post1 = tracker.drain();
    record.steps!.push({ step: 1, urlAfter: page.url(), postStatuses: post1 });

    await withDb(async (c) => {
      const os = await c.query(
        `SELECT intent, "completedSteps" FROM "OnboardingState" WHERE "userId" = $1`,
        [userId],
      );
      const ur = await c.query(`SELECT roles FROM "User" WHERE id = $1`, [userId]);
      record.steps![record.steps!.length - 1] = {
        ...(record.steps![record.steps!.length - 1] as object),
        db: { onboardingState: os.rows[0], userRoles: ur.rows[0]?.roles },
      };
    });

    // Step 2 — Basics
    await page.locator('#firstName').fill('E2E');
    await page.locator('input[type="date"]').fill('1990-05-15');
    await page.locator('input[type="radio"][value="PREFER_NOT_TO_SAY"]').click({ force: true });
    await page.locator('#city').fill('Calgary');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForURL('**/onboarding/3');
    const post2 = tracker.drain();
    record.steps!.push({ step: 2, urlAfter: page.url(), postStatuses: post2 });

    await withDb(async (c) => {
      const pr = await c.query(
        `SELECT "firstName", "dateOfBirth"::text, gender, city FROM "Profile" WHERE "userId" = $1`,
        [userId],
      );
      const os = await c.query(
        `SELECT "completedSteps" FROM "OnboardingState" WHERE "userId" = $1`,
        [userId],
      );
      (record.steps![1] as Record<string, unknown>).db = {
        profile: pr.rows[0],
        completedSteps: os.rows[0]?.completedSteps,
      };
    });

    // Step 3 — Housing
    await page.getByPlaceholder('e.g. Calgary').fill('Calgary');
    await page.keyboard.press('Enter');
    await page.locator('#onboarding-move-in-date').fill('2026-08-01');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForURL('**/onboarding/4');
    const post3 = tracker.drain();
    record.steps!.push({ step: 3, urlAfter: page.url(), postStatuses: post3 });

    await withDb(async (c) => {
      const pc = await c.query(
        `SELECT COUNT(*)::int AS c FROM "Preferences" WHERE "userId" = $1`,
        [userId],
      );
      const dr = await c.query(`SELECT "draftData"::text FROM "OnboardingState" WHERE "userId" = $1`, [
        userId,
      ]);
      (record.steps![2] as Record<string, unknown>).db = {
        preferencesCount: pc.rows[0]?.c,
        draftData: dr.rows[0]?.draftData,
      };
    });

    // Step 4 — Lifestyle (defaults)
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForURL('**/onboarding/5');
    const post4 = tracker.drain();
    record.steps!.push({ step: 4, urlAfter: page.url(), postStatuses: post4 });

    await withDb(async (c) => {
      const pc = await c.query(
        `SELECT COUNT(*)::int AS c FROM "Preferences" WHERE "userId" = $1`,
        [userId],
      );
      const dr = await c.query(`SELECT "draftData"::text FROM "OnboardingState" WHERE "userId" = $1`, [
        userId,
      ]);
      const lf = await c.query(
        `SELECT cleanliness, schedule, "drinkingSelf", "drinkingRoommate" FROM "Preferences" WHERE "userId" = $1`,
        [userId],
      );
      (record.steps![3] as Record<string, unknown>).db = {
        preferencesCount: pc.rows[0]?.c,
        draftData: dr.rows[0]?.draftData,
        preferencesLifestyle: lf.rows[0],
      };
    });

    // Step 5 — Values
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForURL('**/onboarding/6');
    const post5 = tracker.drain();
    record.steps!.push({ step: 5, urlAfter: page.url(), postStatuses: post5 });

    await withDb(async (c) => {
      const vf = await c.query(
        `SELECT "faithPractice", "genderPreference", "ageMin", "ageMax", dealbreakers FROM "Preferences" WHERE "userId" = $1`,
        [userId],
      );
      const dr = await c.query(`SELECT "draftData"::text FROM "OnboardingState" WHERE "userId" = $1`, [
        userId,
      ]);
      (record.steps![4] as Record<string, unknown>).db = {
        preferencesValues: vf.rows[0],
        draftData: dr.rows[0]?.draftData,
      };
    });

    // Step 6 — Profile finish
    await page.locator('input[type="radio"][value="PUBLIC"]').click({ force: true });
    await page.getByRole('button', { name: 'Complete onboarding' }).click();
    await page.waitForURL('**/dashboard?welcome=1', { timeout: 60_000 });
    const post6 = tracker.drain();
    tracker.stop();

    const cookies = await page.context().cookies();
    const onboarded = cookies.find((c) => c.name === 'hl_onboarded');
    record.steps!.push({
      step: 6,
      urlAfter: page.url(),
      postStatuses: post6,
      hl_onboarded: onboarded
        ? {
            value: onboarded.value,
            httpOnly: onboarded.httpOnly,
            sameSite: onboarded.sameSite,
            expires: onboarded.expires ? onboarded.expires / 1000 : null,
          }
        : null,
    });

    await withDb(async (c) => {
      const pr = await c.query(`SELECT bio, languages FROM "Profile" WHERE "userId" = $1`, [userId]);
      const pm = await c.query(`SELECT "privacyMode"::text FROM "User" WHERE id = $1`, [userId]);
      const ca = await c.query(`SELECT "completedAt"::text FROM "OnboardingState" WHERE "userId" = $1`, [
        userId,
      ]);
      (record.steps![5] as Record<string, unknown>).db = {
        profile: pr.rows[0],
        privacyMode: pm.rows[0]?.privacyMode,
        completedAt: ca.rows[0]?.completedAt,
      };
    });

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'phase3-v1.json'), JSON.stringify(record, null, 2));

    expect((record.steps![2] as { db?: { preferencesCount?: number } }).db?.preferencesCount).toBe(0);
    expect((record.steps![3] as { db?: { preferencesCount?: number } }).db?.preferencesCount).toBe(1);
    const d3 = JSON.parse(
      (record.steps![2] as { db?: { draftData?: string } }).db?.draftData ?? '{}',
    );
    expect(d3.budgetMin).toBeTruthy();
    expect(onboarded?.httpOnly).toBe(true);
    expect(onboarded?.sameSite).toBe('Lax');
  });
});

```
### `scripts/ensure-phase3-e2e-users.mjs`

```text
/**
 * Ensures two Cognito users exist for Phase 3 Playwright verification.
 * Uses AdminCreateUser + AdminSetUserPassword (no inbox required).
 *
 * Required env: COGNITO_USER_POOL_ID, COGNITO_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 * Optional: E2E_PHASE3_V1_EMAIL, E2E_PHASE3_V6_EMAIL, E2E_PHASE3_PASSWORD
 */
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import fs from 'node:fs';
import path from 'node:path';

function loadEnvFile() {
  const p = path.join(process.cwd(), '.env');
  if (!fs.existsSync(p)) return;
  const raw = fs.readFileSync(p, 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m) continue;
    const k = m[1];
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnvFile();

const poolId = process.env.COGNITO_USER_POOL_ID;
const region = process.env.COGNITO_REGION || 'us-west-2';
const v1Email =
  process.env.E2E_PHASE3_V1_EMAIL || 'harmony.phase3.v1.e2e@harmony-living.test';
const v6Email =
  process.env.E2E_PHASE3_V6_EMAIL || 'harmony.phase3.v6.e2e@harmony-living.test';
const password = process.env.E2E_PHASE3_PASSWORD || 'HarmonyE2e1!';

if (!poolId) {
  console.error('[ensure-phase3-e2e-users] COGNITO_USER_POOL_ID missing');
  process.exit(1);
}

const client = new CognitoIdentityProviderClient({ region });

async function ensureUser(email) {
  try {
    await client.send(
      new AdminGetUserCommand({
        UserPoolId: poolId,
        Username: email,
      }),
    );
    console.log(`[ensure-phase3-e2e-users] exists: ${email}`);
  } catch (e) {
    if (e.name !== 'UserNotFoundException') throw e;
    try {
      await client.send(
        new AdminCreateUserCommand({
          UserPoolId: poolId,
          Username: email,
          UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'email_verified', Value: 'true' },
          ],
          MessageAction: 'SUPPRESS',
        }),
      );
      console.log(`[ensure-phase3-e2e-users] created: ${email}`);
    } catch (ce) {
      if (ce && typeof ce === 'object' && 'name' in ce && ce.name === 'UsernameExistsException') {
        console.log(`[ensure-phase3-e2e-users] race exists: ${email}`);
      } else {
        throw ce;
      }
    }
  }

  await client.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: poolId,
      Username: email,
      Password: password,
      Permanent: true,
    }),
  );
  console.log(`[ensure-phase3-e2e-users] password set: ${email}`);
}

await ensureUser(v1Email);
await ensureUser(v6Email);
console.log('[ensure-phase3-e2e-users] done');

```
## 10. Honesty

- Phase report regenerated by `scripts/build-phase3-report.mjs` after a passing `npm run test:e2e` run.
- `package-lock.json` is not inlined (machine-generated); see git.

