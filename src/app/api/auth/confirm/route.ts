import { auth } from '@/lib/auth';
import { AuthError } from '@/lib/auth/errors';
import { confirmSchema } from '@/lib/auth/schemas';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: { code: 'INVALID_JSON', message: 'Invalid request body' } },
      { status: 400 },
    );
  }

  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          fields: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 400 },
    );
  }

  try {
    await auth.confirmSignUp(parsed.data);
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(
        { ok: false, error: { code: err.code, message: err.message } },
        { status: 400 },
      );
    }
    console.error('[auth/confirm] Unexpected error:', err);
    return Response.json(
      { ok: false, error: { code: 'UNKNOWN', message: 'An unexpected error occurred' } },
      { status: 500 },
    );
  }
}
