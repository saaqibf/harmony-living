import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db/prisma';
import { env } from '@/lib/env';
import { log } from '@/lib/log';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    log.warn('stripe webhook signature verification failed', { err: String(err) });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'identity.verification_session.verified') {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    if (!userId) {
      log.warn('stripe webhook missing userId in metadata', { sessionId: session.id });
      return NextResponse.json({ ok: true });
    }

    await prisma.verificationRecord.updateMany({
      where: { userId, providerRef: session.id, type: 'ID_DOCUMENT' },
      data: { status: 'APPROVED', verifiedAt: new Date() },
    });

    log.info('user verified via stripe identity', { userId, sessionId: session.id });
  }

  if (event.type === 'identity.verification_session.requires_input') {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    if (userId) {
      await prisma.verificationRecord.updateMany({
        where: { userId, providerRef: session.id, type: 'ID_DOCUMENT' },
        data: { status: 'REJECTED' },
      });
      log.info('stripe identity requires_input, marked rejected', { userId, sessionId: session.id });
    }
  }

  return NextResponse.json({ ok: true });
}
