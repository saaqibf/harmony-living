import { auth } from '@/lib/auth';
import { AuthError } from '@/lib/auth/errors';
import { resendSchema } from '@/lib/auth/schemas';

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

  const parsed = resendSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: { code: 'VALIDATION_ERROR', fields: parsed.error.flatten().fieldErrors } },
      { status: 400 },
    );
  }

  // PRIVACY / ANTI-ENUMERATION: DO NOT "FIX" THIS WITHOUT CONSIDERING THE TRADE-OFF.
  //
  // We intentionally respond with `200 { ok: true }` for every successful Zod
  // validation, including the cases where Cognito raises an error such as:
  //
  //   - UserNotFoundException     → email is not registered
  //   - NotAuthorizedException    → email is registered but already confirmed
  //   - InvalidParameterException → email is in some other invalid state
  //
  // Returning a distinguishable error in any of these cases would let an
  // attacker enumerate which emails are registered with us, and at what
  // state. The cost of this protection is a small UX regression: a user who
  // mistypes their email won't get an explicit "no such account" message,
  // which we accept. See `docs/decisions/0003-resend-silent-success.md`.
  //
  // Truly unexpected errors (network faults, unknown SDK exceptions) are NOT
  // existence signals and are still surfaced as 500 so ops can find them.
  try {
    await auth.resendConfirmationCode(parsed.data.email);
  } catch (err) {
    if (err instanceof AuthError) {
      console.warn(
        `[auth/resend] Suppressed Cognito error for privacy: code=${err.code} message="${err.message}"`,
      );
    } else {
      console.error('[auth/resend] Unexpected error:', err);
      return Response.json(
        { ok: false, error: { code: 'UNKNOWN', message: 'An unexpected error occurred' } },
        { status: 500 },
      );
    }
  }

  return Response.json({ ok: true });
}
