'use server';

import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { reportUser, blockUser } from '@/server/services/trust';
import { log } from '@/lib/log';
import type { ReportReason } from '@generated/prisma/client';
import { redirect } from 'next/navigation';

async function requireDbUserId(cognitoSub: string) {
  const row = await prisma.user.findUnique({ where: { cognitoSub }, select: { id: true } });
  if (!row) throw new Error('User not found');
  return row.id;
}

export async function reportUserAction(
  reportedUserId: string,
  reason: ReportReason,
  context?: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireUser();
  const userId = await requireDbUserId(auth.cognitoSub);

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
  const auth = await requireUser();
  const userId = await requireDbUserId(auth.cognitoSub);
  await blockUser(userId, blockedUserId);
  redirect('/matches');
}
