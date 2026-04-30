import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getConversations } from '@/server/services/messaging';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default async function MessagesPage() {
  const auth = await requireUser();

  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { id: true },
  });
  if (!user) return null;

  const conversations = await getConversations(user.id);

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric' }).format(d);

  return (
    <div className="min-h-screen bg-[--color-bg]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[--color-fg] mb-6">Messages</h1>

        {conversations.length === 0 ? (
          <div className="text-center py-24 space-y-3">
            <p className="text-lg font-semibold text-[--color-fg]">No messages yet</p>
            <p className="text-sm text-[--color-muted-fg]">Match with someone to start a conversation.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((c) => (
              <Link
                key={c.conversationId}
                href={`/messages/${c.conversationId}`}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl hover:bg-[--color-muted] transition-colors',
                  c.hasUnread && 'bg-primary-50',
                )}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[--color-muted] shrink-0 relative">
                  {c.otherUser.photoUrl ? (
                    <img src={c.otherUser.photoUrl} alt={c.otherUser.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">👤</div>
                  )}
                  {c.hasUnread && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-primary-600 rounded-full border-2 border-[--color-bg]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={cn('font-semibold text-[--color-fg] truncate', c.hasUnread && 'font-bold')}>
                      {c.otherUser.firstName}
                    </p>
                    {c.lastMessage && (
                      <span className="text-xs text-[--color-muted-fg] shrink-0">
                        {fmt(c.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {c.lastMessage && (
                    <p className={cn('text-sm truncate', c.hasUnread ? 'text-[--color-fg] font-medium' : 'text-[--color-muted-fg]')}>
                      {c.lastMessage.senderId === user.id ? 'You: ' : ''}{c.lastMessage.body}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
