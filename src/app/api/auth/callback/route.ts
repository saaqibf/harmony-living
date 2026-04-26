import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { setAuthCookies } from '@/lib/auth/session';
import { bootstrapUser } from '@/lib/auth/bootstrap-user';
import { env } from '@/lib/env';

const CALLBACK_URL = `${env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
const STATE_COOKIE = 'hl_oauth_state';

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

  // CSRF state validation — compare query param against the cookie we set
  // in /api/auth/oauth-start before the redirect to Cognito.
  const jar = await cookies();
  const stateCookie = jar.get(STATE_COOKIE)?.value;

  if (!stateCookie || stateCookie !== stateParam) {
    return Response.json(
      { ok: false, error: { code: 'STATE_MISMATCH', message: 'OAuth state mismatch — possible CSRF attempt' } },
      { status: 400 },
    );
  }

  try {
    const tokens = await auth.exchangeAuthCodeForTokens(code, CALLBACK_URL);
    const authUser = await auth.verifyIdToken(tokens.idToken);
    await bootstrapUser(authUser);
    await setAuthCookies(tokens);

    // Clear the one-time state cookie.
    jar.delete(STATE_COOKIE);
  } catch (err) {
    console.error('[auth/callback] Token exchange failed:', err);
    redirect('/login?error=oauth_failed');
  }

  // redirect() must be called outside try/catch — throws NEXT_REDIRECT internally.
  redirect('/dashboard');
}
