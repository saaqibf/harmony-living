'use server';

import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { sendMessage, markRead, MessagingError } from '@/server/services/messaging';
import { log } from '@/lib/log';

async function requireDbUserId(cognitoSub: string) {
  const row = await prisma.user.findUnique({ where: { cognitoSub }, select: { id: true } });
  if (!row) throw new Error('User not found');
  return row.id;
}

export type SendMessageResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string };

export async function sendMessageAction(
  conversationId: string,
  body: string,
): Promise<SendMessageResult> {
  const auth = await requireUser();
  const userId = await requireDbUserId(auth.cognitoSub);

  try {
    const message = await sendMessage(userId, conversationId, body);
    return { ok: true, messageId: message.id };
  } catch (err) {
    if (err instanceof MessagingError) {
      return { ok: false, error: err.message };
    }
    log.error('sendMessageAction failed', { userId, conversationId, err: String(err) });
    return { ok: false, error: 'Failed to send message' };
  }
}

export async function markReadAction(conversationId: string): Promise<void> {
  const auth = await requireUser();
  const userId = await requireDbUserId(auth.cognitoSub);
  await markRead(userId, conversationId);
}
