import 'server-only';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { HL_ONBOARDED_COOKIE } from '@/lib/auth/cookie-names';

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
};

export async function setOnboardedCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(HL_ONBOARDED_COOKIE, '1', COOKIE_BASE);
}

/**
 * If the DB shows onboarding complete, set `hl_onboarded` (self-heal stale sessions).
 */
export async function syncOnboardedCookieByCognitoSub(
  cognitoSub: string,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { cognitoSub },
    select: { onboardingState: { select: { completedAt: true } } },
  });
  if (user?.onboardingState?.completedAt) {
    await setOnboardedCookie();
  }
}
