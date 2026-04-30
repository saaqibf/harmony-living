import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { stripe } from '@/lib/stripe';
import { env } from '@/lib/env';
import { log } from '@/lib/log';

export async function POST() {
  const auth = await requireUser();

  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Already verified
  const approved = await prisma.verificationRecord.findFirst({
    where: { userId: user.id, type: 'ID_DOCUMENT', status: 'APPROVED' },
  });
  if (approved) return NextResponse.json({ error: 'Already verified' }, { status: 400 });

  try {
    const session = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: { userId: user.id },
      options: { document: { require_live_capture: true, require_matching_selfie: true } },
      return_url: `${env.NEXT_PUBLIC_APP_URL}/settings/verify`,
    });

    await prisma.verificationRecord.create({
      data: {
        userId: user.id,
        type: 'ID_DOCUMENT',
        status: 'PENDING',
        provider: 'stripe',
        providerRef: session.id,
        metadata: { sessionId: session.id },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    log.error('stripe identity session creation failed', { userId: user.id, err: String(err) });
    return NextResponse.json({ error: 'Failed to start verification' }, { status: 500 });
  }
}
