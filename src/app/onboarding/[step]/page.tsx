import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { onboardingService } from '@/server/services/onboarding';
import { IntentStep } from '@/features/onboarding/components/intent-step';
import { BasicsStep } from '@/features/onboarding/components/basics-step';
import { HousingPrefsStep } from '@/features/onboarding/components/housing-prefs-step';
import { LifestyleStep } from '@/features/onboarding/components/lifestyle-step';
import { ValuesStep } from '@/features/onboarding/components/values-step';
import { ProfileFinishStep } from '@/features/onboarding/components/profile-finish-step';
import type { BasicsForm } from '@/lib/onboarding/step-schemas';
import type { LifestyleForm, ValuesForm } from '@/lib/onboarding/step-schemas';

export default async function OnboardingStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step: stepStr } = await params;
  const stepNum = Number.parseInt(stepStr, 10);
  if (Number.isNaN(stepNum) || stepNum < 1 || stepNum > 6) {
    notFound();
  }

  const auth = await requireUser();
  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { id: true, privacyMode: true },
  });
  if (!user) {
    redirect('/login');
  }

  const data = await onboardingService.getOnboardingFormData(user.id);
  if (data.completedAt) {
    redirect('/dashboard');
  }

  const resume = await onboardingService.getResumeStep(user.id);
  if (stepNum > resume) {
    redirect(`/onboarding/${resume}`);
  }

  const m = data.mergedDraft;
  const p = data.profile;

  switch (stepNum) {
    case 1:
      return <IntentStep initialIntent={data.intent} />;
    case 2:
      return (
        <BasicsStep
          initial={{
            firstName: p?.firstName,
            dateOfBirth: p?.dateOfBirth
              ? p.dateOfBirth.toISOString().slice(0, 10)
              : undefined,
            gender: p?.gender as BasicsForm['gender'] | undefined,
            occupation: p?.occupation ?? undefined,
            city: p?.city,
          }}
        />
      );
    case 3:
      return (
        <HousingPrefsStep
          initial={{
            budgetMin: m.budgetMin,
            budgetMax: m.budgetMax,
            moveInDate: m.moveInDate,
            moveInFlexibilityDays: m.moveInFlexibilityDays,
            leaseMinMonths: m.leaseMinMonths,
            leaseMaxMonths: m.leaseMaxMonths,
            preferredCities: m.preferredCities,
            preferredNeighborhoods: m.preferredNeighborhoods,
          }}
        />
      );
    case 4:
      return <LifestyleStep initial={m as Partial<LifestyleForm>} />;
    case 5:
      return <ValuesStep initial={m as Partial<ValuesForm>} />;
    case 6:
      return (
        <ProfileFinishStep
          initial={{
            bio: p?.bio ?? undefined,
            languages: p?.languages ?? [],
            privacyMode: user.privacyMode as 'PUBLIC' | 'MATCHES_ONLY' | 'HIDDEN',
          }}
        />
      );
    default:
      notFound();
  }
}
