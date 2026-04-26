import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from './index';
import type { AuthTokens, AuthUser } from './types';

const COOKIE_ID_TOKEN = 'hl_id_token';
const COOKIE_ACCESS_TOKEN = 'hl_access_token';
const COOKIE_REFRESH_TOKEN = 'hl_refresh_token';
/**
 * Stores the Cognito `sub` of the signed-in user. Required at refresh time
 * because Cognito's `REFRESH_TOKEN_AUTH` flow needs `SECRET_HASH` keyed on
 * the username — and by the time we want to refresh, the ID token cookie
 * (which carries the sub claim) has already expired.
 *
 * The `sub` is an opaque UUID, not PII. Same lifetime as the refresh cookie.
 */
const COOKIE_USER_SUB = 'hl_user_sub';

/** 30 days — matches Cognito's default refresh token expiry. */
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

/** 60 minutes — matches Cognito's default access/ID token expiry. */
const ACCESS_TOKEN_MAX_AGE = 60 * 60;

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
} as const;

/**
 * Writes all auth cookies (3 tokens + `hl_user_sub`) as httpOnly cookies.
 * Must be called from a Route Handler or Server Function — not during render.
 *
 * Pass `userSub` when it is already known (after `verifyIdToken` upstream) so
 * we don't double-decode the JWT just to read the `sub` claim.
 */
export async function setAuthCookies(
  tokens: AuthTokens,
  userSub: string,
): Promise<void> {
  const jar = await cookies();

  jar.set(COOKIE_ID_TOKEN, tokens.idToken, {
    ...COOKIE_BASE,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  jar.set(COOKIE_ACCESS_TOKEN, tokens.accessToken, {
    ...COOKIE_BASE,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  jar.set(COOKIE_REFRESH_TOKEN, tokens.refreshToken, {
    ...COOKIE_BASE,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  jar.set(COOKIE_USER_SUB, userSub, {
    ...COOKIE_BASE,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

/**
 * Clears all auth cookies.
 * Must be called from a Route Handler or Server Function — not during render.
 */
export async function clearAuthCookies(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_ID_TOKEN);
  jar.delete(COOKIE_ACCESS_TOKEN);
  jar.delete(COOKIE_REFRESH_TOKEN);
  jar.delete(COOKIE_USER_SUB);
}

/**
 * Returns the current authenticated user, or null if not authenticated.
 *
 * This function is **read-only**: it verifies the `hl_id_token` cookie and
 * nothing more. It is safe to call from Server Components, Route Handlers,
 * and Server Actions.
 *
 * It does NOT attempt silent refresh, because Server Components cannot
 * write cookies. Silent refresh happens at the proxy boundary instead:
 * when `hl_id_token` is missing but `hl_refresh_token` is present, the
 * proxy redirects to `/api/auth/refresh?from=<path>`, which mints new
 * tokens, sets fresh cookies, and bounces the browser back to the
 * original path. By the time a Server Component runs, `hl_id_token` is
 * either valid or definitively absent.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const idToken = jar.get(COOKIE_ID_TOKEN)?.value;
  if (!idToken) return null;

  try {
    return await auth.verifyIdToken(idToken);
  } catch {
    return null;
  }
}

/**
 * Returns the current authenticated user, redirecting to /login if not authed.
 *
 * IMPORTANT: `redirect()` throws a NEXT_REDIRECT error — call this function
 * OUTSIDE any try/catch block, or the redirect will be swallowed.
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}
