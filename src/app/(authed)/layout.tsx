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
    <div className="flex min-h-screen bg-[#F2E6E0]">
      <Sidebar
        firstName={user?.profile?.firstName}
        photoUrl={user?.profile?.photoUrl}
      />
      <main className="flex-1 ml-[240px]">
        {children}
      </main>
    </div>
  );
}
