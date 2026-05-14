import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/lib/auth';
import { env } from '@/lib/env';

const STATE_COOKIE = 'hl_oauth_state';
const CALLBACK_URL = `${env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;

/**
 * Initiates an OAuth flow for a social provider.
 *
 * Generates a cryptographically random `state` value, stores it in an
 * httpOnly session cookie, then redirects to Cognito's hosted UI with
 * the correct `identity_provider` parameter.
 *
 * Usage: GET /api/auth/oauth-start?provider=Google
 *               or ?provider=Apple
 *
 * The state cookie is validated in /api/auth/callback to prevent CSRF.
 */
export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get('provider');

  if (provider !== 'Google' && provider !== 'Apple') {
    return Response.json(
      { ok: false, error: { code: 'INVALID_PROVIDER', message: 'provider must be Google or Apple' } },
      { status: 400 },
    );
  }

  const state = crypto.randomBytes(16).toString('hex');
  const jar = await cookies();

  jar.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes, enough time to complete the OAuth redirect round-trip
  });

  const hostedUiUrl = auth.getHostedUiUrl(provider, CALLBACK_URL, state);
  redirect(hostedUiUrl);
}
