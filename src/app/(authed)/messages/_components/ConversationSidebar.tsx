'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type Conversation = {
  conversationId: string;
  otherUser: { firstName: string; photoUrl: string | null };
  lastMessage: { body: string; senderId: string; createdAt: Date | string } | null;
  hasUnread: boolean;
};

function relativeTime(d: Date | string) {
  const ms = Date.now() - new Date(d).getTime();
  if (ms < 60_000) return 'now';
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h`;
  return new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric' }).format(new Date(d));
}

export function ConversationSidebar({
  conversations,
  currentUserId,
}: {
  conversations: Conversation[];
  currentUserId: string;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState('');

  const filtered = conversations.filter((c) =>
    c.otherUser.firstName.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="w-[280px] shrink-0 border-r border-[#e8e0e5] bg-[#fdfafc] flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <h2 className="text-xl font-serif font-semibold text-[#7B2D5C] mb-4">Messages</h2>
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9d9097]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search messages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#f0e7ef] border-0 rounded-full text-[#1c1b1b] placeholder:text-[#9d9097] focus:outline-none focus:ring-2 focus:ring-[#7B2D5C]/20 transition-all"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-[#7d766f]">No conversations yet.</p>
          </div>
        ) : (
          filtered.map((c) => {
            const active = pathname.startsWith(`/messages/${c.conversationId}`);
            return (
              <Link
                key={c.conversationId}
                href={`/messages/${c.conversationId}`}
                className={`flex items-center gap-3 px-4 py-3.5 transition-colors relative ${
                  active
                    ? 'bg-[#f0e7ef] border-l-[3px] border-[#7B2D5C]'
                    : 'border-l-[3px] border-transparent hover:bg-[#f5edf2]'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#f5edf2] flex items-center justify-center">
                    {c.otherUser.photoUrl ? (
                      <img src={c.otherUser.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl text-[#7B2D5C]">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </span>
                    )}
                  </div>
                  {c.hasUnread && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#7B2D5C] border-2 border-[#fdfafc]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm truncate ${c.hasUnread ? 'font-semibold text-[#1c1b1b]' : 'font-medium text-[#1c1b1b]'}`}>
                      {c.otherUser.firstName}
                    </p>
                    {c.lastMessage && (
                      <span className={`text-xs shrink-0 ml-1 ${c.hasUnread ? 'text-[#7B2D5C] font-medium' : 'text-[#9d9097]'}`}>
                        {relativeTime(c.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {c.lastMessage && (
                    <p className={`text-xs truncate ${c.hasUnread ? 'text-[#4c4640] font-medium' : 'text-[#9d9097]'}`}>
                      {c.lastMessage.senderId === currentUserId ? 'You: ' : ''}
                      {c.lastMessage.body}
                    </p>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
