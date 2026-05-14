import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { setAuthCookies, clearAuthCookies } from '@/lib/auth/session';
import { syncOnboardedCookieByCognitoSub } from '@/lib/auth/onboarding-cookie';

const REFRESH_COOKIE = 'hl_refresh_token';
const USER_SUB_COOKIE = 'hl_user_sub';

/**
 * Open redirects are a meaningful XSS escalation vector. Only allow paths
 * that point back into our own app. Reject anything containing a scheme,
 * authority, or backslash, and reject paths that don't start with a single
 * slash.
 */
function safeRedirectPath(raw: string | null): string {
  if (!raw) return '/dashboard';
  if (!raw.startsWith('/')) return '/dashboard';
  if (raw.startsWith('//')) return '/dashboard';
  if (raw.includes('\\')) return '/dashboard';
  return raw;
}

/**
 * Silent-refresh endpoint.
 *
 * Reached via a redirect from `proxy.ts` whenever a request hits a protected
 * route while the `hl_id_token` cookie is missing/expired but
 * `hl_refresh_token` is still present. Mints a fresh ID + access token from
 * Cognito, writes new cookies, then bounces the browser back to the original
 * path (preserved via `?from=`).
 *
 * If the refresh fails (token revoked / expired / bad signature), all auth
 * cookies are cleared and the browser is sent to `/login`.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const from = safeRedirectPath(url.searchParams.get('from'));

  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;
  const userSub = jar.get(USER_SUB_COOKIE)?.value;

  // Both cookies are required: the refresh token to mint new tokens, and the
  // sub to compute SECRET_HASH for Cognito's confidential-client flow.
  if (!refreshToken || !userSub) {
    await clearAuthCookies();
    redirect('/login');
  }

  let refreshFailed = false;
  try {
    const newTokens = await auth.refreshTokens(refreshToken, userSub);
    const authUser = await auth.verifyIdToken(newTokens.idToken);
    await setAuthCookies(newTokens, authUser.cognitoSub);
    await syncOnboardedCookieByCognitoSub(authUser.cognitoSub);
  } catch (err) {
    console.error('[auth/refresh] Refresh failed:', err);
    await clearAuthCookies();
    refreshFailed = true;
  }

  if (refreshFailed) redirect('/login');
  redirect(from);
}
