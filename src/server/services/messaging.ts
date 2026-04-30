import 'server-only';

import { prisma } from '@/lib/db/prisma';
import { pusherServer, conversationChannel, PUSHER_EVENTS } from '@/lib/realtime/pusher-server';
import { log } from '@/lib/log';

export class MessagingError extends Error {
  constructor(
    public readonly code: 'NOT_PARTICIPANT' | 'CONVERSATION_NOT_FOUND' | 'EMPTY_MESSAGE',
    message: string,
  ) {
    super(message);
    this.name = 'MessagingError';
  }
}

export async function sendMessage(
  senderId: string,
  conversationId: string,
  body: string,
) {
  const trimmed = body.trim();
  if (!trimmed) throw new MessagingError('EMPTY_MESSAGE', 'Message cannot be empty');

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: senderId } },
  });
  if (!participant) throw new MessagingError('NOT_PARTICIPANT', 'Not a participant');

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId, senderId, body: trimmed, type: 'TEXT' },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  const payload = {
    id: message.id,
    senderId: message.senderId,
    body: message.body,
    type: message.type,
    createdAt: message.createdAt.toISOString(),
  };

  try {
    await pusherServer.trigger(conversationChannel(conversationId), PUSHER_EVENTS.NEW_MESSAGE, payload);
  } catch (err) {
    log.error('pusher trigger failed', { conversationId, err: String(err) });
  }

  return message;
}

export async function markRead(userId: string, conversationId: string) {
  await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId },
    data: { lastReadAt: new Date() },
  });
}

export async function getConversations(userId: string) {
  const participants = await prisma.conversationParticipant.findMany({
    where: { userId, archived: false },
    include: {
      conversation: {
        include: {
          participants: {
            where: { userId: { not: userId } },
            include: { user: { include: { profile: true } } },
          },
          messages: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
    orderBy: { conversation: { lastMessageAt: 'desc' } },
  });

  return participants.map((p) => {
    const other = p.conversation.participants[0];
    const lastMessage = p.conversation.messages[0];
    return {
      conversationId: p.conversationId,
      otherUser: {
        id: other?.userId ?? '',
        firstName: other?.user.profile?.firstName ?? 'Unknown',
        photoUrl: other?.user.profile?.photoUrl ?? null,
      },
      lastMessage: lastMessage
        ? { body: lastMessage.body, createdAt: lastMessage.createdAt, senderId: lastMessage.senderId }
        : null,
      lastReadAt: p.lastReadAt,
      hasUnread: lastMessage ? lastMessage.createdAt > p.lastReadAt && lastMessage.senderId !== userId : false,
    };
  });
}

export async function getMessages(userId: string, conversationId: string, limit = 50) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!participant) throw new MessagingError('NOT_PARTICIPANT', 'Not a participant');

  return prisma.message.findMany({
    where: { conversationId, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    take: limit,
    include: { sender: { include: { profile: { select: { firstName: true, photoUrl: true } } } } },
  });
}
