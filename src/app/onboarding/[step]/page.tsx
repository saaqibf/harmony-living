import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { onboardingService } from '@/server/services/onboarding';
import { IntentStep } from '@/features/onboarding/components/intent-step';
import { BasicsStep } from '@/features/onboarding/components/basics-step';
import { VibeStep } from '@/features/onboarding/components/vibe-step';
import { WrapupStep } from '@/features/onboarding/components/wrapup-step';
import type { BasicsForm } from '@/lib/onboarding/step-schemas';

export default async function OnboardingStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step: stepStr } = await params;
  const stepNum = Number.parseInt(stepStr, 10);
  if (Number.isNaN(stepNum) || stepNum < 1 || stepNum > 4) {
    notFound();
  }

  const auth = await requireUser();
  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { id: true },
  });
  if (!user) redirect('/login');

  const data = await onboardingService.getOnboardingFormData(user.id);
  if (data.completedAt) redirect('/dashboard');

  const resume = await onboardingService.getResumeStep(user.id);
  if (stepNum > resume) redirect(`/onboarding/${resume}`);

  const p = data.profile;

  switch (stepNum) {
    case 1:
      return <IntentStep initialIntent={data.intent} />;
    case 2:
      return (
        <BasicsStep
          initial={{
            firstName: p?.firstName ?? undefined,
            dateOfBirth: p?.dateOfBirth ? p.dateOfBirth.toISOString().slice(0, 10) : undefined,
            gender: p?.gender as BasicsForm['gender'] | undefined,
            city: p?.city ?? undefined,
          }}
        />
      );
    case 3:
      return <VibeStep />;
    case 4:
      return <WrapupStep initialCity={p?.city ?? undefined} />;
    default:
      notFound();
  }
}
