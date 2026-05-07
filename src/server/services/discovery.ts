import 'server-only';

import type { PhotoVisibility } from '@generated/prisma/client';
import { prisma } from '@/lib/db/prisma';
import { scoreUsers, type ScoringUser } from './compatibility';
import { calcAge } from '@/lib/dates';

export type DiscoveryProfile = {
  userId: string;
  firstName: string;
  ageYears: number;
  city: string;
  gender: string;
  faith: string | null;
  faithPractice: string | null;
  occupation: string | null;
  bio: string | null;
  photoUrl: string | null;
  photoUrlBlurred: string | null;
  photoVisibility: PhotoVisibility;
  introMediaUrl: string | null;
  introMediaType: string | null;
  score: number;
  breakdown: Record<string, number>;
};

const WITH_SCORING_FIELDS = {
  profile: true,
  preferences: true,
  verifications: { where: { status: 'APPROVED' as const }, select: { id: true } },
} as const;

async function loadUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: WITH_SCORING_FIELDS,
  });
}

export async function getDiscoveryQueue(
  viewerId: string,
  limit = 20,
): Promise<DiscoveryProfile[]> {
  const viewer = await loadUser(viewerId);
  if (!viewer?.profile || !viewer?.preferences) return [];

  const viewerScoring: ScoringUser = {
    id: viewer.id,
    femaleOnlyMode: viewer.femaleOnlyMode,
    requireVerifiedConnections: viewer.requireVerifiedConnections,
    isVerified: viewer.verifications.length > 0,
    profile: { gender: viewer.profile.gender, dateOfBirth: viewer.profile.dateOfBirth },
    preferences: viewer.preferences,
  };

  const [swiped, blocks] = await Promise.all([
    prisma.swipe.findMany({ where: { swiperUserId: viewerId }, select: { targetUserId: true } }),
    prisma.block.findMany({
      where: { OR: [{ blockerId: viewerId }, { blockedId: viewerId }] },
      select: { blockerId: true, blockedId: true },
    }),
  ]);

  const excludeIds = new Set<string>([
    viewerId,
    ...swiped.map((s) => s.targetUserId),
    ...blocks.flatMap((b) => [b.blockerId, b.blockedId]),
  ]);

  const candidates = await prisma.user.findMany({
    where: {
      id: { notIn: [...excludeIds] },
      deletedAt: null,
      lookingStatus: true,
      preferences: { isNot: null },
      profile: { isNot: null },
    },
    include: WITH_SCORING_FIELDS,
    take: 300,
  });

  const scored: (DiscoveryProfile & { passesHardFilters: boolean })[] = [];

  for (const c of candidates) {
    if (!c.profile || !c.preferences) continue;

    const candidateScoring: ScoringUser = {
      id: c.id,
      femaleOnlyMode: c.femaleOnlyMode,
      requireVerifiedConnections: c.requireVerifiedConnections,
      isVerified: c.verifications.length > 0,
      profile: { gender: c.profile.gender, dateOfBirth: c.profile.dateOfBirth },
      preferences: c.preferences,
    };

    const result = scoreUsers(viewerScoring, candidateScoring);

    scored.push({
      userId: c.id,
      firstName: c.profile.firstName,
      ageYears: calcAge(c.profile.dateOfBirth),
      city: c.profile.city,
      gender: c.profile.gender,
      faith: c.preferences.faith,
      faithPractice: c.preferences.faithPractice,
      occupation: c.profile.occupation,
      bio: c.profile.bio,
      photoUrl: c.profile.photoUrl,
      photoUrlBlurred: c.profile.photoUrlBlurred,
      photoVisibility: c.profile.photoVisibility,
      introMediaUrl: c.profile.introMediaUrl,
      introMediaType: c.profile.introMediaType,
      score: result.score,
      breakdown: result.breakdown,
      passesHardFilters: result.passesHardFilters,
    });
  }

  return scored
    .filter((p) => p.passesHardFilters)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ passesHardFilters: _hf, ...p }) => p);
}

export async function getMyMatches(userId: string) {
  const matches = await prisma.match.findMany({
    where: {
      active: true,
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    include: {
      userA: { include: { profile: true, preferences: true } },
      userB: { include: { profile: true, preferences: true } },
    },
    orderBy: { matchedAt: 'desc' },
  });

  return matches.map((m) => {
    const other = m.userAId === userId ? m.userB : m.userA;
    const dob = other.profile?.dateOfBirth;
    return {
      matchId: m.id,
      conversationId: m.conversationId,
      matchedAt: m.matchedAt,
      otherUserId: other.id,
      firstName: other.profile?.firstName ?? 'Unknown',
      photoUrl: other.profile?.photoUrl ?? null,
      city: other.profile?.city ?? null,
      ageYears: dob ? calcAge(dob) : null,
      occupation: other.profile?.occupation ?? null,
      bio: other.profile?.bio ?? null,
      faith: other.preferences?.faith ?? null,
      faithPractice: other.preferences?.faithPractice ?? null,
    };
  });
}

export async function getDailySwipesRemaining(userId: string, quota: number): Promise<number> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const used = await prisma.swipe.count({
    where: { swiperUserId: userId, createdAt: { gte: today } },
  });
  return Math.max(0, quota - used);
}

export type BrowseProfile = {
  userId: string;
  firstName: string;
  ageYears: number;
  city: string;
  gender: string;
  occupation: string | null;
  bio: string | null;
  photoUrl: string | null;
  photoUrlBlurred: string | null;
  photoVisibility: PhotoVisibility;
  faith: string | null;
  isVerified: boolean;
  personality: string | null;
};

export async function getBrowseProfiles(viewerId: string, limit = 100): Promise<BrowseProfile[]> {
  const blocks = await prisma.block.findMany({
    where: { OR: [{ blockerId: viewerId }, { blockedId: viewerId }] },
    select: { blockerId: true, blockedId: true },
  });

  const excludeIds = new Set<string>([
    viewerId,
    ...blocks.flatMap((b) => [b.blockerId, b.blockedId]),
  ]);

  const users = await prisma.user.findMany({
    where: {
      id: { notIn: [...excludeIds] },
      lookingStatus: true,
      deletedAt: null,
      profile: { isNot: null },
    },
    include: WITH_SCORING_FIELDS,
    take: limit,
  });

  return users
    .filter((u) => u.profile !== null)
    .map((u) => ({
      userId: u.id,
      firstName: u.profile!.firstName,
      ageYears: calcAge(u.profile!.dateOfBirth),
      city: u.profile!.city,
      gender: u.profile!.gender,
      occupation: u.profile!.occupation,
      bio: u.profile!.bio,
      photoUrl: u.profile!.photoUrl,
      photoUrlBlurred: u.profile!.photoUrlBlurred,
      photoVisibility: u.profile!.photoVisibility,
      faith: u.preferences?.faith ?? null,
      isVerified: u.verifications.length > 0,
      personality: u.preferences?.personality ?? null,
    }));
}

export type BrowseProfileDetail = {
  userId: string;
  firstName: string;
  ageYears: number;
  city: string;
  gender: string;
  occupation: string | null;
  bio: string | null;
  photoUrl: string | null;
  photoUrlBlurred: string | null;
  photoVisibility: PhotoVisibility;
  faith: string | null;
  isVerified: boolean;
  personality: string | null;
  preferences: {
    budgetMin: number;
    budgetMax: number;
    moveInDate: Date;
    moveInFlexibilityDays: number;
    preferredCities: string[];
    preferredNeighborhoods: string[];
    cleanliness: string;
    schedule: string;
    pets: boolean;
    smokingSelf: boolean;
  } | null;
  activeListing: {
    id: string;
    title: string;
    rentAmount: number;
    currency: string;
    city: string;
    neighborhood: string | null;
    bedroomsTotal: number;
    bathroomsTotal: number;
    furnished: boolean;
    availableFrom: Date;
    coverImageUrl: string | null;
  } | null;
};

export async function getBrowseProfileById(
  viewerId: string,
  targetUserId: string,
): Promise<BrowseProfileDetail | null> {
  if (viewerId === targetUserId) return null;

  const blocks = await prisma.block.findMany({
    where: {
      OR: [
        { blockerId: viewerId, blockedId: targetUserId },
        { blockerId: targetUserId, blockedId: viewerId },
      ],
    },
    select: { id: true },
  });

  if (blocks.length > 0) return null;

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: WITH_SCORING_FIELDS,
  });

  if (!user || !user.profile) return null;

  const listing = await prisma.listing.findFirst({
    where: { ownerId: targetUserId, status: 'ACTIVE', deletedAt: null },
    include: { images: { orderBy: { orderIdx: 'asc' }, take: 1 } },
  });

  return {
    userId: user.id,
    firstName: user.profile.firstName,
    ageYears: calcAge(user.profile.dateOfBirth),
    city: user.profile.city,
    gender: user.profile.gender,
    occupation: user.profile.occupation,
    bio: user.profile.bio,
    photoUrl: user.profile.photoUrl,
    photoUrlBlurred: user.profile.photoUrlBlurred,
    photoVisibility: user.profile.photoVisibility,
    faith: user.preferences?.faith ?? null,
    isVerified: user.verifications.length > 0,
    personality: user.preferences?.personality ?? null,
    preferences: user.preferences
      ? {
          budgetMin: user.preferences.budgetMin,
          budgetMax: user.preferences.budgetMax,
          moveInDate: user.preferences.moveInDate,
          moveInFlexibilityDays: user.preferences.moveInFlexibilityDays,
          preferredCities: user.preferences.preferredCities,
          preferredNeighborhoods: user.preferences.preferredNeighborhoods,
          cleanliness: user.preferences.cleanliness,
          schedule: user.preferences.schedule,
          pets: user.preferences.pets,
          smokingSelf: user.preferences.smokingSelf,
        }
      : null,
    activeListing: listing
      ? {
          id: listing.id,
          title: listing.title,
          rentAmount: listing.rentAmount,
          currency: listing.currency,
          city: listing.city,
          neighborhood: listing.neighborhood ?? null,
          bedroomsTotal: listing.bedroomsTotal,
          bathroomsTotal: listing.bathroomsTotal,
          furnished: listing.furnished,
          availableFrom: listing.availableFrom,
          coverImageUrl: listing.images[0]?.url ?? null,
        }
      : null,
  };
}
