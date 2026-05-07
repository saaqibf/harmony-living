import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { Sidebar } from '@/components/nav/Sidebar';

export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireUser();
  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { profile: { select: { firstName: true, photoUrl: true } } },
  });

  return (
    <div className="flex min-h-screen bg-[#F9F7F2]">
      <Sidebar
        firstName={user?.profile?.firstName}
        photoUrl={user?.profile?.photoUrl}
      />
      <main className="flex-1 ml-[220px] min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
