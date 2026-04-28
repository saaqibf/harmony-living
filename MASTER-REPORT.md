# Harmony Living — Master Project Report

A complete, self-contained handoff document. The canonical source of truth for the project's architecture, history, and current state. Updated at the end of every phase.

**Document version:** 1.1
**As of:** April 26, 2026
**Project state:** End of Phase 2; Phase 3 architecture locked; ADR 0005 (discovery pivot) accepted; code not yet started

---

## 1. Project overview

**Harmony Living** is a values-first roommate matching platform. It combines housing listings with deep compatibility matching to help people — especially newcomers, students, and faith-observant users — find roommates they'll actually live well with.

### The wedge
Most platforms (Zillow, Kijiji, Facebook, SpareRoom) treat roommate matching as either a real-estate listing problem or a free-form social problem. Neither solves the actual hard case: a person who needs a roommate aligned on faith, lifestyle, gender, and values, in a new city, where they don't know anyone, and where unsafe contact is a real risk.

The product wedge is a **mutual-match swipe model** plus **multi-layered privacy controls** plus **deep compatibility scoring** — all framed as "find a person you'll live well with," not "scroll listings and hope."

### Canonical hard case
A young Muslim woman in a new city, looking for a roommate who shares her faith, gender, and lifestyle. She needs to:
- See the person's face and judge fit visually (or choose not to, on her terms)
- See the person's stated values, faith practice, and lifestyle
- Same-gender by default, with no possibility of male users seeing her profile
- Confidence that the person on the other side has been verified
- Protection from unsolicited contact

The platform is built around this case. Easier cases are subsumed.

### Target users
- Newcomer students (international or out-of-province)
- Young professionals relocating
- Faith-observant seekers (practicing Muslims, Jews, Hindus, Christians, etc.)
- Women seeking same-gender roommates
- Room listers (existing tenants with spare rooms)
- Small landlords (1–5 properties)

### Three pillars
1. **Deep compatibility** — multi-dimensional, not just rent + location
2. **Connection over scrolling** — swipe-based discovery, mutual match required for messaging, profiles surface based on values not engagement metrics
3. **Trust and safety by design** — verified profiles, female-only mode, per-user photo visibility, ID-verification gating, optional voice/video intros

### Founder
Saaqib Fagbenro (saaqib.fagbenro@ucalgary.ca), Calgary, Alberta, Canada.

---

## 2. Tech stack — final and locked

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16.2.4 App Router | Server Actions, server components, Edge proxy. `proxy.ts` (renamed from `middleware.ts` in v16) |
| Language | TypeScript 5 | Strict mode |
| UI | React 19.2.4 | Direct ref pattern (no `forwardRef`) |
| Styling | Tailwind CSS v4 | `@theme` block in `globals.css`, no `tailwind.config.js` |
| Component primitives | Hand-rolled in `src/components/ui/` | Single Radix dependency: `@radix-ui/react-slider` (Phase 3) |
| Database | PostgreSQL via Neon (us-west-2) | Serverless, free tier |
| ORM | Prisma 7.8 | Generated client at `./generated/prisma`; requires `PrismaPg` adapter |
| Auth | AWS Cognito (us-west-2) | Confidential client with SECRET_HASH, hosted UI for OAuth, JWT in httpOnly cookies |
| JWT verification | `aws-jwt-verify` | JWKS-backed, audience + issuer validated |
| Validation | Zod v4 | Forms + API + env vars + dealbreakers |
| Forms | react-hook-form + `@hookform/resolvers` | |
| Real-time (Phase 5+) | Pusher Channels | Behind a `RealtimeTransport` abstraction |
| Maps (Phase 4) | Mapbox GL JS | Cheaper than Google Maps |
| File storage (Phase 4) | AWS S3 | us-west-2, used for photos + intro media |
| Server-side image blur (Phase 4) | sharp | Pre-blurred photo variant generated at upload |
| Identity verification (Phase 6) | TBD — Persona or Stripe Identity | |
| Testing | Jest, React Testing Library, Playwright | Playwright used for Phase 3 onboarding E2E (`e2e/`); `npm run test:e2e` |
| Deployment | Vercel primary, Amplify alternative | Local dev only currently |
| Node version | v25.6.1 | Bleeding edge; LTS would be v22 |
| Package manager | npm v11.9.0 | Default |

### Why these choices (key tradeoffs)
- **Next.js full-stack** over separate frontend/backend: faster ship, server components, single deploy.
- **Prisma 7 over Drizzle**: better tooling. Tradeoff: API breakages from earlier versions.
- **Cognito over Clerk/Auth.js**: founder specified it. Mitigated by `AuthProvider` interface — swap in 1 day if needed.
- **Cognito confidential client over public**: defense-in-depth for server-rendered architecture (ADR 0002).
- **Mapbox over Google Maps**: cost at scale, design fit.
- **Pusher over self-hosted Socket.io**: zero ops for MVP, swap later.
- **Neon over local Postgres**: zero local-dev setup, branch databases, free tier covers dev.
- **us-west-2 over us-east-1**: provisioned first; ADR 0001 locks it.
- **Swipe-based discovery over feed**: ADR 0005. Mutual-match prevents unsolicited contact, framing reads as serious roommate finding.

---

## 3. Working agreement — two-agent workflow

This project uses **one author** — Saaqib Fagbenro, the founder — who keeps **build** and **review** independent by working in two folders with two AI tools. Git attributes every commit to the founder; the table below clarifies **roles vs tools** so future readers are not misled about authorship.

| Role | Person | Tool used | Folder | Responsibilities |
|---|---|---|---|---|
| **Founder** | Saaqib Fagbenro | claude.ai (or any tool, for high-level direction) | n/a | Product owner, decision-maker, courier between roles |
| **Builder** | Saaqib Fagbenro | Cursor's AI in `harmony-living-cursor` | `~/Projects/harmony-living-cursor` | Writes code, runs migrations, commits, pushes (uses Cursor's AI as the implementation tool) |
| **Reviewer** | Saaqib Fagbenro | Claude Code in `harmony-living-vscode` | `~/Projects/harmony-living-vscode` | Audits frozen commits, finds gaps, produces fix prompts (uses Claude Code as the audit tool) |

GitHub repo: `https://github.com/saaqibf/harmony-living.git` (private). Both folders connect to this repo.

### The phase loop

1. Founder pastes the phase mega-prompt to **Cursor** (Builder seat).
2. The founder, in the Builder seat, executes step-by-step (pausing between major tasks), runs gates, commits, pushes, and writes `docs/reports/phase-N-report.md`.
3. Founder pulls in VS Code, pastes the phase report to **Claude Code** (Reviewer seat).
4. The founder, in the Reviewer seat, audits and either approves or produces a fix prompt.
5. If fixes: Founder pastes the fix prompt to Cursor; loop returns to step 2.
6. If approved: Founder requests the next phase mega-prompt from claude.ai (or proceeds as agreed).

The Reviewer seat audits a **frozen commit**, not a moving target. The two tools do not share conversation context. This pattern caught three real auth bugs in Phase 2 that synthetic gates alone missed.

Detailed rules for both seats are in `WORKFLOW.md` at the repo root.

---

## 4. Phase history

### Phase 1 — Foundation (✅ shipped)

**Commits:** `038e57a`, `80703e3`, `ae21f00`

Built: Next.js 16 project with App Router, TypeScript, Tailwind v4. Folder structure under `src/{app,components,features,lib,server,hooks,types,styles}`. Prettier config. `cn()` utility. Neon Postgres provisioned (us-west-2). Full Prisma schema with 16 models, 17 enums. Initial migration `20260423084723_init` applied. Prisma 7 setup with `output = "../generated/prisma"`, `prisma.config.ts`, `PrismaPg` adapter. Zod env validation. `src/instrumentation.ts` for eager validation. Tailwind v4 design tokens. Inter font. UI primitives: `Button` (with `buttonClasses()` helper), `Input`, `Card`, `Label`. Homepage.

All gates passed.

### Phase 2 — Authentication (✅ shipped + verified end-to-end)

**Commits:** `2deb7c2` (initial), `71a850d` (3 architectural bug fixes from real e2e flow), `cc303bf` (Phase 2 cleanup)

Built: AWS Cognito user pool in us-west-2 (masked: `us-west-2_1ky9…`). Confidential app client. Hosted UI domain. Full `src/lib/auth/` provider abstraction. API routes for signup/confirm/resend/login/logout/me/oauth-start/callback/refresh. Auth pages under `src/app/(auth)/`. Dashboard with `requireUser()`. `src/proxy.ts` (Next.js 16 renamed from `middleware.ts`).

**Three real bugs caught and fixed during the second-pass review:**
1. Proxy treated expired ID token as logged-out — fixed by checking refresh-token cookie and redirecting to `/api/auth/refresh`.
2. `getCurrentUser()` couldn't write cookies during render — fixed by separating read-only helper from cookie-writing route handler.
3. `REFRESH_TOKEN_AUTH` SECRET_HASH must use `sub`, not email — fixed by storing `hl_user_sub` cookie alongside refresh token.

**End-to-end verified:** real signup → real Gmail inbox → 6-digit code → confirm → login → dashboard → User row in Postgres → silent refresh works → `GlobalSignOut` actually revokes refresh token at Cognito.

**15 negative test cases passing**, including non-existent-email returning same code as wrong-password (no enumeration leak), tampered JWT rejected, garbage cookies handled.

### Cookies set (Phase 2)
| Cookie | Lifetime | HttpOnly | Secure (prod) | SameSite | Path |
|---|---|---|---|---|---|
| `hl_id_token` | 1 hour | ✅ | ✅ | Lax | `/` |
| `hl_access_token` | 1 hour | ✅ | ✅ | Lax | `/` |
| `hl_refresh_token` | 30 days | ✅ | ✅ | Lax | `/` |
| `hl_user_sub` | 30 days | ✅ | ✅ | Lax | `/` |
| `hl_oauth_state` | 10 min | ✅ | ✅ | Lax | `/` |
| `hl_onboarded` (Phase 3+) | 30 days | ✅ | ✅ | Lax | `/` |

### Phase 3 — Onboarding wizard + discovery model schema (🟡 architecture locked, code not started)

Architecture locked in ADR 0004 (8 onboarding invariants) and ADR 0005 (8 discovery invariants).

**Onboarding wizard (ADR 0004):** 6-step wizard: Intent → Basics → Housing → Lifestyle → Values → Profile finishing. Adds `OnboardingState` model with `version` and `draftData` JSON columns. Step 3/4/5 data lives in `draftData` until promotable to a complete `Preferences` row, then promoted in a transaction. Vocabulary locked. DOB stored as UTC midnight. Dealbreakers as typed Zod discriminated union. Verifications gated on `completedAt IS NOT NULL`. Photo upload deferred to Phase 4.

**Discovery model (ADR 0005):** Swipe-based discovery (Connect/Pass), mutual-match required for messaging, female-only mode hard toggle, per-user photo visibility, verification gating filter, optional voice/video intros (queue boost), daily swipe cap (default 100), household schema for future group swipe. Adds `Swipe`, `Match`, `Household`, `HouseholdMember` models, plus `User.femaleOnlyMode`, `User.requireVerifiedConnections`, `User.dailySwipeQuota`, `Profile.photoVisibility`, `Profile.introMediaUrl`, `Profile.introMediaType`. All additive — no existing fields changed.

**Status:** Architecture decisions all approved. ADRs 0004 + 0005 written. **No Phase 3 code yet.** Mega-prompt updated to incorporate the discovery schema; will be issued once cleanup gaps are closed.

---

## 5. Locked decisions (ADR index)

| ADR # | Status | Title | One-line summary |
|---|---|---|---|
| 0001 | Accepted | AWS region us-west-2 | All AWS infra (Cognito, future RDS/SES/S3) lives in us-west-2; no multi-region for MVP |
| 0002 | Accepted | Cognito confidential client | App client has secret + SECRET_HASH on every call; Node.js runtime only; refresh-token flow uses `sub` not email |
| 0003 | Accepted | Resend silent success | `/api/auth/resend` always returns 200 — privacy by design, prevents account enumeration |
| 0004 | Accepted | Onboarding wizard invariants | 8 load-bearing rules: admin roles preserved, draftData→Preferences promotion, vocabulary lock, photo deferred, typed dealbreakers, UTC-midnight DOB, post-onboarding verifications, wizard versioning |
| 0005 | Accepted | Discovery, swipe-based matching, and pre-match privacy | 8 invariants: swipe is default, mutual-match gate for messaging, female-only mode hard filter, per-user photo visibility, verification-gated filter, optional intro with queue boost, daily swipe cap, household schema for future group swipe |

ADRs are load-bearing. Don't supersede without writing a new numbered ADR. They live in `docs/decisions/`.

---

## 6. Schema state

### Models in production (16, post-Phase 1 migration)
`User`, `Profile`, `Preferences`, `Listing`, `ListingImage`, `ListingInterest`, `SavedListing`, `CompatibilityScore`, `Conversation`, `ConversationParticipant`, `Message`, `Report`, `Block`, `VerificationRecord`, `AdminAction`, `Notification`.

### Models pending (Phase 3 will add 5)
`OnboardingState` (ADR 0004), `Swipe`, `Match`, `Household`, `HouseholdMember` (ADR 0005).

### Enums in production (17, post-Phase 1)
`Role`, `Gender`, `GenderPreference`, `FaithPractice`, `CleanlinessLevel`, `ScheduleType`, `ListingType`, `ListingStatus`, `InterestStatus`, `PrivacyMode`, `VerificationType`, `VerificationStatus`, `ReportReason`, `ReportStatus`, `ConversationType`, `MessageType`, `NotificationType`.

### Enums pending (Phase 3 will add 3)
`SwipeDirection`, `PhotoVisibility`, `IntroMediaType`.

### Migrations
- `20260423084723_init` — applied to Neon at end of Phase 1.
- `add_onboarding_state` — pending, applied at start of Phase 3.
- `add_swipe_match_household_and_privacy_controls` — pending, applied at start of Phase 3.

The two pending migrations may be combined into one named `add_phase3_models` for cleanliness, at the founder's discretion. Both are additive.

---

## 7. Phase 2 cleanup record (commit `cc303bf`)

Four discrete changes shipped in commit `cc303bf`:

1. **`.env.example`** — `sslmode=require` upgraded to `sslmode=verify-full` for production-grade SSL verification.
2. **`src/app/api/auth/callback/route.ts`** — OAuth state comparison upgraded from string equality to `crypto.timingSafeEqual`.
3. **`src/app/api/auth/resend/route.ts`** — explicit comment block added documenting that returning 200 even for already-confirmed users / non-existent emails is intentional.
4. **`docs/decisions/0003-resend-silent-success.md`** — new ADR formalizing the resend silent-success behavior.

---

## 8. Pending items (current state)

These must be closed before Phase 3 code work begins:

1. **`MASTER-REPORT.md` exists** — this very document. ✅ once committed.
2. **ADR 0004 has all 7 tightenings applied** (T1–T7).
3. **ADR 0005 exists** at `docs/decisions/0005-discovery-and-matching.md` with full content.
4. Push to `main` so the Reviewer can re-audit.

---

## 9. Future phases (roadmap)

- **Phase 3 — Onboarding wizard + discovery model schema** (next, architecture locked)
- **Phase 4 — Listings + photo upload (S3) + maps (Mapbox) + photo blur pipeline + intro media upload**
- **Phase 5 — Compatibility engine + swipe deck + mutual-match service + observability (`src/lib/log.ts`)**
- **Phase 6 — Messaging (Pusher) + trust & safety + verifications**
- **Phase 7 — Admin dashboard + analytics**
- **Phase 8 — Notifications (in-app, email, push)**
- **Phase 9 — Polish + launch readiness (Playwright, Lighthouse, accessibility, SEO, dark mode, Sentry)**
- **Phase 10+ — Post-launch growth** (group swipe activation, university partnerships, premium tiers, mobile apps)

---

## 10. How to use this document

- **Resuming work?** Start at §8 (Pending items). Resolve those first.
- **Onboarding a new collaborator?** Read §1, §2, §3.
- **Need to know "why is X this way"?** Check §5 (ADRs).
- **Need full context for a new AI session?** Paste this entire document.

This document is the source of truth for the project's architecture and current state. Update at the end of every phase.
