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

const SESSION_COOKIE = 'hl_id_token';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read the session cookie directly from the incoming request object.
  // This is synchronous (no await needed) — NextRequest.cookies is a
  // RequestCookies instance backed by the request's Cookie header.
  const hasSession = request.cookies.has(SESSION_COOKIE);

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  const isAuthOnly = AUTH_ONLY_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  // Unauthenticated user hitting a protected route → redirect to /login.
  // Preserve the destination in `?from=` so the login page can bounce them
  // back after authentication.
  if (isProtected && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user hitting an auth-only route → redirect to /dashboard.
  if (isAuthOnly && hasSession) {
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
