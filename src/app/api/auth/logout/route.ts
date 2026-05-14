import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';
import { clearAuthCookies } from '@/lib/auth/session';

export async function POST() {
  const jar = await cookies();
  const accessToken = jar.get('hl_access_token')?.value;

  if (accessToken) {
    try {
      // Revoke all tokens for this session in Cognito.
      // If the token is already expired, GlobalSignOut throws NotAuthorizedException;
      // the cognito-provider swallows that specific error, so we proceed to clear cookies.
      await auth.signOut(accessToken);
    } catch {
      // Best-effort: always clear cookies even if Cognito revocation fails.
    }
  }

  await clearAuthCookies();
  return Response.json({ ok: true });
}
