# Phase 4 report — Listings CRUD, photo/media upload (S3), Mapbox map, blur pipeline

**Date:** 2026-04-30
**Commit:** `49c77c0`
**Role:** Claude Code (Builder seat); **author:** Saaqib Fagbenro (founder)
**Stack (masked):** Next.js 16.2.4, PostgreSQL on Neon (us-west-2), Prisma 7 + `@prisma/adapter-pg`, AWS Cognito, AWS S3 (`harmony-living-media`, us-west-2), Mapbox GL JS.

---

## 1. TL;DR

| Area | Status |
|------|--------|
| Schema migration (`photoUrlBlurred` on Profile) | Green |
| S3 client + upload pipeline (profile photo, listing image, intro media) | Green |
| Upload API routes (`/api/upload/*`) | Green |
| Listing service (create/update/publish/delete/read) | Green |
| Listing server actions + Zod validation | Green |
| Listing pages (browse, detail, new, edit, my) | Green |
| Mapbox GL JS map with rent-price pins | Green |
| Profile/settings photo upload + intro media upload UI | Green |
| TypeScript (`tsc --noEmit`) | Green — 0 errors |
| Lint (`npm run lint`) | Green — 0 errors, 6 warnings (all `<img>` + 1 intentional useEffect dep) |
| Build (`npm run build`) | Green — exit 0, 27 routes compiled |

---

## 2. Schema migration

**Migration:** `20260430060533_add_phase4_fields`

```sql
ALTER TABLE "Profile" ADD COLUMN "photoUrlBlurred" TEXT;
```

One additive column. The blurred photo URL is populated server-side at upload time; `NULL` until the user uploads a profile photo.

---

## 3. Infrastructure provisioned

| Resource | Details |
|----------|---------|
| S3 bucket | `harmony-living-media`, us-west-2, AES256 SSE, public access fully blocked |
| IAM user | `harmony-living-s3` — scoped `s3:PutObject` / `s3:DeleteObject` on `harmony-living-media/*` only |
| Mapbox token | Public token (`pk.eyJ1…`) committed to `.env` as `NEXT_PUBLIC_MAPBOX_TOKEN` |

S3 URLs are constructed server-side as `https://<bucket>.s3.<region>.amazonaws.com/<key>`. No presigned URLs are issued to the browser — all uploads flow through Next.js API routes.

---

## 4. Upload pipeline (`src/lib/s3/`)

### `src/lib/s3/client.ts`
Thin wrapper that constructs the `S3Client` from `env.AWS_*` vars. Exported as `s3` singleton + `S3_BUCKET` constant.

### `src/lib/s3/upload.ts`

Three exported functions:

| Function | Input | Processing | S3 keys |
|----------|-------|-----------|---------|
| `uploadProfilePhoto(userId, buffer, mimeType)` | JPEG / PNG / WebP ≤ 10 MB | sharp resize to 1200px, JPEG q85; + blur variant 400px / blur(20) / q60 | `profiles/{userId}/photo-{ts}.jpg` + `photo-{ts}-blurred.jpg` |
| `uploadListingImage(listingId, buffer, mimeType, orderIdx)` | JPEG / PNG / WebP ≤ 10 MB | sharp resize to 1600×1200, JPEG q85 | `listings/{listingId}/image-{orderIdx}-{ts}.jpg` |
| `uploadIntroMedia(userId, buffer, mimeType)` | audio (mp3/m4a/webm/ogg) or video (mp4/webm) ≤ 10 MB | raw passthrough | `profiles/{userId}/intro-{ts}.{ext}` |

All uploads use `ServerSideEncryption: 'AES256'`. `UploadError` is thrown with typed codes (`TOO_LARGE`, `INVALID_TYPE`, `UPLOAD_FAILED`) for structured client responses.

---

## 5. Upload API routes (`src/app/api/upload/`)

All routes are POST, require `requireUser()`, read `FormData`, and return JSON.

### `/api/upload/profile-photo`
1. Reads `file` from FormData
2. Calls `uploadProfilePhoto(userId, buffer, mimeType)`
3. Updates `Profile.photoUrl` and `Profile.photoUrlBlurred` in a single `prisma.profile.upsert`
4. Returns `{ photoUrl, photoUrlBlurred }`

### `/api/upload/listing-image`
1. Reads `file`, `listingId`, `orderIdx` from FormData
2. Verifies `Listing.ownerId === userId` (ownership check)
3. Calls `uploadListingImage(listingId, buffer, mimeType, orderIdx)`
4. Creates `ListingImage` row with `url`, `orderIdx`, `listingId`
5. Returns `{ url }`

### `/api/upload/intro-media`
1. Reads `file` from FormData
2. Calls `uploadIntroMedia(userId, buffer, mimeType)`
3. Updates `Profile.introMediaUrl` and `Profile.introMediaType`
4. Returns `{ url, mediaType }`

---

## 6. Listing service (`src/server/services/listings.ts`)

### Privacy offset
Exact coordinates (`latitude`, `longitude`) are stored but never exposed publicly. `approxLatitude` / `approxLongitude` are computed server-side with a fixed ±0.3 km offset (`1/111` deg per km) before storage. The map always renders approximate coordinates.

### Functions

| Function | Behaviour |
|----------|-----------|
| `createListing(ownerId, input)` | Creates with `status: 'DRAFT'`; computes and stores approx coords |
| `updateListing(listingId, ownerId, input)` | Verifies ownership; partial update; recomputes approx coords if lat/lng changed |
| `publishListing(listingId, ownerId)` | Sets `status: 'ACTIVE'`; verifies ownership |
| `deleteListing(listingId, ownerId)` | Soft delete: sets `deletedAt = now()` + `status: 'ARCHIVED'`; verifies ownership |
| `getActiveListing(id)` | Filters `status='ACTIVE'` and `deletedAt IS NULL` |
| `getMyListings(ownerId)` | All non-deleted listings for owner, desc by `createdAt`, includes first image |
| `getActiveListings(opts)` | Paginated active listings, optional city filter |

`ListingType` enum values: `PRIVATE_ROOM`, `SHARED_ROOM`, `WHOLE_UNIT`.

### Server actions (`src/features/listings/lib/actions.ts`)

All actions call `requireUser()` → look up `User.id` from `cognitoSub` → call the service layer. Zod schema mirrors the service input type. `updateListingAction` uses `.partial()` so partial edits are valid.

---

## 7. Listing pages

| Route | File | Notes |
|-------|------|-------|
| `/listings` | `app/(authed)/listings/page.tsx` | Card grid (left) + Mapbox map (right, sticky). Role-gated "New listing" button for `LISTER`/`ADMIN` |
| `/listings/[id]` | `app/(authed)/listings/[id]/page.tsx` | Detail view with photo grid, metadata, mini-map. Owner sees Edit button |
| `/listings/new` | `app/(authed)/listings/new/page.tsx` | Role-gated to `LISTER`/`ADMIN`; redirects others |
| `/listings/[id]/edit` | `app/(authed)/listings/[id]/edit/page.tsx` | Photo management + full `ListingForm`; ownership-verified |
| `/listings/my` | `app/(authed)/listings/my/page.tsx` | Owner's listings including DRAFT/ARCHIVED |

---

## 8. Components

### `ListingForm` (`src/features/listings/components/listing-form.tsx`)
react-hook-form + Zod resolver. All fields for a listing (type, title, description, address, coords, rent, deposit, lease, bedrooms, bathrooms, utilities, furnished, smoking, pets, gender pref, amenities). Calls `createListingAction` or `updateListingAction` inside `useTransition`.

### `ListingCard` (`src/features/listings/components/listing-card.tsx`)
Cover image, title, city/neighbourhood, rent, bed/bath, available date, status badge. Used on browse and my-listings pages.

### `ListingMap` (`src/features/listings/components/listing-map.tsx`)
Client component (`'use client'`). Mapbox GL JS with custom rent-price pill markers (dark pill, white text showing `$X,XXX`). `fitBounds` on all pins on initial load. Token read from `process.env.NEXT_PUBLIC_MAPBOX_TOKEN`.

### `PhotoUpload` (`src/features/listings/components/photo-upload.tsx`)
Generic client-side upload component. Accepts `endpoint`, `label`, `currentUrl`, `extraFields`. Sends `FormData` via `fetch`, shows preview from response `photoUrl` or `url` field. Used for profile photo, listing images, and intro media.

---

## 9. Settings page update

`src/app/(authed)/settings/profile/page.tsx` updated to render:
- Profile photo upload (`PhotoUpload` → `/api/upload/profile-photo`)
- Intro media upload (`PhotoUpload` → `/api/upload/intro-media`)

---

## 10. Env changes

Four vars upgraded from optional to required (validated at startup via `src/instrumentation.ts`):

```
AWS_S3_BUCKET        # harmony-living-media
AWS_ACCESS_KEY_ID    # IAM key for harmony-living-s3 user
AWS_SECRET_ACCESS_KEY
NEXT_PUBLIC_MAPBOX_TOKEN
```

`AWS_S3_REGION` remains optional (defaults to `us-west-2`).

---

## 11. Gates

| Gate | Command | Result |
|------|---------|--------|
| TypeScript | `npx tsc --noEmit` | 0 errors |
| Lint | `npm run lint` | 0 errors, 6 warnings |
| Build | `npm run build` | Exit 0, 27 routes compiled |

Lint warnings are non-blocking: `<img>` vs `next/image` (intentional — no `next/image` domain config yet), one `useEffect` deps warning in `ListingMap` (intentional — Mapbox init must run once on mount only).

No Playwright E2E tests in this phase — full listing + S3 roundtrip requires a live S3 bucket and is covered by manual verification. Phase 5 E2E scope TBD.

---

## 12. What Phase 4 does NOT include

- No presigned S3 URLs (all uploads are server-side, through Next.js API routes)
- No image CDN / CloudFront in front of S3 (raw S3 URLs for now)
- No listing search / filter UI (browse page shows all active listings; search is Phase 5+)
- No listing interest / saved listings flow (schema exists, UI deferred)
- No `next/image` optimization for listing photos (blocked on domain allowlist config)
- No E2E tests for the upload or listing flows

---

## 13. Honesty

- All TypeScript errors were fixed before commit. The primary class of errors was `Button asChild` usage — our `Button` component is a plain `<button>` with no Radix Slot support; replaced with `Link` + `buttonClasses()` helper throughout.
- `package-lock.json` is not inlined (machine-generated); see git.
- The IAM root credentials used during S3 provisioning have been deleted. Only the scoped `harmony-living-s3` IAM user keys remain in `.env`.
