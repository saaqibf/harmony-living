import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route protection map.
 *
 * PROTECTED — unauthenticated visitors are redirected to /login, with the
 *             original path preserved in `?from=` so we can redirect back
 *             after a successful login.
 *
 * AUTH_ONLY — already-authenticated visitors are redirected to /dashboard
 *             (no need to show login/signup to someone already logged in).
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
];

const AUTH_ONLY_PREFIXES = ['/login', '/signup', '/confirm', '/forgot-password'];

/**
 * Auth cookies the proxy looks at:
 *
 *   hl_id_token       — short-lived (1h). Verified inside server components.
 *   hl_refresh_token  — long-lived (30d). Used at /api/auth/refresh to mint
 *                       a fresh ID token when the short one has expired.
 *
 * The proxy never calls Cognito itself — it only routes the request to the
 * appropriate handler based on which cookies are present.
 */
const ID_TOKEN_COOKIE = 'hl_id_token';
const REFRESH_TOKEN_COOKIE = 'hl_refresh_token';

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Read auth cookies directly from the incoming request object.
  // This is synchronous (no await needed) — NextRequest.cookies is a
  // RequestCookies instance backed by the request's Cookie header.
  const hasIdToken = request.cookies.has(ID_TOKEN_COOKIE);
  const hasRefreshToken = request.cookies.has(REFRESH_TOKEN_COOKIE);
  const hasSession = hasIdToken || hasRefreshToken;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  const isAuthOnly = AUTH_ONLY_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  // Protected route + ID token expired/missing but refresh token present →
  // bounce through /api/auth/refresh which mints fresh tokens, sets new
  // cookies, then redirects back to the original path. Server Components
  // can't write cookies during render, which is why this dance lives in a
  // route handler instead of inside `getCurrentUser()`.
  if (isProtected && !hasIdToken && hasRefreshToken) {
    const refreshUrl = new URL('/api/auth/refresh', request.url);
    refreshUrl.searchParams.set('from', pathname + search);
    return NextResponse.redirect(refreshUrl);
  }

  // Unauthenticated user hitting a protected route → redirect to /login.
  // Preserve the destination in `?from=` so the login page can bounce them
  // back after authentication.
  if (isProtected && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user hitting an auth-only route → redirect to /dashboard.
  // We require a valid (non-expired) ID token here, not just the refresh
  // cookie — otherwise an expired session would block the user from
  // re-entering the login page to authenticate again.
  if (isAuthOnly && hasIdToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

/**
 * Run the proxy on all page + API routes, but skip Next.js internals and
 * static assets so we don't add latency to file serving.
 *
 * Excluded prefixes:
 *   _next/static  — JS/CSS bundles
 *   _next/image   — image optimisation endpoint
 *   favicon.ico, sitemap.xml, robots.txt — metadata files
 *
 * Note: _next/data is intentionally NOT excluded. Next.js docs state that
 * excluding it can cause accidental security holes (the proxy would skip the
 * check for RSC data requests even though the page itself is protected).
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
