# ADR 0004 — Onboarding Wizard Invariants

- **Status:** Accepted
- **Date:** 2026-04-26
- **Deciders:** Saaqib (founder)
- **Supersedes:** N/A — establishes the onboarding architecture for Phase 3
  and forward.

## Context

Phase 3 builds the onboarding wizard: a 6-step form that collects everything
the compatibility engine needs (housing, lifestyle, values, profile basics) and
populates the existing `Profile` and `Preferences` tables. The wizard is the
single most product-critical screen in the app — every downstream feature
(matching, listings, messaging) depends on the data it produces.

Six architecture decisions were flagged for explicit sign-off before any code
was written. The founder weighed in on each (with a prompt-side reviewer pass
on Q2). This ADR codifies the resulting invariants in one document so a future
engineer (or a future me) can find them all at once.

The invariants below are **load-bearing**. Each was chosen with explicit
trade-offs over plausible alternatives. Don't relax any of them without
re-reading this ADR end to end and updating it.

## Decisions (the 8 invariants)

### 1. Admin/Moderator/Support roles are preserved through onboarding

The wizard's "intent" question writes to two places:

- `OnboardingState.intent: String?` — the UX label (`"seeker" | "lister" | "both"`),
  used for resume pre-fill and analytics.
- `User.roles: Role[]` — the canonical permission source the rest of the
  system reads.

The mapping is fixed:

```typescript
function intentToRoles(intent: 'seeker' | 'lister' | 'both'): Role[] {
  switch (intent) {
    case 'seeker': return ['SEEKER'];
    case 'lister': return ['LISTER'];
    case 'both':   return ['SEEKER', 'LISTER'];
  }
}
```

When the step-1 server action writes `User.roles`, it MUST preserve any
admin-tier role the user already holds. The implementation is:

```typescript
const adminRoles = existingUser.roles.filter(
  (r) => r === 'MODERATOR' || r === 'ADMIN' || r === 'SUPPORT',
);
const intentRoles = intentToRoles(input.intent);
// Order matters for stability — admin roles first, then intent roles. Set preserves insertion order.
const newRoles = Array.from(new Set([...adminRoles, ...intentRoles]));
```

**Invariant:** `MODERATOR`, `ADMIN`, and `SUPPORT` roles, once granted, are
never removed by onboarding — even if the user re-runs step 1 with a
different intent. Onboarding owns `SEEKER` and `LISTER`. It does not own the
admin tier.

**Why dual-write at all** (rather than deriving the label from `User.roles`):
the roles array may legitimately contain non-onboarding entries (a moderator
who's also a seeker), so re-deriving "what intent did they pick?" from the
array requires assumptions about which roles are "intent roles." Storing the
label separately removes that fragility.

Onboarding intent changes are additive, never subtractive. If a user later changes their step-1 intent (e.g. from 'seeker' to 'both'), the new intent's roles are unioned into the existing role set; previously-granted SEEKER/LISTER roles are not removed. A user who needs to remove SEEKER or LISTER requires an explicit user-initiated flow (e.g. 'leave seeker mode' or 'close all listings'), which is out of scope for Phase 3.

### 2. Partial onboarding state lives in `OnboardingState.draftData`; `Preferences` rows only exist for users with complete prefs

Steps 3, 4, and 5 of the wizard collectively populate the `Preferences` row.
But the schema requires `budgetMin`, `budgetMax`, `moveInDate`, `cleanliness`,
`schedule`, and `preferredCities` — fields that span multiple steps. Three
options were considered:

- (a) Make those fields nullable. **Rejected** — every read-site forever has
  to handle nulls for fields that are conceptually required for a complete
  profile.
- (c) Insert a `Preferences` row at step 3 with placeholder defaults
  (`cleanliness=AVERAGE`, `schedule=FLEXIBLE`); overwrite at step 4.
  **Rejected** by the founder after the prompt-side review pass, on the
  grounds that placeholder defaults pollute downstream reads if anyone
  forgets to gate on `completedAt`.
- (b) Stash partial data in `OnboardingState.draftData: Json` until enough is
  collected to construct a complete `Preferences` row, then promote in one
  transaction. **Selected.**

**Invariant:** A `Preferences` row exists if and only if the user has
collected enough data to populate every required column. While onboarding is
in flight for steps 3–5, the partial data lives in
`OnboardingState.draftData` (a JSON object), not `Preferences`.

**Promotion rule.** At every step-3, step-4, and step-5 server action, after
merging the new step's data into `draftData`:

1. Check `isDraftPromotable(draft)` (see `src/lib/onboarding/draft-schema.ts`).
2. If true, run a `prisma.$transaction` that:
   - `prisma.preferences.upsert({ where: { userId }, create: full row, update: full row })`
   - `prisma.onboardingState.update({ where: { userId }, data: { draftData: {} } })`
3. If false, the draft stays in `OnboardingState.draftData` until the next step.

`isDraftPromotable` returns `true` when all of the following are present in
the draft: `budgetMin`, `budgetMax`, `moveInDate`, `cleanliness`, `schedule`,
and `preferredCities` (length ≥ 1). Optional `Preferences` fields (faith,
dietary practice, dealbreakers, etc.) ride into the row from whatever the
draft contains at the moment of promotion; absent fields take the
schema-level defaults.

**Reads.** The form pre-fill on resume goes through a single helper,
`getOnboardingFormData(userId)`, which returns a unified shape regardless of
whether the data lives in `Preferences` or `draftData`. The merge precedence
is `Preferences` over `draftData` (i.e. once a row is promoted, it wins).
**No UI code branches on storage location.** This is the cardinal rule of
this invariant — the storage split is invisible above the service layer.

**Idempotency.** Writing the same step twice is safe at every layer:
- `draftData` writes are key-overwrite JSON merges.
- The promotion uses `upsert`.
After Preferences is promoted, subsequent step-3/4/5 writes still flow through the promotion logic, not directly into Preferences. Each post-promotion write merges the new field into draftData, runs the promotion transaction (which becomes an update of the existing row rather than a create), and clears draftData. The draft is always transient — it never holds long-term state once Preferences exists. The same code path handles first-time promotion, post-promotion edits, and resume-after-drop. There is no separate 'edit existing prefs' code path.

### 3. Wizard versioning policy

`OnboardingState.version: Int @default(1)` is the wizard's structural
version. It's bumped (in the file `src/lib/onboarding/version.ts`) whenever
the wizard's step structure changes:

- Steps added, removed, or reordered.
- The semantic meaning of a `currentStep` value changes (e.g. step 3 used to
  be "Housing" but now means "Verification").
- The shape of `draftData` changes incompatibly.

**Invariant:** All new `OnboardingState` rows write
`version: CURRENT_ONBOARDING_VERSION`. No code path uses a hard-coded `1`.

When the version is bumped, existing rows from earlier versions must be
migrated explicitly via a one-shot migration script. The migration must
re-interpret `currentStep`, `completedSteps`, and `draftData` under the new
schema. There is no auto-migration based on `version` field comparison.

This invariant costs us one extra column (4 bytes/row, negligible). It buys
us the ability to evolve the wizard without breaking users who are
mid-flow.

### 4. Vocabulary is enforced at the application layer; future migration to Postgres enums deferred

Several `Preferences` columns are typed `String` with no DB-level enum
constraint:

- `drinkingSelf`, `drinkingRoommate`, `petsRoommate`, `guests`,
  `noiseTolerance`, `cookingFrequency`, `dietaryPractice`.

These cannot be enforced by Postgres today (the schema is `String`).
Application-level enforcement lives in `src/lib/onboarding/vocabulary.ts`,
which exports two things per field:

1. A `const` array of `{ value, label }` objects (UI imports the labels for
   dropdowns).
2. A Zod enum derived from the array (server validators import this).

**Invariant:** Both UI and server use the SAME constants. There are no other
sources of truth for these values anywhere in the codebase. Adding a new
value requires editing `vocabulary.ts` and is the only legitimate way to
introduce one.

**Locked vocabularies** (final, after prompt-side review):

| Field              | Values                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| `drinkingSelf`     | `never`, `rarely`, `socially`, `regularly`                                                          |
| `drinkingRoommate` | `none`, `rarely`, `socially`, `any` (symmetric — no `_ok` suffix)                                   |
| `petsRoommate`     | `none`, `cats_ok`, `dogs_ok`, `small_only`, `any`                                                   |
| `guests`           | `rarely`, `sometimes`, `often`                                                                      |
| `noiseTolerance`   | `quiet`, `moderate`, `lively`                                                                       |
| `cookingFrequency` | `rarely`, `sometimes`, `often`, `daily`                                                             |
| `dietaryPractice`  | `none`, `vegetarian`, `vegan`, `pescatarian`, `halal_personal`, `halal_kitchen`, `kosher_personal`, `kosher_kitchen`, `other` |

**Migration to native Postgres enums** is explicitly deferred to Phase 5 or
later. Once the vocabulary has stabilized in production we may convert these
columns to enum types via `ALTER TYPE` migrations. Doing it now would lock
in values we haven't validated with users.

Not locked. Profile.languages is open-ended free-text. Users enter language names via a typeahead chip input. We do not constrain values. Downstream features that need to compare languages (matching, search) do case-insensitive normalization ('English' === 'english') but not enum membership. This is intentional — there are too many languages globally to enumerate, and our user base will discover edge cases (e.g. dialects, sign languages) we shouldn't pre-judge.

### 5. Photo upload deferred to Phase 4

Phase 3 step 6 does not collect a profile photo. The step renders a
non-input placeholder card with verbatim copy:

> "You can finish onboarding without a photo. Add one anytime from
> Settings → Profile."

`Profile.photoUrl` remains `null` for all Phase 3 users. Every photo-display
site (dashboard avatar, profile card, listing avatar) must render an
**initials avatar fallback** when `photoUrl` is null. Phase 3 wires this
fallback through the dashboard avatar component so that Phase 4's S3 upload
work is purely "populate `photoUrl` and the UI lights up automatically."

**Invariant:** No code path in Phase 3 writes to `Profile.photoUrl`. No code
path crashes when `photoUrl` is null. The fallback is a single component
shared by every avatar render site.

Rationale: every option that accepted a Phase-3 photo URL would need
validation, mixed-content handling, hotlink rules, and would generate data
we'd just have to migrate or invalidate in Phase 4 when the real upload
flow lands. The cost of the deferral is one Phase-3 user trade-off (initials
instead of photo on the dashboard); the cost of the alternative is real bug
surface and user-visible churn during the Phase 4 transition.

Implementation requirement. Because the placeholder copy points to 'Settings → Profile,' that route must exist as at least a placeholder page in Phase 3. Acceptable placeholder content: 'Profile editing is coming in a future update. For now, your onboarding answers are your profile.' A 404 on a route the onboarding flow explicitly mentions would erode user trust on day one. Phase 3 ships this placeholder; Phase 4+ replaces it with the real settings page.

### 6. Dealbreakers are a typed Zod discriminated union

`Preferences.dealbreakers` is declared as `Json @default("[]")` in the
schema. The Phase 3 wizard step 5 writes a typed shape into it:

```typescript
const dealbreakerSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('no_smoking') }),
  z.object({ kind: z.literal('no_pets') }),
  z.object({ kind: z.literal('gender'), value: z.enum(['male_only', 'female_only']) }),
  z.object({ kind: z.literal('faith_match') }),
  z.object({ kind: z.literal('no_drinking') }),
  z.object({ kind: z.literal('budget_max'), value: z.number().positive() }),
]);
```

The array is capped at 10 entries (`dealbreakersSchema = z.array(dealbreakerSchema).max(10)`).

**Invariant:** All writes to `dealbreakers` must validate through
`dealbreakersSchema`. All reads (Phase 5 matching engine, profile display,
admin tooling) must import and parse via the same schema. Adding a new
dealbreaker `kind` is a single edit to the union — and forces every reader
to handle it (TypeScript exhaustiveness).

This is the only typed contract we have over a `Json` column today. The contract is enforced in code, not in the database. If we ever discover a row with a non-conforming shape (legacy data, manual SQL edit, schema drift), the matching engine and any reader must drop the malformed entry and log it via the project's logging utility (TODO: wired up alongside Phase 5 observability — see src/lib/log.ts). The reader must not crash. Future improvement (Phase 5+): surface malformed-data detections to admin tooling so support can investigate, rather than relying on log review.

Reads must also handle the case where the dealbreakers field is entirely null, missing from the JSON, or an empty array — these are all equivalent and mean 'no dealbreakers'. They are not error states.

### 7. DOB is stored as UTC midnight; age computation is canonical

`Profile.dateOfBirth: DateTime` is required. Users enter a date via an HTML
`<input type="date">` which yields a `YYYY-MM-DD` string with no timezone
component.

**Invariant:** The DOB string is converted to a `Date` representing **UTC
midnight on the user's entered calendar date** before storage. The conversion
helper `dobToStoredDate` lives in `src/lib/dates.ts` and is the only place
DOB strings get parsed. The time component of the stored value is never
read; only the date.

**Age** is computed by `ageFromDob(dob, now = new Date())` from the same
file, using the average year length 365.2425 days. This deliberately avoids
calendar-arithmetic gotchas (leap years, DST) at the cost of being correct
to within ~6 hours of the true birthday — fine for our use cases (≥18 gate,
matching age band).

No other DOB math is permitted anywhere. If a feature needs age, it imports
`ageFromDob`. If a feature needs the birth calendar date, it reads the
stored `DateTime` directly (the UTC midnight representation makes the
calendar date stable).

### 8. Identity verifications are post-onboarding only

The `VerificationRecord` model exists in the schema (Phase 6 owns its
implementation). No verification flow may be entered until the user's
`OnboardingState.completedAt IS NOT NULL`.

**Invariant:** All Phase-6 verification entry points (route handlers, server
actions, UI links) MUST gate on `completedAt`. Users mid-onboarding cannot
start a verification.

This is a forward-looking ADR entry — there is no Phase-3 code change to
make today. It exists here because the data model already permits the
collision (a user could in principle have a `VerificationRecord` row with no
`OnboardingState`), and locking the invariant now is cheaper than fixing it
later.

## Cross-cutting consequences

### The matching engine (Phase 5) gates on `OnboardingState.completedAt`

Together, invariants 1, 2, 4, 6, and 7 imply a hard rule for Phase 5:
**the matching engine must consider only users with
`OnboardingState.completedAt IS NOT NULL`.** Reasoning:

- Invariant 2: `Preferences` may not exist yet for in-progress users.
  Reading `Preferences` for them returns nothing; matching cannot proceed.
- Invariant 4: vocabulary values are application-enforced. A pre-onboarding
  row could in principle have unknown strings (it can't today, but the rule
  guards against drift).
- Invariant 6: dealbreaker shapes are typed. Pre-promotion drafts contain
  unvalidated arrays.
- Invariant 7: age computation needs a stored DOB. Pre-step-2 users have no
  Profile row.

### The proxy gates feature routes on `hl_onboarded`

A separate cookie `hl_onboarded=1` is set when `completedAt` becomes
non-null, and cleared on logout. The Edge proxy reads this cookie (Edge
can't reach Prisma) to redirect un-onboarded authed users to `/onboarding`.
This is described in detail in the Phase 3 mega-prompt; the invariant here
is that the cookie's truth value mirrors `completedAt`.

### Service layer is the ONLY mutator of onboarding state

All writes to `User.roles`, `Profile`, `Preferences`, and `OnboardingState`
during Phase 3 happen through `src/server/services/onboarding.ts`. No route
handler, no Server Component, no client form bypasses it. This is the
boundary at which invariants 1–8 are enforced.

### Resume UX is invariant-blind

Because `getOnboardingFormData(userId)` merges `Preferences` and `draftData`
behind a single shape, every step form takes the same `initialValues` prop
regardless of whether it's a first-time fill, a mid-flow resume, or an
edit-from-settings. This shields the UI from the persistence model.

## Verification

Each invariant has a corresponding test or check. The verification block in
the Task 7 end-to-end report must demonstrate each:

| Invariant | Verification |
| --------- | ------------ |
| 1 (admin roles preserved) | V4 — manually grant a test user `MODERATOR` via direct DB write, run them through onboarding picking `seeker`, assert `roles` array still contains `MODERATOR` after step 1 save. |
| 2 (draftData → Preferences promotion) | V6 — SQL inspection at three points: after step 3 (Preferences absent, draftData populated), after step 4 (Preferences present, draftData empty), after step 5 (Preferences updated, draftData empty). |
| 3 (`CURRENT_ONBOARDING_VERSION`) | Code review checklist — any code touching OnboardingState.version references CURRENT_ONBOARDING_VERSION from src/lib/onboarding/version.ts. Verified at code review time. |
| 4 (vocabulary lock) | Type check — Zod parsing rejects unknown values in V4 negative cases. UI dropdown values come from the same module. |
| 5 (photo deferred) | Static check — `rg "photoUrl" src/features/onboarding` should return zero non-comment matches. Dashboard renders initials when `photoUrl` is null (visual check in V1). |
| 6 (typed dealbreakers) | V4 — Zod refinement rejects malformed dealbreaker shapes; matching engine import in Phase 5 will use the same module. |
| 7 (DOB as UTC midnight) | Unit-level check — submitting `2000-01-01` from a non-UTC client and reading back the stored `dateOfBirth` returns ISO `2000-01-01T00:00:00.000Z`. |
| 8 (verifications post-onboarding) | Phase-6 deliverable — no Phase-3 code change. ADR entry only. |

## Revisiting this ADR

This ADR is the contract for Phase 3 onboarding. Don't supersede it
casually. Specifically:

- **Adding a vocabulary value** is editing the table in §4 and shipping a
  migration plan if it's a backfill. Not a supersede.
- **Bumping `CURRENT_ONBOARDING_VERSION`** writes a follow-up ADR (0005+)
  describing the structural change and the migration script for existing
  rows. This ADR remains valid for v1.
- **Promoting a `dealbreaker` `kind`** is a code edit; the ADR's union list
  is illustrative — the canonical list is the Zod schema in code.
- **Changing the option-(b) draft model** (e.g. moving partial state to
  Redis, splitting the draft per-step) is a supersede that requires a new
  ADR and a data migration plan for in-flight users.
