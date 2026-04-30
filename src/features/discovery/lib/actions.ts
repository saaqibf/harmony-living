'use server';

import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { recordSwipe, SwipeError } from '@/server/services/swipe';
import { log } from '@/lib/log';

async function requireDbUserId(cognitoSub: string) {
  const row = await prisma.user.findUnique({ where: { cognitoSub }, select: { id: true } });
  if (!row) throw new Error('User not found');
  return row.id;
}

export type SwipeActionResult =
  | { ok: true; matched: boolean; matchId?: string; conversationId?: string }
  | { ok: false; error: string; code?: string };

export async function swipeAction(
  targetId: string,
  direction: 'CONNECT' | 'PASS',
): Promise<SwipeActionResult> {
  const auth = await requireUser();
  const userId = await requireDbUserId(auth.cognitoSub);

  try {
    const result = await recordSwipe(userId, targetId, direction);
    return { ok: true, ...result };
  } catch (err) {
    if (err instanceof SwipeError) {
      return { ok: false, error: err.message, code: err.code };
    }
    log.error('swipeAction failed', { userId, targetId, direction, err: String(err) });
    return { ok: false, error: 'Something went wrong' };
  }
}
