# ADR 0005 — Discovery, swipe-based matching, and pre-match privacy

- **Status:** Accepted
- **Date:** 2026-04-26
- **Deciders:** Saaqib (founder)
- **Supersedes:** Partially supersedes the discovery and messaging UX described in MASTER-REPORT.md and earlier planning. Does NOT supersede ADRs 0001, 0002, 0003, 0004.

## Context

The original product plan assumed a feed-based discovery surface: users would scroll a ranked list of compatible roommate candidates, view profiles, and "express interest" via a free-form messaging request. Compatibility was displayed as a numeric score on each card.

In a founder review of the canonical hard case (a young Muslim woman seeking a roommate who shares her faith, gender, and lifestyle), several gaps in the feed model surfaced:

1. **Feeds reward scrolling, not deciding.** Users get overwhelmed and disengage before contacting anyone.
2. **Open messaging invites unsolicited contact.** This is especially harmful for women and faith-observant users, whom the platform is built to serve.
3. **A numeric compatibility score on cards reads like a "hot or not" rating.** Wrong vibe for a values-first product.
4. **Same-gender housing as a soft preference is too weak** for users whose faith or comfort requires it.
5. **Profile depth is undifferentiated** — there is no incentive for users to invest in richer profiles.

This ADR reframes discovery around a **swipe-style, mutual-match model** with **multi-layered privacy controls** and **profile-completeness incentives**.

## Decisions (the 8 invariants of the discovery model)

### 1. Swipe-style discovery is the default post-onboarding surface

After onboarding, the primary discovery surface is a swipe deck of one profile at a time, with two actions: **Connect** (interested) or **Pass** (not interested). The user's onboarding intent (`'seeker' | 'lister' | 'both'`) determines the deck composition:

- `seeker` — sees other users who match the user's hard filters and rank well by compatibility score
- `lister` — sees applicants to their listings, ranked by compatibility with the lister and existing housemates
- `both` — sees a mixed deck

The compatibility engine produces a 0–100 score per pair as before. The score is **never displayed numerically** in the swipe UI. Instead, each card shows 2–3 "compatibility highlights" (e.g. "Both early risers", "Both halal-kitchen", "Both budgets ~$1500") drawn from the score breakdown.

The legacy listing-detail "express interest" flow remains for the listing-first path (a user finds a specific room and wants to apply). That path does not require a swipe; the lister-applicant relationship is its own conversation gate.

**Vocabulary:** the database and code use the technical terms `swipe`, `match`, `direction`. The UI uses **"Connect"**, **"Pass"**, **"Connection"** (never "match"). This is intentional framing — the product reads as serious roommate finding, not dating.

### 2. Mutual match required before messaging (in the swipe path)

A `Conversation` between two users in the swipe path is created **only** when both users have swiped right (`direction = 'CONNECT'`) on each other. This is a hard gate enforced at the messaging service layer, not a UX convention.

When user A swipes connect on user B:
- If B has not yet swiped on A → A's swipe is recorded; nothing more happens.
- If B has previously swiped pass on A → nothing happens (A's swipe is recorded but no notification, no match).
- If B has previously swiped connect on A → a `Match` row is created and a `Conversation` is opened with both users as participants. Both receive a notification.

Listings-based messaging (a listing applicant + the lister) continues to operate without a swipe — the existing `ListingInterest` model gates that path.

### 3. Female-only mode is a first-class hard filter

A new field on `User`: `femaleOnlyMode: Boolean @default(false)`. When `true`:

- The user's profile is **never** shown to any user whose `Profile.gender` is `MALE`.
- The user's swipe deck **never** includes any user whose `Profile.gender` is `MALE`.
- This is enforced as a hard filter in the discovery query. It is not a soft scoring penalty.
- This is **stronger** than the existing `genderPreference` field. `genderPreference` expresses what the user prefers; `femaleOnlyMode` enforces a categorical exclusion that is mutually applied.

Users can enable `femaleOnlyMode` only if their own `Profile.gender` is `FEMALE`. This is enforced at the service layer with an explicit error if violated.

A symmetric `maleOnlyMode` is **not** added at this time. The asymmetry reflects the safety asymmetry the toggle exists to address: women face significantly more harassment risk in housing search than men, and the platform's first job is to protect them. A `maleOnlyMode` would be cosmetic and may be added later if user research shows demand.

This invariant exists alongside the per-user photo visibility setting (invariant 4) and applies first: photos are never visible to men if `femaleOnlyMode = true`, regardless of the user's individual photo visibility setting.

### 4. Photo visibility is a per-user choice with a global precedence rule

A new field on `Profile`: `photoVisibility: PhotoVisibility @default(UNTIL_MATCH)`. The enum:

```prisma
enum PhotoVisibility {
  ALWAYS         // photo visible on swipe card to all eligible viewers
  UNTIL_MATCH    // photo blurred until mutual match, name + values still visible
  PRIVATE        // photo only visible to viewer after lister accepts interest (listings path)
}
```

The default is `UNTIL_MATCH`. Users can change it in profile settings.

**Precedence rule:** invariant 3 (`femaleOnlyMode`) is checked first. If the viewer is excluded by `femaleOnlyMode`, no profile data is shown — period. Photo visibility is only consulted for viewers who pass the `femaleOnlyMode` filter.

When a profile is displayed in the swipe deck:
- `ALWAYS` → photo shown clearly
- `UNTIL_MATCH` → photo shown blurred (server-rendered low-resolution blurred variant)
- `PRIVATE` → no photo shown; an initials avatar is shown

The user is informed in onboarding and settings that **richer profiles surface higher** in others' decks — this includes having a photo at all. There is no hard requirement, only a queue-ranking nudge.

### 5. Verification-gated filter

A new field on `User`: `requireVerifiedConnections: Boolean @default(false)`. When `true`:

- The user's swipe deck only includes users who have at least an `EMAIL` and `PHONE` verification record with status `APPROVED` (and, in Phase 6, an `ID_DOCUMENT` if available).
- Conversely, when `false`, the user sees verified and unverified profiles alike.

This is asymmetric: the user's own deck is filtered, but their own profile is shown to everyone (subject to other filters) regardless of their `requireVerifiedConnections` setting.

Verification badges (email ✅, phone ✅, ID ✅) are always displayed on profile cards regardless of this setting. The badges are signal; the filter is enforcement.

### 6. Voice/video intro is optional and rewarded

A new field on `Profile`: `introMediaUrl: String?` and `introMediaType: IntroMediaType?` (enum: `VOICE | VIDEO`). Both nullable.

- Recording an intro is **never required**.
- Profiles with an intro receive a **queue-ranking boost** in others' decks (the boost is implementation-tunable; initial value: equivalent to a +5 compatibility score for ranking purposes only — does not change the displayed compatibility highlights).
- Intro media is uploaded to S3 (Phase 4 wiring) and is gated by the same `photoVisibility` setting that gates the photo: if photos are hidden until match, the intro is hidden until match.
- Intro length is capped at **30 seconds** (UI-enforced via Web Audio / MediaRecorder).

This invariant defers actual implementation to Phase 4 (when S3 wiring lands). The Phase 3 onboarding wizard does NOT collect intros. The schema fields are added now so Phase 4 can populate them without a migration.

### 7. Daily swipe cap

A new field on `User`: `dailySwipeQuota: Int @default(100)`. The default may be tuned over time based on telemetry.

A swipe (a row written to the new `Swipe` table) counts against the daily quota. The quota resets at UTC midnight in the user's preferred city's timezone (resolved via the `Profile.city` field; default UTC if unresolvable).

When the quota is exhausted, the swipe deck displays a soft "You've used your daily connections" screen with a count of when the quota resets. The user can still:
- Open existing matches and message
- Browse listings
- Edit their profile

The cap exists to discourage swipe-spam, NOT to gate access. The threshold is intentionally generous (100 vs the 50 originally proposed) and may be removed entirely if telemetry shows it isn't needed. Users on a future premium tier may have a higher or no cap.

### 8. Group swipe (schema only, Phase 4+ feature)

A new table `Household` and join table `HouseholdMember` are added in Phase 3 schema for forward compatibility:

```prisma
model Household {
  id           String     @id @default(cuid())
  name         String?
  listingId    String?    // optional — household tied to a specific listing
  ...
}
model HouseholdMember {
  id           String    @id @default(cuid())
  householdId  String
  userId       String
  role         String   // "PRIMARY" | "MEMBER"
  joinedAt     DateTime  @default(now())
  ...
}
```

A `Swipe` may be made by a `Household` instead of a single `User`, with all members required to agree before the swipe is committed (group consensus). This is **schema only** in Phase 3; the actual group-swipe UX and consensus flow ships in Phase 4 or later.

This invariant exists to prevent a costly migration later. The cost of the unused tables in Phase 3 is negligible.

## Schema additions required for this ADR

```prisma
enum SwipeDirection {
  CONNECT
  PASS
}

enum PhotoVisibility {
  ALWAYS
  UNTIL_MATCH
  PRIVATE
}

enum IntroMediaType {
  VOICE
  VIDEO
}

model Swipe {
  id            String          @id @default(cuid())
  swiperUserId  String
  swiper        User            @relation("SwipesGiven", fields: [swiperUserId], references: [id], onDelete: Cascade)
  targetUserId  String
  target        User            @relation("SwipesReceived", fields: [targetUserId], references: [id], onDelete: Cascade)
  direction     SwipeDirection
  context       String?         // "discovery" | "listing:<listingId>" — provenance
  createdAt     DateTime        @default(now())

  @@unique([swiperUserId, targetUserId])
  @@index([targetUserId, direction])
  @@index([swiperUserId, createdAt])
}

model Match {
  id            String       @id @default(cuid())
  userAId       String
  userA         User         @relation("MatchA", fields: [userAId], references: [id], onDelete: Cascade)
  userBId       String
  userB         User         @relation("MatchB", fields: [userBId], references: [id], onDelete: Cascade)
  matchedAt     DateTime     @default(now())
  conversationId String?     @unique
  conversation  Conversation? @relation(fields: [conversationId], references: [id])
  active        Boolean      @default(true)

  @@unique([userAId, userBId])
  @@index([userAId, matchedAt])
  @@index([userBId, matchedAt])
}

model Household {
  id          String              @id @default(cuid())
  name        String?
  listingId   String?
  listing     Listing?            @relation(fields: [listingId], references: [id])
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  members     HouseholdMember[]

  @@index([listingId])
}

model HouseholdMember {
  id            String   @id @default(cuid())
  householdId   String
  household     Household @relation(fields: [householdId], references: [id], onDelete: Cascade)
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role          String   // "PRIMARY" | "MEMBER"
  joinedAt      DateTime @default(now())

  @@unique([householdId, userId])
  @@index([userId])
}
```

Plus these field additions:

- `User.femaleOnlyMode Boolean @default(false)`
- `User.requireVerifiedConnections Boolean @default(false)`
- `User.dailySwipeQuota Int @default(100)`
- `Profile.photoVisibility PhotoVisibility @default(UNTIL_MATCH)`
- `Profile.introMediaUrl String?`
- `Profile.introMediaType IntroMediaType?`

Plus relation back-references on `User`:
- `swipesGiven Swipe[] @relation("SwipesGiven")`
- `swipesReceived Swipe[] @relation("SwipesReceived")`
- `matchesAsA Match[] @relation("MatchA")`
- `matchesAsB Match[] @relation("MatchB")`
- `householdMemberships HouseholdMember[]`

Plus relation back-reference on `Listing`:
- `households Household[]`

Plus optional back-reference on `Conversation`:
- `match Match?`

These additions are all **additive** — no existing field is changed or removed. They will be applied in a single migration named `add_phase3_models` at the start of Phase 3 (alongside the `OnboardingState` model from ADR 0004).

## Cross-cutting consequences

### The compatibility engine (Phase 5) gates discovery, but does not display its score

The matching engine produces:
1. A 0–100 score per (userA, userB) pair, used to **rank the swipe deck**
2. A list of dimension-level breakdowns, used to render **compatibility highlights** on each card

The numeric score itself is never sent to the client. The breakdown is filtered to show 2–3 highlights — the strongest dimensional matches.

### Hard filters precede soft scoring

In order, before any compatibility scoring:
1. Block list (either direction) — excluded
2. `femaleOnlyMode` (gender exclusion) — excluded
3. `requireVerifiedConnections` (verification floor) — excluded
4. `Preferences` hard filters (age range, gender preference, faith match required, etc. — invariants from earlier ADRs) — excluded

Only then does the compatibility engine compute scores on the remaining set, rank, and serve the deck.

### Photo blur is enforced server-side

`photoVisibility = UNTIL_MATCH` does NOT mean "send the photo and let the browser blur it." The discovery API endpoint that returns swipe-deck profiles checks the relationship between viewer and target and either:
- Returns the original photo URL (when match exists or visibility is `ALWAYS`)
- Returns a server-rendered blurred photo URL (signed URL pointing to a low-resolution, server-blurred version stored in S3)
- Returns no photo URL at all (when `PRIVATE`)

This prevents trivial defeat by inspecting network requests.

The blurred photo is generated at upload time in Phase 4 and cached. Phase 3 schema supports the field; the upload + blur pipeline lands in Phase 4.

### Swipe cap is enforced server-side

The `Swipe.create` operation in the service layer first checks: did this user already make `dailySwipeQuota` swipes since UTC midnight (or local midnight, see invariant 7)? If so, reject with a typed error `SwipeQuotaExceeded`.

The deck endpoint also checks this and returns an empty deck with a `quotaResetsAt` timestamp instead of profiles.

### Listings path is unaffected by swipe gates

The `Conversation` between a listing applicant and a lister opens via the existing `ListingInterest` flow. No `Swipe` or `Match` is created. This path coexists with swipe-based discovery.

## Verification

Each invariant has a corresponding test. Phase 3+ phase reports must demonstrate:

| Invariant | Verification |
|---|---|
| 1 (swipe is default) | Onboarded user lands on a discovery surface that is swipe-style, not feed-style |
| 2 (mutual-match gate) | A user who swipes connect cannot message the target until the target reciprocates; verified by attempting to send a message and receiving a 403 |
| 3 (femaleOnlyMode) | A female user with `femaleOnlyMode=true` is provably absent from a male user's deck (SQL query: `SELECT * FROM "User" U JOIN "Profile" P ON P."userId"=U.id WHERE U."femaleOnlyMode"=true` — none of these users appear in any male user's deck endpoint response) |
| 4 (photoVisibility) | A user with `photoVisibility=UNTIL_MATCH` returns the blurred photo URL pre-match and the original post-match (verified by hitting the deck endpoint as user A, then matching, then re-fetching) |
| 5 (requireVerifiedConnections) | A user with `requireVerifiedConnections=true` sees only verified users in their deck (verified by SQL inspection of deck composition) |
| 6 (intro media nullable) | Schema accepts NULL for `introMediaUrl` and `introMediaType`; profiles without intros are valid |
| 7 (daily swipe cap) | After 100 swipes in 24h, the deck endpoint returns the quota-exhausted state; swipe attempts return `SwipeQuotaExceeded` |
| 8 (Household schema) | `prisma migrate` applies the migration cleanly; `prisma validate` passes |

## Revisiting this ADR

- **Tuning the daily quota** is editing a single default in the schema and rolling out a migration to backfill existing users. Not a supersede.
- **Adding `maleOnlyMode`** is a code change that mirrors `femaleOnlyMode`. Not a supersede.
- **Changing the swipe gate (e.g. allowing one-sided messages)** is a supersede that requires a new ADR explaining why the safety properties are not weakened.
- **Removing the photo blur** is a supersede; document the privacy tradeoff explicitly.
