# Phase 5 report — Compatibility engine, swipe deck, mutual-match service

**Date:** 2026-04-30
**Commit:** `81517a3`
**Role:** Claude Code (Builder seat); **author:** Saaqib Fagbenro (founder)
**Stack:** Next.js 16.2.4, PostgreSQL on Neon (us-west-2), Prisma 7 + `@prisma/adapter-pg`, AWS Cognito.

---

## 1. TL;DR

| Area | Status |
|------|--------|
| No new migrations — all models already in schema | Green |
| Compatibility scoring engine | Green |
| Discovery queue service | Green |
| Swipe service (quota + mutual-match + conversation creation) | Green |
| Server action (`swipeAction`) | Green |
| SwipeDeck client component | Green |
| ProfileCard component (photo visibility logic) | Green |
| MatchCard component | Green |
| `/discover` page | Green |
| `/matches` page | Green |
| Proxy updated (`/discover`, `/matches` protected) | Green |
| TypeScript (`tsc --noEmit`) | Green — 0 errors |
| Lint (`npm run lint`) | Green — 0 errors, 8 warnings (all pre-existing `<img>`) |
| Build (`npm run build`) | Green — exit 0, 29 routes compiled |

---

## 2. No migrations

All five models used in Phase 5 were already in the schema from earlier phases:

| Model | Added in |
|-------|---------|
| `Swipe` | Phase 3 (ADR 0005) |
| `Match` | Phase 3 (ADR 0005) |
| `CompatibilityScore` | Phase 1 (initial migration) |
| `Conversation` + `ConversationParticipant` | Phase 1 |
| `Notification` | Phase 1 |

Phase 5 is purely service + UI work.

---

## 3. Compatibility engine (`src/server/services/compatibility.ts`)

### Algorithm — Option B: hard filters + weighted ranking

The score is used **only to rank the swipe deck** — most compatible person appears first. It is not shown to users in Phase 5.

### Hard filters (`passesHardFilters`)

If any of these fail, the candidate is excluded from the deck regardless of score:

| Filter | Rule |
|--------|------|
| `femaleOnlyMode` | If either user has `femaleOnlyMode: true`, only other FEMALE users pass |
| Gender preference | `A.genderPreference` must accept `B.gender` and vice versa |
| `requireVerifiedConnections` | If set, the other user must have a `APPROVED` `VerificationRecord` |
| `faithMatchRequired` | If set by either user and both have stated a faith, the faiths must match |

### Score dimensions (max 100 pts)

| Dimension | Max pts | Method |
|-----------|---------|--------|
| Lifestyle — cleanliness | 8 | Numeric distance on 4-point scale |
| Lifestyle — schedule | 7 | Lookup table (EARLY_BIRD ↔ NIGHT_OWL = 0.1, FLEXIBLE = 0.7) |
| Lifestyle — smoking | 5 | Cross-check: each user's `smokingSelf` vs other's `smokingRoommate` |
| Lifestyle — pets | 5 | Cross-check: `pets` vs `petsRoommate` |
| Lifestyle — noise | 5 | String equality; partial credit for `moderate` |
| Faith alignment | 20 | 14 pts for same faith string, 6 pts for same `faithPractice` |
| Budget overlap | 15 | Jaccard-like: overlap / union of [budgetMin, budgetMax] ranges |
| Age range overlap | 10 | Mutual: B's age in A's [ageMin, ageMax] AND A's age in B's range |
| Move-in date proximity | 10 | Date windows (± flexibilityDays) must intersect |
| City match | 5 | `preferredCities` intersection (case-insensitive) |

Total max: **100 pts**

### Caching

`upsertCompatibilityScore(a, b)` writes the result to `CompatibilityScore` using an `inputsHash` derived from both users' `updatedAt` timestamps. The canonical user order (`userAId` < `userBId` lexicographically) ensures the `@@unique([userAId, userBId])` constraint is always satisfied.

In Phase 5, scores are computed on demand in the discovery loop (not batch pre-computed). Pre-computation can be added as a background job post-launch.

---

## 4. Discovery service (`src/server/services/discovery.ts`)

### `getDiscoveryQueue(viewerId, limit = 20)`

1. Loads viewer's `User` + `Profile` + `Preferences` + approved verifications
2. Fetches all already-swiped user IDs + block relationships (both directions) in parallel
3. Queries up to 300 candidate users who have both `profile` and `preferences`, are `lookingStatus: true`, and are not in the exclude set
4. Scores each candidate with `scoreUsers(viewer, candidate)`
5. Filters to `passesHardFilters: true`, sorts by `score DESC`, returns top `limit`

The `passesHardFilters` field is stripped from the returned `DiscoveryProfile` type — it is an internal filter flag, not exposed to the UI.

### `getMyMatches(userId)`

Queries all active `Match` rows where the user is `userAId` or `userBId`. Returns the other user's profile data + `conversationId` for linking to messaging.

### `getDailySwipesRemaining(userId, quota)`

Counts swipes since UTC midnight, returns `max(0, quota - used)`.

---

## 5. Swipe service (`src/server/services/swipe.ts`)

### `recordSwipe(swiperId, targetId, direction)`

Sequence:
1. **Self-swipe guard** — throws `SwipeError('SELF_SWIPE')` if IDs match
2. **Quota check** — counts swipes since UTC midnight; throws `SwipeError('QUOTA_EXCEEDED')` if `>= dailySwipeQuota`
3. **Upsert swipe** — idempotent via `@@unique([swiperUserId, targetUserId])`; allows PASS → CONNECT correction
4. **Early exit** — if direction is PASS, returns `{ matched: false }`
5. **Mutual check** — looks up reverse swipe; if it's not CONNECT, returns `{ matched: false }`
6. **Existing match guard** — checks `@@unique([userAId, userBId])` (canonical order); returns early if already matched
7. **Atomic match creation** — single `$transaction`:
   - Creates `Conversation` (type `DIRECT`) with two `ConversationParticipant` rows
   - Creates `Match` with `conversationId`
   - Creates two `Notification` rows (type `MATCH_SUGGESTION`) for both users

Returns `{ matched: boolean, matchId?: string, conversationId?: string }`.

---

## 6. Server action (`src/features/discovery/lib/actions.ts`)

`swipeAction(targetId, direction)` — called from the `SwipeDeck` client component inside `useTransition`. Returns a discriminated union:

```ts
type SwipeActionResult =
  | { ok: true; matched: boolean; matchId?: string; conversationId?: string }
  | { ok: false; error: string; code?: string };
```

The `code` field allows the deck to distinguish quota-exceeded from other errors and disable the swipe buttons accordingly.

---

## 7. Components (`src/features/discovery/components/`)

### `ProfileCard`

- Photo display respects `photoVisibility`:
  - `ALWAYS` → full `photoUrl`
  - `UNTIL_MATCH` and no match → `photoUrlBlurred` (with an additional CSS `blur(12px)` + `scale(1.05)` for safety)
  - `PRIVATE` → no photo, overlay message
- Shows: first name, age, city, occupation, faith label, intro media indicator, bio (3-line clamp)
- No last name, no exact DOB, no compatibility score shown

### `SwipeDeck` (client component)

- Receives `initialProfiles` and `swipesRemaining` from the server
- Card stack: top card is interactive; two shadow cards behind it at `translate-y-2/4` and `scale-[0.96/0.92]` give depth
- Connect (♥) and Pass (✕) buttons + arrow key shortcuts (← →)
- On swipe: calls `swipeAction` in `useTransition`; removes top card from local state
- On match: shows "It's a match!" overlay with "Say hello" link to conversation and "Keep swiping" option
- Quota exhausted state and empty queue state handled separately

### `MatchCard`

- Displays matched user's photo, first name, city, matched date (formatted with `Intl.DateTimeFormat`, not `Date.now()` — avoids the Next.js impure-function lint rule)
- Wraps in `<Link>` to `/messages/:conversationId` when a conversation exists

---

## 8. Pages

### `/discover`

- Requires completed onboarding (`hl_onboarded` cookie, enforced by proxy)
- If `preferences` row is missing, shows a prompt to complete onboarding
- Loads `getDiscoveryQueue` and `getDailySwipesRemaining` in parallel
- Renders `SwipeDeck` (client component)

### `/matches`

- Lists all active matches via `getMyMatches`
- Empty state with CTA to `/discover`

Both routes added to `PROTECTED_PREFIXES` in `src/proxy.ts`.

---

## 9. ADR 0005 invariant compliance

| Invariant | Status |
|-----------|--------|
| 1. Swipe is the default discovery mode | ✅ `/discover` is the primary page |
| 2. Mutual-match required for messaging | ✅ Conversation only created when both swipe CONNECT |
| 3. `femaleOnlyMode` hard filter | ✅ Enforced in `scoreUsers` before scoring; FEMALE-only users never appear in non-female decks |
| 4. Per-user photo visibility | ✅ `ProfileCard` respects `ALWAYS` / `UNTIL_MATCH` / `PRIVATE` |
| 5. Verification-gated filter | ✅ `requireVerifiedConnections` checked as hard filter; uses `APPROVED` status |
| 6. Optional intro with queue boost | ⚠️ Intro media upload exists (Phase 4); queue boost not yet wired (profiles with intros are not ranked higher) |
| 7. Daily swipe cap | ✅ Quota checked server-side before every swipe |
| 8. Household schema for future group swipe | ✅ Schema in place; group swipe UI deferred to Phase 10+ |

**One open gap:** ADR 0005 invariant 6 states that profiles with intro media get a queue boost in discovery. The `introMediaUrl` field is populated (Phase 4), but the discovery ranking does not yet add a bonus for it. Fix in Phase 6 or as a standalone patch.

---

## 10. What Phase 5 does NOT include

- Real-time match notification (Pusher — Phase 6)
- Messaging UI (Phase 6)
- Batch pre-computation of compatibility scores (on-demand for now; sufficient for MVP scale)
- Drag/fling gesture swipe — buttons and keyboard only
- Intro media queue boost (gap noted in §9)
- Admin ability to adjust per-user daily quota (schema supports it; UI deferred)

---

## 11. Gates

| Gate | Command | Result |
|------|---------|--------|
| TypeScript | `npx tsc --noEmit` | 0 errors |
| Lint | `npm run lint` | 0 errors, 8 warnings (all pre-existing `<img>` warnings) |
| Build | `npm run build` | Exit 0, 29 routes compiled |

---

## 12. Honesty

- `VerificationStatus.VERIFIED` does not exist in the generated Prisma client — the correct value is `APPROVED`. A type error caught this before commit.
- The intro media queue boost (ADR 0005 invariant 6) is not implemented. It is documented as an open gap rather than silently omitted.
- Compatibility weights are hardcoded and undocumented in the codebase beyond inline comments. They should be tuned once real swipe data is available.
- `package-lock.json` is not inlined (machine-generated); see git.
