import { auth } from '@/lib/auth';
import { AuthError } from '@/lib/auth/errors';
import { signUpSchema } from '@/lib/auth/schemas';

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

  const parsed = signUpSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 400 },
    );
  }

  try {
    const result = await auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    return Response.json({
      ok: true,
      codeDeliveryDestination: result.codeDeliveryDestination,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      const status = err.code === 'USER_ALREADY_EXISTS' ? 409 : 400;
      return Response.json(
        { ok: false, error: { code: err.code, message: err.message } },
        { status },
      );
    }
    console.error('[auth/signup] Unexpected error:', err);
    return Response.json(
      { ok: false, error: { code: 'UNKNOWN', message: 'An unexpected error occurred' } },
      { status: 500 },
    );
  }
}
