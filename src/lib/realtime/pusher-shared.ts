export function conversationChannel(conversationId: string) {
  return `private-conversation-${conversationId}`;
}

export const PUSHER_EVENTS = {
  NEW_MESSAGE: 'new-message',
} as const;
