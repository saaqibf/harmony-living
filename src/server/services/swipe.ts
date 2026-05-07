import 'server-only';

import type { SwipeDirection } from '@generated/prisma/client';
import { prisma } from '@/lib/db/prisma';
import { log } from '@/lib/log';
import { AppError } from '@/lib/errors';

export class SwipeError extends AppError {
  constructor(
    public readonly code: 'QUOTA_EXCEEDED' | 'SELF_SWIPE' | 'USER_NOT_FOUND',
    message: string,
  ) {
    super(code, message);
    this.name = 'SwipeError';
  }
}

export type SwipeResult = {
  matched: boolean;
  matchId?: string;
  conversationId?: string;
};

export async function recordSwipe(
  swiperId: string,
  targetId: string,
  direction: SwipeDirection,
): Promise<SwipeResult> {
  if (swiperId === targetId) {
    throw new SwipeError('SELF_SWIPE', 'Cannot swipe yourself');
  }

  const swiper = await prisma.user.findUnique({
    where: { id: swiperId },
    select: { dailySwipeQuota: true },
  });
  if (!swiper) throw new SwipeError('USER_NOT_FOUND', 'Swiper not found');

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const usedToday = await prisma.swipe.count({
    where: { swiperUserId: swiperId, createdAt: { gte: today } },
  });

  if (usedToday >= swiper.dailySwipeQuota) {
    throw new SwipeError('QUOTA_EXCEEDED', 'Daily swipe limit reached');
  }

  // Upsert — idempotent, allows pass→connect correction
  await prisma.swipe.upsert({
    where: { swiperUserId_targetUserId: { swiperUserId: swiperId, targetUserId: targetId } },
    create: { swiperUserId: swiperId, targetUserId: targetId, direction },
    update: { direction },
  });

  if (direction !== 'CONNECT') {
    return { matched: false };
  }

  // Check for mutual connect
  const reverseSwipe = await prisma.swipe.findUnique({
    where: { swiperUserId_targetUserId: { swiperUserId: targetId, targetUserId: swiperId } },
    select: { direction: true },
  });

  if (reverseSwipe?.direction !== 'CONNECT') {
    return { matched: false };
  }

  // Check if match already exists
  const [idA, idB] = [swiperId, targetId].sort();
  const existing = await prisma.match.findUnique({
    where: { userAId_userBId: { userAId: idA, userBId: idB } },
    select: { id: true, conversationId: true },
  });

  if (existing) {
    return { matched: true, matchId: existing.id, conversationId: existing.conversationId ?? undefined };
  }

  // Create match + conversation atomically
  try {
    const { match, conversation } = await prisma.$transaction(async (tx) => {
      const conv = await tx.conversation.create({
        data: {
          type: 'DIRECT',
          participants: {
            create: [{ userId: swiperId }, { userId: targetId }],
          },
        },
      });

      const m = await tx.match.create({
        data: { userAId: idA, userBId: idB, conversationId: conv.id },
      });

      await tx.notification.createMany({
        data: [
          {
            userId: swiperId,
            type: 'MATCH_SUGGESTION',
            title: "It's a match!",
            body: 'You connected with someone. Say hello.',
            data: { matchId: m.id, conversationId: conv.id },
          },
          {
            userId: targetId,
            type: 'MATCH_SUGGESTION',
            title: "It's a match!",
            body: 'You connected with someone. Say hello.',
            data: { matchId: m.id, conversationId: conv.id },
          },
        ],
      });

      return { match: m, conversation: conv };
    });

    log.info('match created', { matchId: match.id, userAId: idA, userBId: idB });
    return { matched: true, matchId: match.id, conversationId: conversation.id };
  } catch (err) {
    log.error('match creation failed', { swiperId, targetId, err: String(err) });
    throw err;
  }
}
