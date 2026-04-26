import { getCurrentUser } from '@/lib/auth/session';

/**
 * Returns the current user from the session cookie.
 * 200 with user data if authenticated, 401 if not.
 */
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      { ok: false, error: { code: 'UNAUTHENTICATED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  return Response.json({
    ok: true,
    user: {
      cognitoSub: user.cognitoSub,
      email: user.email,
      emailVerified: user.emailVerified,
    },
  });
}
