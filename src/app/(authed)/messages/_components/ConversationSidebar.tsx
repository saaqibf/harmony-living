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
    <div className="w-72 shrink-0 border-r border-[#cfc5bd] bg-white flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <h2 className="text-base font-semibold text-[#1c1b1b] mb-4">Messages</h2>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d766f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search matches..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#fdf8f7] border border-[#cfc5bd] rounded-lg text-[#1c1b1b] placeholder:text-[#7d766f] focus:outline-none focus:border-[#2d4a3e] transition-colors"
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
            const active = pathname === `/messages/${c.conversationId}`;
            return (
              <Link
                key={c.conversationId}
                href={`/messages/${c.conversationId}`}
                className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${
                  active ? 'bg-[#f1edec]' : 'hover:bg-[#fdf8f7]'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-[#f1edec] flex items-center justify-center">
                    {c.otherUser.photoUrl ? (
                      <img src={c.otherUser.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">👤</span>
                    )}
                  </div>
                  {c.hasUnread && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#c96d4d] border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm truncate ${c.hasUnread ? 'font-semibold text-[#1c1b1b]' : 'font-medium text-[#1c1b1b]'}`}>
                      {c.otherUser.firstName}
                    </p>
                    {c.lastMessage && (
                      <span className="text-xs text-[#7d766f] shrink-0 ml-1">
                        {relativeTime(c.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {c.lastMessage && (
                    <p className={`text-xs truncate ${c.hasUnread ? 'text-[#4c4640]' : 'text-[#7d766f]'}`}>
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
