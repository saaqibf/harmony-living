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
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-lg">
        <p className="mb-6 text-center text-lg font-semibold tracking-tight text-slate-900">
          harmony<span className="text-primary-600">.</span>living
        </p>
        <OnboardingProgress />
        {children}
      </div>
    </div>
  );
}
