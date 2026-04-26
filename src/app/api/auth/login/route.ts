import { auth } from '@/lib/auth';
import { AuthError, AuthErrorCode } from '@/lib/auth/errors';
import { signInSchema } from '@/lib/auth/schemas';
import { setAuthCookies } from '@/lib/auth/session';
import { bootstrapUser } from '@/lib/auth/bootstrap-user';

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

  const parsed = signInSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: { code: 'VALIDATION_ERROR', fields: parsed.error.flatten().fieldErrors },
      },
      { status: 400 },
    );
  }

  try {
    const tokens = await auth.signIn(parsed.data);
    const authUser = await auth.verifyIdToken(tokens.idToken);

    // Idempotent — creates the Postgres User row on first login, updates on
    // subsequent logins. This is the only place User rows are created.
    await bootstrapUser(authUser);
    await setAuthCookies(tokens);

    return Response.json({ ok: true, user: { email: authUser.email } });
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.code === AuthErrorCode.USER_NOT_CONFIRMED) {
        return Response.json(
          { ok: false, error: { code: err.code, message: err.message } },
          { status: 403 },
        );
      }
      return Response.json(
        { ok: false, error: { code: err.code, message: err.message } },
        { status: 401 },
      );
    }
    console.error('[auth/login] Unexpected error:', err);
    return Response.json(
      { ok: false, error: { code: 'UNKNOWN', message: 'An unexpected error occurred' } },
      { status: 500 },
    );
  }
}
