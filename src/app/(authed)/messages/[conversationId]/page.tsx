import { notFound } from 'next/navigation';
import Link from 'next/link';
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm shrink-0">
        <Link
          href="/messages"
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors"
          aria-label="Back to messages"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0 ring-2 ring-primary-100">
          {otherPhotoUrl ? (
            <img src={otherPhotoUrl} alt={otherFirstName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-base select-none">👤</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-[15px] truncate">{otherFirstName}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-500" />
            <span className="text-xs text-primary-600 font-medium">Active now</span>
          </div>
        </div>

        {otherUserId && (
          <ReportBlockMenu targetUserId={otherUserId} targetName={otherFirstName} />
        )}
      </div>

      {/* Chat */}
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
