import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getConversations } from '@/server/services/messaging';
import Link from 'next/link';

function relativeTime(d: Date) {
  const ms = Date.now() - new Date(d).getTime();
  if (ms < 60_000) return 'now'; // also catches clock-skew negatives
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h`;
  if (ms < 604_800_000) return `${Math.floor(ms / 86_400_000)}d`;
  return new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric' }).format(d);
}

export default async function MessagesPage() {
  const auth = await requireUser();

  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { id: true },
  });
  if (!user) return null;

  const conversations = await getConversations(user.id);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-100 px-6 pt-10 pb-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <button
            aria-label="Search conversations"
            className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stories row — active conversations */}
      {conversations.length > 0 && (
        <div className="bg-white px-4 pt-4 pb-2">
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {conversations.slice(0, 10).map((c) => (
              <Link
                key={`story-${c.conversationId}`}
                href={`/messages/${c.conversationId}`}
                className="flex flex-col items-center gap-1.5 shrink-0 group"
              >
                {/* Ring: teal if unread, gray if read */}
                <div
                  className={`w-[62px] h-[62px] rounded-full p-[2.5px] ${
                    c.hasUnread
                      ? 'bg-gradient-to-br from-teal-400 to-teal-700'
                      : 'bg-gray-200'
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-white p-[2px]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                      {c.otherUser.photoUrl ? (
                        <img
                          src={c.otherUser.photoUrl}
                          alt={c.otherUser.firstName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg select-none">
                          👤
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-gray-500 font-medium w-16 text-center truncate leading-none">
                  {c.otherUser.firstName}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      {conversations.length > 0 && <div className="h-px bg-stone-100" />}

      {/* Conversation list */}
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mb-5">
            <svg className="w-9 h-9 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-lg font-bold text-gray-900 mb-1">No messages yet</p>
          <p className="text-sm text-gray-400 mb-6">Match with someone to start a conversation.</p>
          <Link
            href="/discover"
            className="px-6 py-3 bg-teal-600 text-white rounded-2xl text-sm font-semibold hover:bg-teal-700 active:scale-95 transition-all"
          >
            Find roommates →
          </Link>
        </div>
      ) : (
        <div>
          {conversations.map((c) => (
            <Link
              key={c.conversationId}
              href={`/messages/${c.conversationId}`}
              className="flex items-center gap-4 px-5 py-4 bg-white hover:bg-stone-50 active:bg-stone-100 transition-colors border-b border-stone-50"
            >
              {/* Avatar with unread dot */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100">
                  {c.otherUser.photoUrl ? (
                    <img
                      src={c.otherUser.photoUrl}
                      alt={c.otherUser.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl select-none">
                      👤
                    </div>
                  )}
                </div>
                {c.hasUnread && (
                  <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-teal-500 border-2 border-white" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <p className={`text-gray-900 truncate text-[15px] ${c.hasUnread ? 'font-bold' : 'font-semibold'}`}>
                    {c.otherUser.firstName}
                  </p>
                  {c.lastMessage && (
                    <span className={`text-xs shrink-0 ${c.hasUnread ? 'text-teal-600 font-semibold' : 'text-gray-400'}`}>
                      {relativeTime(c.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                {c.lastMessage ? (
                  <p className={`text-sm truncate ${c.hasUnread ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                    {c.lastMessage.senderId === user.id ? 'You: ' : ''}
                    {c.lastMessage.body}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">Say hello!</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
