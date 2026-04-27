# ADR 0003 — Resend Confirmation Code: Silent Success for Privacy

- **Status:** Accepted
- **Date:** 2026-04-26
- **Deciders:** Saaqib (founder)
- **Supersedes:** N/A — codifies behavior introduced in Phase 2 cleanup.

## Context

`POST /api/auth/resend` triggers a Cognito `ResendConfirmationCode` for a given
email. Cognito itself returns distinct errors for distinct reasons:

| Cognito exception           | Meaning                                            |
| --------------------------- | -------------------------------------------------- |
| `UserNotFoundException`     | The email is not registered in our user pool.      |
| `NotAuthorizedException`    | The user is registered but already confirmed.      |
| `InvalidParameterException` | The user is in another invalid state.              |
| `LimitExceededException`    | Caller has hit Cognito's per-user rate limit.      |
| `TooManyRequestsException`  | Caller has hit Cognito's account-wide rate limit.  |

A naive implementation passes these through to the client (e.g. as a 400 with
the Cognito error code in the body). That implementation is what we shipped in
Phase 2. The Phase 2 review caught a partial leak: a tester observed that
"resend for already-confirmed user" returned 200 (because Cognito happened to
silently accept the call), while "resend for non-existent email" still
returned `400 { code: USER_NOT_FOUND }`. The behavior was inconsistent and the
inconsistency itself was an enumeration signal.

The question is: what should the resend endpoint return?

## Decision

**Return `200 { ok: true }` for every input that passes Zod validation,
regardless of what Cognito does.** The endpoint suppresses every
`AuthError` (the typed enum that wraps Cognito exceptions) and logs it
server-side at `warn` level for ops visibility. Truly unexpected errors
(non-`AuthError` thrown values — network faults, unknown SDK exceptions)
still return `500` because they are not existence signals and ops needs to
see them.

The implementation lives in `src/app/api/auth/resend/route.ts` and carries an
explicit comment block to discourage a future engineer from "fixing" this
behavior without rereading this ADR.

## Consequences

**Privacy gain (the reason for the change).** An attacker walking a list of
candidate emails through this endpoint cannot learn:

- Which emails are registered (vs. fictional).
- Which registered emails are already confirmed (vs. unconfirmed).
- Which registered, unconfirmed emails are still within their resend rate limit.

The endpoint emits the same response shape and status code in all of those
cases. The only signal an attacker gets is "this string passed Zod email
validation," which is information they already had before sending the request.

**UX regressions we accept.** A user who mistypes their email will see
"check your inbox" but never receive a code. There's no in-product cue that
the email was wrong. Mitigations:

1. The Phase 2 signup flow stores the email in a query string and pre-fills
   the confirm page, so the typo would have been visible during signup
   anyway.
2. The confirm page should (in a future iteration) include "Didn't get it?
   Re-enter your email" copy, which gives the user a path back without our
   server having to leak.
3. We deliberately keep ops visibility via the server-side `console.warn`
   log so support can investigate "I never got my code" tickets by checking
   the log for the user's email — without that information being available
   to the client.

**Operational visibility we keep.** Logs like:

    [auth/resend] Suppressed Cognito error for privacy: code=USER_NOT_FOUND message="..."

let us recognize patterns (e.g. a spike in `USER_NOT_FOUND` warns of either a
typo storm or a real enumeration probe). When we add structured logging in a
later phase, this should be tagged as an `auth.resend.suppressed` event with
the original Cognito code as a label, NOT the email address.

**Rate limiting.** Because the endpoint always returns 200 even on rate-limit
exhaustion, an attacker can repeatedly hit `/api/auth/resend` without getting
a back-off signal. We mitigate this by relying on Cognito's own per-user and
account-level rate limits (the codes are still suppressed, but the work isn't
done past those limits) and by adding a future application-level rate limit
keyed on IP + email hash before launch (see Phase 5+ runbook).

## Verification

- `src/app/api/auth/resend/route.ts` returns `Response.json({ ok: true })`
  outside the try/catch.
- The catch handles only two cases: `instanceof AuthError` → log + fall
  through; else → 500.
- Phase 2 negative-case test #14 (already-confirmed user) still returns 200.
  In Phase 3 we add a follow-up test #14b (non-existent email) to confirm it
  also returns 200 with this implementation.
