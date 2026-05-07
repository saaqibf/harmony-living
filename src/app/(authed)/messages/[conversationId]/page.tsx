import { notFound } from 'next/navigation';
import { requireDbUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getMessages } from '@/server/services/messaging';
import { ChatView } from '@/features/messaging/components/ChatView';
import { ReportBlockMenu } from '@/features/trust/components/ReportBlockMenu';

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const { userId } = await requireDbUser();

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!participant) notFound();

  const otherParticipant = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId: { not: userId } },
    include: { user: { include: { profile: true } } },
  });

  const otherFirstName = otherParticipant?.user.profile?.firstName ?? 'User';
  const otherUserId = otherParticipant?.userId ?? '';
  const otherPhotoUrl = otherParticipant?.user.profile?.photoUrl ?? null;

  const messages = await getMessages(userId, conversationId, 50);
  const serialized = messages.map((m) => ({
    id: m.id,
    senderId: m.senderId,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-4 px-6 py-3.5 bg-white border-b border-[#e8e0e5] shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#f5edf2] shrink-0 ring-2 ring-[#e8d0e2]">
          {otherPhotoUrl ? (
            <img src={otherPhotoUrl} alt={otherFirstName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#7B2D5C]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1c1b1b]">{otherFirstName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-[#7d766f]">Online</span>
            </div>
            <span className="text-[#cfc5bd]">·</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f0e7ef]">
              <svg className="w-3 h-3 text-[#7B2D5C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span className="text-[10px] font-semibold text-[#7B2D5C] tracking-wide">Verified Match</span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button className="p-2.5 rounded-full hover:bg-[#f5edf2] transition-colors text-[#7d766f] hover:text-[#7B2D5C]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </button>
          {otherUserId && (
            <ReportBlockMenu targetUserId={otherUserId} targetName={otherFirstName} />
          )}
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-hidden">
        <ChatView
          conversationId={conversationId}
          currentUserId={userId}
          initialMessages={serialized}
          otherFirstName={otherFirstName}
        />
      </div>
    </div>
  );
}
