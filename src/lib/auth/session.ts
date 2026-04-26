import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from './index';
import type { AuthTokens, AuthUser } from './types';
import { AuthError, AuthErrorCode } from './errors';

const COOKIE_ID_TOKEN = 'hl_id_token';
const COOKIE_ACCESS_TOKEN = 'hl_access_token';
const COOKIE_REFRESH_TOKEN = 'hl_refresh_token';

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
 * Writes all three Cognito tokens as httpOnly cookies.
 * Must be called from a Route Handler or Server Function — not during render.
 */
export async function setAuthCookies(tokens: AuthTokens): Promise<void> {
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
}

/**
 * Clears all three auth cookies.
 * Must be called from a Route Handler or Server Function — not during render.
 */
export async function clearAuthCookies(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_ID_TOKEN);
  jar.delete(COOKIE_ACCESS_TOKEN);
  jar.delete(COOKIE_REFRESH_TOKEN);
}

/**
 * Returns the current authenticated user, or null if not authenticated.
 *
 * On an expired ID token, attempts a silent refresh using the refresh token.
 * If the refresh succeeds, new cookies are written and the user is returned.
 * If the refresh fails (refresh token expired / revoked), cookies are cleared
 * and null is returned.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const idToken = jar.get(COOKIE_ID_TOKEN)?.value;

  if (!idToken) return null;

  try {
    return await auth.verifyIdToken(idToken);
  } catch (err) {
    // ID token invalid or expired — try refreshing.
    if (
      err instanceof AuthError &&
      err.code === AuthErrorCode.INVALID_TOKEN
    ) {
      const refreshToken = jar.get(COOKIE_REFRESH_TOKEN)?.value;
      if (!refreshToken) {
        await clearAuthCookies();
        return null;
      }

      try {
        const newTokens = await auth.refreshTokens(refreshToken);
        await setAuthCookies(newTokens);
        return await auth.verifyIdToken(newTokens.idToken);
      } catch {
        await clearAuthCookies();
        return null;
      }
    }

    await clearAuthCookies();
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
