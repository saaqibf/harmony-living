'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { getPusherClient } from '@/lib/realtime/pusher-client';
import { conversationChannel, PUSHER_EVENTS } from '@/lib/realtime/pusher-shared';
import { sendMessageAction, markReadAction } from '@/features/messaging/lib/actions';
import { Button } from '@/components/ui/button';

type Message = {
  id: string;
  senderId: string;
  body: string;
  createdAt: Date | string;
};

type Props = {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
  otherFirstName: string;
};

export function ChatView({ conversationId, currentUserId, initialMessages, otherFirstName }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markReadAction(conversationId);
  }, [conversationId]);

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(conversationChannel(conversationId));

    channel.bind(PUSHER_EVENTS.NEW_MESSAGE, (data: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(conversationChannel(conversationId));
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const trimmed = body.trim();
    if (!trimmed || isPending) return;
    setError(null);
    const optimisticId = `opt-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: optimisticId, senderId: currentUserId, body: trimmed, createdAt: new Date() },
    ]);
    setBody('');

    startTransition(async () => {
      const result = await sendMessageAction(conversationId, trimmed);
      if (!result.ok) {
        setError(result.error);
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      }
    });
  };

  const fmt = (d: Date | string) =>
    new Intl.DateTimeFormat('en-CA', { hour: 'numeric', minute: '2-digit' }).format(new Date(d));

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-[--color-muted-fg] py-8">
            Say hello to {otherFirstName}!
          </p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  mine
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-[--color-muted] text-[--color-fg] rounded-bl-sm'
                }`}
              >
                <p>{m.body}</p>
                <p className={`text-xs mt-1 ${mine ? 'text-primary-200' : 'text-[--color-muted-fg]'}`}>
                  {fmt(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p className="px-4 text-sm text-red-500">{error}</p>}

      <div className="border-t border-[--color-border] p-4 flex gap-3">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
          placeholder={`Message ${otherFirstName}…`}
          className="flex-1 rounded-xl border border-[--color-border] bg-[--color-surface] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <Button onClick={send} disabled={isPending || !body.trim()} size="sm">
          Send
        </Button>
      </div>
    </div>
  );
}
