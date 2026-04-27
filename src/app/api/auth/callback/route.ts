import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/lib/auth';
import { setAuthCookies } from '@/lib/auth/session';
import { bootstrapUser } from '@/lib/auth/bootstrap-user';
import { env } from '@/lib/env';

const CALLBACK_URL = `${env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
const STATE_COOKIE = 'hl_oauth_state';

/**
 * Constant-time comparison for the OAuth `state` cookie vs query-string value.
 *
 * The state token is a 128-bit random hex string (32 chars). With current
 * hardware a vanilla string compare's timing channel is nowhere near
 * exploitable for tokens this size, but `timingSafeEqual` is free and removes
 * an entire class of theoretical attacks from our threat model.
 *
 * `timingSafeEqual` THROWS if the inputs differ in length, so we short-circuit
 * on length mismatch (and on empty inputs) before calling it.
 */
function statesMatch(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const error = searchParams.get('error');

  // Cognito hosted UI redirects here on OAuth errors too (e.g. user cancelled).
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error)}`);
  }

  if (!code || !stateParam) {
    return Response.json(
      { ok: false, error: { code: 'MISSING_PARAMS', message: 'Missing code or state' } },
      { status: 400 },
    );
  }

  // CSRF state validation — constant-time compare of query param against the
  // cookie we set in /api/auth/oauth-start before the redirect to Cognito.
  const jar = await cookies();
  const stateCookie = jar.get(STATE_COOKIE)?.value;

  if (!statesMatch(stateCookie, stateParam)) {
    return Response.json(
      { ok: false, error: { code: 'STATE_MISMATCH', message: 'OAuth state mismatch — possible CSRF attempt' } },
      { status: 400 },
    );
  }

  try {
    const tokens = await auth.exchangeAuthCodeForTokens(code, CALLBACK_URL);
    const authUser = await auth.verifyIdToken(tokens.idToken);
    await bootstrapUser(authUser);
    await setAuthCookies(tokens, authUser.cognitoSub);

    // Clear the one-time state cookie.
    jar.delete(STATE_COOKIE);
  } catch (err) {
    console.error('[auth/callback] Token exchange failed:', err);
    redirect('/login?error=oauth_failed');
  }

  // redirect() must be called outside try/catch — throws NEXT_REDIRECT internally.
  redirect('/dashboard');
}
