import { requireDbUser } from '@/lib/auth/session';
import { getConversations } from '@/server/services/messaging';
import { ConversationSidebar } from './_components/ConversationSidebar';

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await requireDbUser();
  const conversations = await getConversations(userId);

  return (
    <div className="flex h-screen overflow-hidden">
      <ConversationSidebar conversations={conversations} currentUserId={userId} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
