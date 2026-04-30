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
    <div className="flex flex-col h-screen bg-[--color-bg]">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-[--color-border] bg-[--color-surface]">
        <Link href="/messages" className="text-[--color-muted-fg] hover:text-[--color-fg] text-sm">
          ←
        </Link>
        <div className="w-9 h-9 rounded-full overflow-hidden bg-[--color-muted]">
          {otherPhotoUrl ? (
            <img src={otherPhotoUrl} alt={otherFirstName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm">👤</div>
          )}
        </div>
        <p className="font-semibold text-[--color-fg] flex-1">{otherFirstName}</p>
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
