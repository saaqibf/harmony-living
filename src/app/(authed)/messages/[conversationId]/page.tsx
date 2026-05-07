import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
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
  const auth = await requireUser();

  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { id: true },
  });
  if (!user) return null;

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: user.id } },
  });
  if (!participant) notFound();

  const otherParticipant = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId: { not: user.id } },
    include: { user: { include: { profile: true } } },
  });

  const otherFirstName = otherParticipant?.user.profile?.firstName ?? 'User';
  const otherUserId = otherParticipant?.userId ?? '';
  const otherPhotoUrl = otherParticipant?.user.profile?.photoUrl ?? null;

  const messages = await getMessages(user.id, conversationId, 50);
  const serialized = messages.map((m) => ({
    id: m.id,
    senderId: m.senderId,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-[#cfc5bd] shrink-0">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-[#f1edec] shrink-0">
          {otherPhotoUrl ? (
            <img src={otherPhotoUrl} alt={otherFirstName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-base">👤</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1c1b1b] text-sm">{otherFirstName}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2d4a3e]" />
            <span className="text-xs text-[#2d4a3e] font-medium">Online</span>
          </div>
        </div>
        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg hover:bg-[#f1edec] transition-colors text-[#7d766f]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </button>
          <button className="p-2 rounded-lg hover:bg-[#f1edec] transition-colors text-[#7d766f]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
          currentUserId={user.id}
          initialMessages={serialized}
          otherFirstName={otherFirstName}
        />
      </div>
    </div>
  );
}
