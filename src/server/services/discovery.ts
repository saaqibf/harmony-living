import 'server-only';

import type { PhotoVisibility } from '@generated/prisma/client';
import { prisma } from '@/lib/db/prisma';
import { scoreUsers, type ScoringUser } from './compatibility';

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

function calcAge(dob: Date): number {
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  return m < 0 || (m === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;
}

async function loadUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      preferences: true,
      verifications: { where: { status: 'APPROVED' }, select: { id: true } },
    },
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
    include: {
      profile: true,
      preferences: true,
      verifications: { where: { status: 'APPROVED' }, select: { id: true } },
    },
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
      userA: { include: { profile: true } },
      userB: { include: { profile: true } },
    },
    orderBy: { matchedAt: 'desc' },
  });

  return matches.map((m) => {
    const other = m.userAId === userId ? m.userB : m.userA;
    return {
      matchId: m.id,
      conversationId: m.conversationId,
      matchedAt: m.matchedAt,
      otherUserId: other.id,
      firstName: other.profile?.firstName ?? 'Unknown',
      photoUrl: other.profile?.photoUrl ?? null,
      city: other.profile?.city ?? null,
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
