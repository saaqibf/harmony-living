import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { OnboardingProgress } from '@/features/onboarding/components/onboarding-progress';

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireUser();
  const row = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { onboardingState: { select: { completedAt: true } } },
  });
  if (row?.onboardingState?.completedAt) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf4f9] via-[#fdfbfc] to-[#f7f3f1] px-4 py-10 animate-fade-in">
      <div className="mx-auto w-full max-w-lg">
        <p className="mb-6 text-center font-serif text-lg font-semibold text-[#1c1b1b]">
          Harmony<span className="text-[#7B2D5C]">.</span>Living
        </p>
        <OnboardingProgress />
        {children}
      </div>
    </div>
  );
}
