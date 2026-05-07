import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getConversations } from '@/server/services/messaging';
import { ConversationSidebar } from './_components/ConversationSidebar';

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireUser();
  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { id: true },
  });
  if (!user) return null;

  const conversations = await getConversations(user.id);

  return (
    <div className="flex h-screen overflow-hidden">
      <ConversationSidebar conversations={conversations} currentUserId={user.id} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
