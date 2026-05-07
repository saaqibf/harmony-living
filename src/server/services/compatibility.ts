import 'server-only';

import type {
  Gender,
  GenderPreference,
  CleanlinessLevel,
  ScheduleType,
  Preferences,
} from '@generated/prisma/client';
import { prisma } from '@/lib/db/prisma';
import crypto from 'node:crypto';
import { calcAge } from '@/lib/dates';

export type ScoringProfile = {
  gender: Gender;
  dateOfBirth: Date;
};

export type ScoringUser = {
  id: string;
  femaleOnlyMode: boolean;
  requireVerifiedConnections: boolean;
  isVerified: boolean;
  profile: ScoringProfile;
  preferences: Preferences;
};

const CLEANLINESS_RANK: Record<CleanlinessLevel, number> = {
  VERY_TIDY: 4,
  TIDY: 3,
  AVERAGE: 2,
  RELAXED: 1,
};

const SCHEDULE_COMPAT: Record<ScheduleType, Record<ScheduleType, number>> = {
  EARLY_BIRD:   { EARLY_BIRD: 1.0, FLEXIBLE: 0.7, SHIFT_WORKER: 0.5, NIGHT_OWL: 0.1 },
  NIGHT_OWL:    { NIGHT_OWL: 1.0, FLEXIBLE: 0.7, SHIFT_WORKER: 0.5, EARLY_BIRD: 0.1 },
  FLEXIBLE:     { FLEXIBLE: 1.0, EARLY_BIRD: 0.7, NIGHT_OWL: 0.7, SHIFT_WORKER: 0.7 },
  SHIFT_WORKER: { SHIFT_WORKER: 1.0, FLEXIBLE: 0.7, EARLY_BIRD: 0.5, NIGHT_OWL: 0.5 },
};


function genderPassesPref(gender: Gender, pref: GenderPreference): boolean {
  if (pref === 'ANY' || pref === 'NON_BINARY_INCLUSIVE') return true;
  if (pref === 'FEMALE_ONLY') return gender === 'FEMALE';
  if (pref === 'MALE_ONLY') return gender === 'MALE';
  return true;
}

export type ScoreResult = {
  score: number;
  breakdown: Record<string, number>;
  passesHardFilters: boolean;
  hardFilterReason?: string;
};

export function scoreUsers(a: ScoringUser, b: ScoringUser): ScoreResult {
  const ap = a.preferences;
  const bp = b.preferences;
  const breakdown: Record<string, number> = {};

  // ── Hard filters ─────────────────────────────────────────────────────────
  const aAge = calcAge(a.profile.dateOfBirth);
  const bAge = calcAge(b.profile.dateOfBirth);

  if (a.femaleOnlyMode && b.profile.gender !== 'FEMALE') {
    return { score: 0, breakdown, passesHardFilters: false, hardFilterReason: 'femaleOnlyMode' };
  }
  if (b.femaleOnlyMode && a.profile.gender !== 'FEMALE') {
    return { score: 0, breakdown, passesHardFilters: false, hardFilterReason: 'femaleOnlyMode' };
  }
  if (!genderPassesPref(b.profile.gender, ap.genderPreference)) {
    return { score: 0, breakdown, passesHardFilters: false, hardFilterReason: 'genderPreference' };
  }
  if (!genderPassesPref(a.profile.gender, bp.genderPreference)) {
    return { score: 0, breakdown, passesHardFilters: false, hardFilterReason: 'genderPreference' };
  }
  if (a.requireVerifiedConnections && !b.isVerified) {
    return { score: 0, breakdown, passesHardFilters: false, hardFilterReason: 'requireVerified' };
  }
  if (b.requireVerifiedConnections && !a.isVerified) {
    return { score: 0, breakdown, passesHardFilters: false, hardFilterReason: 'requireVerified' };
  }
  // Faith hard filter — only applies when both have stated a faith
  if (ap.faithMatchRequired && ap.faith && bp.faith && ap.faith.toLowerCase() !== bp.faith.toLowerCase()) {
    return { score: 0, breakdown, passesHardFilters: false, hardFilterReason: 'faithMatchRequired' };
  }
  if (bp.faithMatchRequired && ap.faith && bp.faith && ap.faith.toLowerCase() !== bp.faith.toLowerCase()) {
    return { score: 0, breakdown, passesHardFilters: false, hardFilterReason: 'faithMatchRequired' };
  }

  // ── Lifestyle (30 pts) ────────────────────────────────────────────────────
  // Cleanliness (8 pts): distance on 1-4 scale, max distance = 3
  const cleanDist = Math.abs(CLEANLINESS_RANK[ap.cleanliness] - CLEANLINESS_RANK[bp.cleanliness]);
  breakdown.cleanliness = Math.round(8 * (1 - cleanDist / 3));

  // Schedule (7 pts)
  breakdown.schedule = Math.round(7 * SCHEDULE_COMPAT[ap.schedule][bp.schedule]);

  // Smoking (5 pts): cross-check each direction
  const smokingOk = (!ap.smokingSelf || bp.smokingRoommate) && (!bp.smokingSelf || ap.smokingRoommate);
  breakdown.smoking = smokingOk ? 5 : 0;

  // Pets (5 pts)
  const petsOk =
    (!ap.pets || bp.petsRoommate !== 'no_pets') &&
    (!bp.pets || ap.petsRoommate !== 'no_pets');
  breakdown.pets = petsOk ? 5 : 0;

  // Noise tolerance (5 pts): simple string match
  breakdown.noise = ap.noiseTolerance === bp.noiseTolerance ? 5 : ap.noiseTolerance === 'moderate' || bp.noiseTolerance === 'moderate' ? 2 : 0;

  // ── Faith alignment (20 pts) ──────────────────────────────────────────────
  let faithScore = 0;
  if (ap.faith && bp.faith && ap.faith.toLowerCase() === bp.faith.toLowerCase()) {
    faithScore += 14;
  }
  if (ap.faithPractice && bp.faithPractice && ap.faithPractice === bp.faithPractice) {
    faithScore += 6;
  }
  breakdown.faith = Math.min(faithScore, 20);

  // ── Budget overlap (15 pts) ───────────────────────────────────────────────
  const overlapMin = Math.max(ap.budgetMin, bp.budgetMin);
  const overlapMax = Math.min(ap.budgetMax, bp.budgetMax);
  if (overlapMax >= overlapMin) {
    const overlapSize = overlapMax - overlapMin;
    const unionSize = Math.max(ap.budgetMax, bp.budgetMax) - Math.min(ap.budgetMin, bp.budgetMin);
    breakdown.budget = Math.round(15 * (overlapSize / unionSize));
  } else {
    breakdown.budget = 0;
  }

  // ── Age range overlap (10 pts) ────────────────────────────────────────────
  const aInB = bAge >= ap.ageMin && bAge <= ap.ageMax;
  const bInA = aAge >= bp.ageMin && aAge <= bp.ageMax;
  breakdown.ageRange = aInB && bInA ? 10 : aInB || bInA ? 4 : 0;

  // ── Move-in date proximity (10 pts) ──────────────────────────────────────
  const aWindow = ap.moveInFlexibilityDays * 24 * 60 * 60 * 1000;
  const bWindow = bp.moveInFlexibilityDays * 24 * 60 * 60 * 1000;
  const aEarliest = ap.moveInDate.getTime() - aWindow;
  const aLatest = ap.moveInDate.getTime() + aWindow;
  const bEarliest = bp.moveInDate.getTime() - bWindow;
  const bLatest = bp.moveInDate.getTime() + bWindow;
  breakdown.moveIn = aLatest >= bEarliest && bLatest >= aEarliest ? 10 : 0;

  // ── City match (5 pts) ────────────────────────────────────────────────────
  const citiesOverlap = ap.preferredCities.some((c) =>
    bp.preferredCities.some((d) => c.toLowerCase() === d.toLowerCase()),
  );
  breakdown.city = citiesOverlap ? 5 : 0;

  const score = Object.values(breakdown).reduce((sum, v) => sum + v, 0);

  return { score, breakdown, passesHardFilters: true };
}

/** Bump when scoring weights or logic change to invalidate all cached scores. */
export const SCORING_VERSION = 1;

function prefsHash(a: Preferences, b: Preferences): string {
  const key = JSON.stringify([`v${SCORING_VERSION}`, a.updatedAt, b.updatedAt, a.id, b.id].sort());
  return crypto.createHash('sha1').update(key).digest('hex').slice(0, 16);
}

export async function upsertCompatibilityScore(a: ScoringUser, b: ScoringUser): Promise<ScoreResult> {
  const result = scoreUsers(a, b);
  const hash = prefsHash(a.preferences, b.preferences);
  const [idA, idB] = [a.id, b.id].sort();

  await prisma.compatibilityScore.upsert({
    where: { userAId_userBId: { userAId: idA, userBId: idB } },
    create: {
      userAId: idA,
      userBId: idB,
      score: result.score,
      breakdown: result.breakdown,
      passesHardFilters: result.passesHardFilters,
      inputsHash: hash,
    },
    update: {
      score: result.score,
      breakdown: result.breakdown,
      passesHardFilters: result.passesHardFilters,
      inputsHash: hash,
      computedAt: new Date(),
    },
  });

  return result;
}
