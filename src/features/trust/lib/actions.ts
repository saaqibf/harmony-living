'use server';

import { requireDbUser } from '@/lib/auth/session';
import { reportUser, blockUser } from '@/server/services/trust';
import { log } from '@/lib/log';
import type { ReportReason } from '@generated/prisma/client';
import { redirect } from 'next/navigation';

export async function reportUserAction(
  reportedUserId: string,
  reason: ReportReason,
  context?: string,
): Promise<{ ok: boolean; error?: string }> {
  const { userId } = await requireDbUser();

  if (userId === reportedUserId) return { ok: false, error: 'Cannot report yourself' };

  try {
    await reportUser(userId, reportedUserId, reason, context);
    return { ok: true };
  } catch (err) {
    log.error('reportUserAction failed', { userId, reportedUserId, err: String(err) });
    return { ok: false, error: 'Failed to submit report' };
  }
}

export async function blockUserAction(blockedUserId: string): Promise<void> {
  const { userId } = await requireDbUser();
  await blockUser(userId, blockedUserId);
  redirect('/matches');
}
