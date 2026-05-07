import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { AuthError } from '@/lib/auth/errors';

const schema = z.object({
  email: z.string().email(),
  code: z.string().min(1),
  newPassword: z.string().min(10),
});

const errorMessages: Record<string, string> = {
  CODE_MISMATCH: 'Incorrect code. Please try again.',
  CODE_EXPIRED: 'Code expired. Request a new one.',
  PASSWORD_POLICY: 'Password does not meet requirements.',
  TOO_MANY_ATTEMPTS: 'Too many attempts. Please wait a moment.',
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
  try {
    await auth.resetPassword(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const code = err instanceof AuthError ? err.code : 'UNKNOWN';
    return NextResponse.json(
      { ok: false, error: errorMessages[code] ?? 'Something went wrong.' },
      { status: 400 },
    );
  }
}
