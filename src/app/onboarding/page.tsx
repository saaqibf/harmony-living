import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { onboardingService } from '@/server/services/onboarding';

export default async function OnboardingIndexPage() {
  const auth = await requireUser();
  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { id: true },
  });
  if (!user) {
    redirect('/login');
  }
  const step = await onboardingService.getResumeStep(user.id);
  redirect(`/onboarding/${step}`);
}
