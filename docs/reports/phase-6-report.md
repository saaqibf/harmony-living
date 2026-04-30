# Phase 6 Report — Messaging, Trust & Safety, Stripe Identity

**Commit:** 891d323  
**Date:** 2026-04-30  
**Build:** clean (0 errors, 0 new warnings)

---

## What was built

### Pusher Channels — real-time messaging
- `pusher-server.ts` — server-only Pusher SDK instance; re-exports helpers from `pusher-shared.ts`
- `pusher-shared.ts` — `conversationChannel()` and `PUSHER_EVENTS` constants, importable by client components
- `pusher-client.ts` — lazy browser singleton via `getPusherClient()`, auth endpoint wired to `/api/pusher/auth`
- `/api/pusher/auth` — validates the requesting user is a participant in the channel's conversation before issuing a Pusher auth token

### Messaging service (`server/services/messaging.ts`)
- `sendMessage(senderId, conversationId, body)` — verifies participant membership, creates Message, updates `lastMessageAt`, triggers Pusher event on the private channel
- `markRead(userId, conversationId)` — bulk-updates unread messages to `readAt = now()`
- `getConversations(userId)` — returns conversations with other-user profile, last message preview, and `hasUnread` flag
- `getMessages(userId, conversationId, limit)` — paginated fetch, participant-verified

### Messaging UI
- `ChatView.tsx` — client component: Pusher subscription, optimistic sends (temp ID replaced by server ID on round-trip), auto-scroll, Enter-to-send, marks read on mount
- `/messages` — conversation list with unread dot badge and bold preview text
- `/messages/[conversationId]` — full-screen chat with header (avatar, name, ReportBlockMenu) and ChatView

### Trust & Safety (`server/services/trust.ts`)
- `reportUser(reporterId, reportedUserId, reason, context?)` — creates a Report record; `context` maps to `description` in schema
- `blockUser(blockerId, blockedId)` — atomic transaction: upserts Block, deactivates Match, archives ConversationParticipants for both parties; redirect to `/matches` after

### Trust UI
- `ReportBlockMenu.tsx` — bottom-sheet with three views: menu → report (radio reason picker) → reported confirmation; Block fires immediately
- Mounted in the conversation header so it's available in every chat

### Stripe Identity (`server/services/` + API routes)
- `/api/verify/start` — checks not already APPROVED, creates Stripe VerificationSession (`type: 'document'`), creates a PENDING VerificationRecord, returns hosted URL
- `/api/webhooks/stripe` — validates signature with `stripe.webhooks.constructEvent()`; `identity.verification_session.verified` → APPROVED, `identity.verification_session.requires_input` → REJECTED
- `/settings/verify` — client page with "Start verification" button; redirects user to Stripe hosted UI via `window.location.href`

---

## Bugs fixed during build

| Bug | Fix |
|-----|-----|
| `pusher-server.ts` imported by `ChatView.tsx` (client component), causing `server-only` violation at build time | Extracted `conversationChannel()` and `PUSHER_EVENTS` to `pusher-shared.ts` (no `server-only`); `ChatView` imports from there |
| Stripe `apiVersion: '2025-04-30.basil'` — wrong string, TS error | Changed to `'2026-04-22.dahlia'` to match installed `stripe` package types |
| `Report.context` field doesn't exist in schema; correct field is `description` | Fixed `trust.ts` to pass `description: context` |

---

## Credentials needed to activate Phase 6 features

These are in `.env` as `REPLACE_ME` placeholders. Replace before testing:

| Variable | Where to get it |
|----------|----------------|
| `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER` | pusher.com → create app → App Keys |
| `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER` | same Pusher app — Key and Cluster |
| `STRIPE_SECRET_KEY` | dashboard.stripe.com → Developers → API keys (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` → copy `whsec_...` |

---

## Routes added

| Route | Type | Purpose |
|-------|------|---------|
| `/messages` | Server | Conversation list |
| `/messages/[conversationId]` | Server | Full-screen chat |
| `/settings/verify` | Client | IDV entry point |
| `/api/pusher/auth` | API | Pusher channel auth |
| `/api/verify/start` | API | Create Stripe session |
| `/api/webhooks/stripe` | API | Stripe webhook handler |
