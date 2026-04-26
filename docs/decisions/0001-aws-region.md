# ADR 0001 — AWS Region: `us-west-2`

- **Status:** Accepted
- **Date:** 2026-04-26
- **Deciders:** Saaqib (founder)
- **Supersedes:** Phase 1 plan (which assumed `us-east-1`)

## Context

The original Phase 1 architecture document specified AWS `us-east-1` for all
infrastructure (Cognito User Pool, future RDS/SES/S3, etc.). During Phase 2
implementation the User Pool and IAM credentials were created in `us-west-2`
instead, and Phase 2 code was wired to that region (`COGNITO_REGION=us-west-2`
in `.env`, hard-coded `'us-west-2'` references in scripts and JWT verifier
configuration via `env.COGNITO_REGION`).

When this deviation surfaced during Phase 2 review, two options were on the
table:

1. **Migrate to `us-east-1`** — recreate the User Pool, reissue IAM keys,
   update all references. Cheap to do *now* (Phase 2, single user, no real
   data) but requires re-confirming the test user.
2. **Stay on `us-west-2`** — accept the deviation, update the architecture
   doc to match reality.

## Decision

**Stay on `us-west-2`.** The user pool and credentials are already provisioned
and exercised end-to-end. There is no Phase-2 rationale for `us-east-1` (no
co-location with other services, no compliance requirement, no measurable
latency difference for our user base). The cost of switching is non-zero
(reconfirm test user, reissue secrets) and the cost of staying is zero.

## Consequences

- **Future infrastructure must default to `us-west-2`.** That includes RDS
  (Postgres is currently on Neon, but if we ever move to RDS, it goes to
  `us-west-2`), SES for transactional email, S3 for media, CloudFront, etc.
  Co-locating reduces cross-region data transfer charges and latency.
- **Neon Postgres region** is currently `us-east-2` (Ohio) — see ADR 0003 if
  we revisit that. Cross-region traffic between Neon and our future
  Lambda/EC2/ECS workloads should be benchmarked before launch.
- **Backups & DR.** When we move to a multi-region posture, `us-east-1` is
  still the obvious passive region (largest AWS footprint, cheapest data
  transfer to most CDNs).

## Verification

- `.env` → `COGNITO_REGION=us-west-2`
- `src/lib/env.ts` → enforces `COGNITO_REGION` is required
- `src/lib/auth/cognito-provider.ts` → constructs both the SDK client and the
  `CognitoJwtVerifier` from `env.COGNITO_REGION`
- All Phase-2 end-to-end tests passed against this region (signup, confirm,
  login, JWT verification, refresh, global sign-out).
