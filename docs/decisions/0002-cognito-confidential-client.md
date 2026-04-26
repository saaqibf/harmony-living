# ADR 0002 — Cognito App Client: Confidential (with `SECRET_HASH`)

- **Status:** Accepted
- **Date:** 2026-04-26
- **Deciders:** Saaqib (founder)
- **Supersedes:** Phase 1 plan (which suggested a public app client)

## Context

The Phase 1 architecture sketch suggested a *public* Cognito App Client
(no client secret) on the assumption that the client would eventually run in
a browser. During Phase 2 setup the actual app client was created as
*confidential* (with a client secret), and Phase 2 code was wired to compute
the required `SECRET_HASH` HMAC for every Cognito API call.

When this deviation surfaced during Phase 2 review, the question was whether
to flip the client to public or to keep it confidential.

## Decision

**Keep the client confidential.** The Cognito client is **only ever called
from server-side Route Handlers** (`/api/auth/signup`, `/api/auth/login`,
`/api/auth/confirm`, `/api/auth/resend`, `/api/auth/refresh`,
`/api/auth/callback`, `/api/auth/logout`) and from `proxy.ts` indirectly via
those handlers. The browser **never** sees the client secret, **never**
talks to Cognito directly, and **never** holds AWS credentials.

Confidential clients give us:

1. **Defense in depth.** Even if an attacker reaches our origin from outside
   Vercel (e.g. via a leaked public Cognito endpoint), they can't initiate
   auth flows without our shared secret.
2. **Hosted UI compatibility.** The OAuth `code` exchange in
   `/api/auth/callback` uses HTTP Basic auth with `clientId:clientSecret`
   per RFC 6749 §2.3.1. Public clients would have to use PKCE only (which
   is fine, but switching now is needless churn).
3. **No browser-side AWS code paths.** Our `AuthProvider` is firewalled
   behind `'server-only'` import and `runtime = 'nodejs'` annotations, so
   the browser bundle has zero AWS SDK weight (~700 KB savings).

## Consequences

- **All Cognito-touching code MUST run in Node.js Route Handlers.** This is
  enforced by `'server-only'` in `src/lib/auth/cognito-provider.ts`. If we
  ever need the Edge runtime for these routes, we have to either move to a
  public client + PKCE *or* call Cognito over fetch with manual SigV4 (the
  AWS SDK v3 isn't Edge-compatible for Cognito IDP yet as of 2026-04).
- **`SECRET_HASH` is required on every command that takes `Username`** —
  `SignUp`, `ConfirmSignUp`, `InitiateAuth(USER_PASSWORD_AUTH)`,
  `InitiateAuth(REFRESH_TOKEN_AUTH)`, `ResendConfirmationCode`,
  `ForgotPassword`, `ConfirmForgotPassword`, `GlobalSignOut` (via access
  token). It is computed by `computeSecretHash(username)` in
  `src/lib/auth/cognito-provider.ts`.
- **Refresh-token flow gotcha.** For `REFRESH_TOKEN_AUTH`, Cognito requires
  the `SECRET_HASH` to be keyed on the user's `sub`, **not** the email and
  not the client ID. (We hit this during Phase 2 testing; Cognito returns
  `NotAuthorizedException: Unable to verify secret hash` if you key it on
  the email after a refresh.) To preserve the `sub` between requests we
  store it in an additional long-lived cookie `hl_user_sub` alongside
  `hl_refresh_token`. See `/api/auth/refresh/route.ts`.
- **Secret rotation.** If `COGNITO_CLIENT_SECRET` is ever leaked, rotate it
  via the Cognito Console (App Integration → App Client → Edit). All
  existing refresh tokens will be invalidated and users will need to log in
  again. Document this in the runbook before launch.

## Verification

- `.env` → `COGNITO_CLIENT_SECRET` is set; `src/lib/env.ts` requires it.
- `src/lib/auth/cognito-provider.ts` →
  - `computeSecretHash(username)` is called on every command.
  - `'server-only'` import enforces server boundary.
- Phase-2 end-to-end tests covered:
  - SignUp + ConfirmSignUp (`SECRET_HASH(email)`)
  - Login (`SECRET_HASH(email)`)
  - Refresh (`SECRET_HASH(sub)`) — required separate cookie + bug fix
  - GlobalSignOut (uses access token, no `SECRET_HASH`)
- `next build` produces a server bundle that includes
  `@aws-sdk/client-cognito-identity-provider`, and a client bundle that
  does **not** (verified via build output).
