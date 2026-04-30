import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { HL_ONBOARDED_COOKIE } from '@/lib/auth/cookie-names';

/**
 * Route protection map.
 *
 * PROTECTED — unauthenticated visitors are redirected to /login, with the
 *             original path preserved in `?from=` so we can redirect back
 *             after a successful login.
 *
 * AUTH_ONLY — already-authenticated visitors are redirected away (onboarding
 *             vs dashboard based on `hl_onboarded`).
 *
 * Everything else is public — the proxy just calls NextResponse.next().
 *
 * IMPORTANT: This is a fast, first-line-of-defense check based on cookie
 * *presence* only. Full JWT verification (signature + expiry) happens inside
 * server components and route handlers via `requireUser()` / `getCurrentUser()`.
 * Never skip those checks based solely on this proxy passing.
 */
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/listings',
  '/inbox',
  '/messages',
  '/onboarding',
  '/discover',
  '/matches',
];

const AUTH_ONLY_PREFIXES = ['/login', '/signup', '/confirm', '/forgot-password'];

const ID_TOKEN_COOKIE = 'hl_id_token';
const REFRESH_TOKEN_COOKIE = 'hl_refresh_token';

function isOnboardingPath(pathname: string) {
  return pathname === '/onboarding' || pathname.startsWith('/onboarding/');
}

function isApiAuthPath(pathname: string) {
  return pathname.startsWith('/api/auth');
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const hasIdToken = request.cookies.has(ID_TOKEN_COOKIE);
  const hasRefreshToken = request.cookies.has(REFRESH_TOKEN_COOKIE);
  const hasSession = hasIdToken || hasRefreshToken;
  const hasOnboardedCookie = request.cookies.get(HL_ONBOARDED_COOKIE)?.value === '1';

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  const isAuthOnly = AUTH_ONLY_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtected && !hasIdToken && hasRefreshToken) {
    const refreshUrl = new URL('/api/auth/refresh', request.url);
    refreshUrl.searchParams.set('from', pathname + search);
    return NextResponse.redirect(refreshUrl);
  }

  if (isProtected && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    hasSession &&
    !hasOnboardedCookie &&
    isProtected &&
    !isOnboardingPath(pathname) &&
    !isApiAuthPath(pathname)
  ) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  if (hasSession && hasOnboardedCookie && isOnboardingPath(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isAuthOnly && hasIdToken) {
    if (hasOnboardedCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
