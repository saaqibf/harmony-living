'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { getPusherClient } from '@/lib/realtime/pusher-client';
import { conversationChannel, PUSHER_EVENTS } from '@/lib/realtime/pusher-shared';
import { sendMessageAction, markReadAction } from '@/features/messaging/lib/actions';

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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    markReadAction(conversationId);
  }, [conversationId]);

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(conversationChannel(conversationId));

    channel.bind(PUSHER_EVENTS.NEW_MESSAGE, (data: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        // Already shown optimistically for the sender — skip
        if (data.senderId === currentUserId) return prev;
        return [...prev, data];
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(conversationChannel(conversationId));
    };
  }, [conversationId, currentUserId]);

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
    inputRef.current?.focus();

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
    <div className="flex flex-col h-full bg-gray-50">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700">Say hello to {otherFirstName}!</p>
            <p className="text-xs text-gray-400">Messages are end-to-end private</p>
          </div>
        )}

        {messages.map((m, i) => {
          // mine = sent by the logged-in user → appears on the RIGHT
          // theirs = sent by the other person → appears on the LEFT
          const mine = m.senderId === currentUserId;
          const prev = messages[i - 1];
          const isGrouped = prev && prev.senderId === m.senderId;

          return (
            <div
              key={m.id}
              className={`flex ${mine ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-0.5' : 'mt-3'}`}
            >
              <div className={`flex flex-col gap-0.5 max-w-[72%] ${mine ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-2.5 text-[14px] leading-relaxed ${
                    mine
                      ? 'bg-primary-600 text-white rounded-2xl rounded-br-[6px]'
                      : 'bg-white text-gray-900 rounded-2xl rounded-bl-[6px] shadow-sm border border-gray-100'
                  }`}
                >
                  {m.body}
                </div>
                {/* Timestamp only on last in group or last message */}
                {(!messages[i + 1] || messages[i + 1].senderId !== m.senderId) && (
                  <p className={`text-[10px] px-1 ${mine ? 'text-gray-400' : 'text-gray-400'}`}>
                    {fmt(m.createdAt)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="px-4 py-2 text-xs text-red-500 text-center bg-red-50">{error}</p>
      )}

      {/* Input bar */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={`Message ${otherFirstName}…`}
          className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-colors"
        />
        <button
          onClick={send}
          disabled={isPending || !body.trim()}
          aria-label="Send message"
          className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
        >
          {/* Paper plane / send icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
