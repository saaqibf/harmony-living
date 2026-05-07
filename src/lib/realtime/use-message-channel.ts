'use client';

import { useEffect } from 'react';
import { getPusherClient } from './pusher-client';
import { conversationChannel, PUSHER_EVENTS } from './pusher-shared';

export type IncomingMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: Date | string;
};

export function useMessageChannel(
  conversationId: string,
  currentUserId: string,
  onMessage: (msg: IncomingMessage) => void,
) {
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(conversationChannel(conversationId));

    channel.bind(PUSHER_EVENTS.NEW_MESSAGE, (data: IncomingMessage) => {
      if (data.senderId !== currentUserId) {
        onMessage(data);
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(conversationChannel(conversationId));
    };
  }, [conversationId, currentUserId, onMessage]);
}
