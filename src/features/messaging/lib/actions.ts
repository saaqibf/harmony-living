'use server';

import { redirect } from 'next/navigation';
import { requireDbUser } from '@/lib/auth/session';
import { sendMessage, markRead, MessagingError } from '@/server/services/messaging';
import { prisma } from '@/lib/db/prisma';
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

export async function startListingConversationAction(listingId: string): Promise<void> {
  const { userId } = await requireDbUser();

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, ownerId: true },
  });
  if (!listing) throw new Error('Listing not found');
  if (listing.ownerId === userId) redirect(`/listings/${listingId}`);

  // Re-use an existing conversation for this listing if one already exists
  // between this seeker and the listing owner.
  const existing = await prisma.conversation.findFirst({
    where: {
      listingId,
      participants: { some: { userId } },
    },
    select: { id: true },
  });

  if (existing) {
    redirect(`/messages/${existing.id}`);
  }

  const conversation = await prisma.conversation.create({
    data: {
      type: 'DIRECT',
      listingId,
      participants: {
        create: [{ userId }, { userId: listing.ownerId }],
      },
    },
    select: { id: true },
  });

  log.info('listing_conversation_created', { conversationId: conversation.id, listingId, seekerId: userId });
  redirect(`/messages/${conversation.id}`);
}
