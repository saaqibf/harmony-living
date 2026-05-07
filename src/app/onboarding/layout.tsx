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
    <div className="min-h-screen bg-[#fdf8f7] px-4 py-10">
      <div className="mx-auto w-full max-w-lg">
        <p className="mb-6 text-center font-serif text-lg font-semibold text-[#1c1b1b]">
          Harmony<span className="text-[#c96d4d]">.</span>Living
        </p>
        <OnboardingProgress />
        {children}
      </div>
    </div>
  );
}
