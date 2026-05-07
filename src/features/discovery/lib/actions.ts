'use server';

import { requireDbUser } from '@/lib/auth/session';
import { recordSwipe, SwipeError } from '@/server/services/swipe';
import { log } from '@/lib/log';

export type SwipeActionResult =
  | { ok: true; matched: boolean; matchId?: string; conversationId?: string }
  | { ok: false; error: string; code?: string };

export async function swipeAction(
  targetId: string,
  direction: 'CONNECT' | 'PASS',
): Promise<SwipeActionResult> {
  const { userId } = await requireDbUser();

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
