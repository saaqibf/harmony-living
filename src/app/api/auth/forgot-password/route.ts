import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 });
  }
  // Always 200, never reveal whether account exists
  await auth.forgotPassword(parsed.data.email).catch(() => {});
  return NextResponse.json({ ok: true });
}
