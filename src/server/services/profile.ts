import { prisma } from '@/lib/db/prisma';

function ageBucket(dob: Date): string {
  const years = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  if (years < 25) return '18–24';
  if (years < 30) return '25–29';
  if (years < 35) return '30–34';
  if (years < 40) return '35–39';
  if (years < 50) return '40–49';
  return '50+';
}

async function isMatched(viewerId: string, ownerId: string): Promise<boolean> {
  const match = await prisma.match.findFirst({
    where: {
      active: true,
      OR: [
        { userAId: viewerId, userBId: ownerId },
        { userAId: ownerId, userBId: viewerId },
      ],
    },
    select: { id: true },
  });
  return match !== null;
}

export type PublicProfile = {
  id: string;
  firstName: string;
  lastName: string | null;
  displayName: string | null;
  ageBucket: string;
  gender: string;
  occupation: string | null;
  bio: string | null;
  city: string;
  photoUrl: string | null;
  photoUrlBlurred: string | null;
  photoVisibility: string;
  introMediaUrl: string | null;
  introMediaType: string | null;
};

/**
 * Returns a privacy-filtered public profile.
 *
 * Rules:
 *   - HIDDEN privacyMode → returns null (caller should 404)
 *   - MATCHES_ONLY → only visible to matched users or self
 *   - lastName → only returned to self or matched users
 *   - dateOfBirth → never returned; replaced with ageBucket
 */
export async function getPublicProfile(
  viewerId: string,
  ownerId: string,
): Promise<PublicProfile | null> {
  const isSelf = viewerId === ownerId;

  const user = await prisma.user.findUnique({
    where: { id: ownerId, deletedAt: null },
    select: {
      id: true,
      privacyMode: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          displayName: true,
          dateOfBirth: true,
          gender: true,
          occupation: true,
          bio: true,
          city: true,
          photoUrl: true,
          photoUrlBlurred: true,
          photoVisibility: true,
          introMediaUrl: true,
          introMediaType: true,
        },
      },
    },
  });

  if (!user?.profile) return null;

  if (user.privacyMode === 'HIDDEN' && !isSelf) return null;

  if (user.privacyMode === 'MATCHES_ONLY' && !isSelf) {
    const matched = await isMatched(viewerId, ownerId);
    if (!matched) return null;
  }

  const showLastName = isSelf || (await isMatched(viewerId, ownerId));

  const p = user.profile;

  return {
    id: ownerId,
    firstName: p.firstName,
    lastName: showLastName ? (p.lastName ?? null) : null,
    displayName: p.displayName ?? null,
    ageBucket: ageBucket(p.dateOfBirth),
    gender: p.gender,
    occupation: p.occupation ?? null,
    bio: p.bio ?? null,
    city: p.city,
    photoUrl: p.photoUrl ?? null,
    photoUrlBlurred: p.photoUrlBlurred ?? null,
    photoVisibility: p.photoVisibility,
    introMediaUrl: p.introMediaUrl ?? null,
    introMediaType: p.introMediaType ?? null,
  };
}
