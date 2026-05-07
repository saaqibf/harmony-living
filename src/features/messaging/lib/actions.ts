'use server';

import { requireDbUser } from '@/lib/auth/session';
import { sendMessage, markRead, MessagingError } from '@/server/services/messaging';
import { log } from '@/lib/log';

export type SendMessageResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string };

export async function sendMessageAction(
  conversationId: string,
  body: string,
): Promise<SendMessageResult> {
  const { userId } = await requireDbUser();

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
  const { userId } = await requireDbUser();
  await markRead(userId, conversationId);
}
