# Harmony Living — Working Agreement

> Both AI agents working on this repo MUST read this file before doing anything else.
> Last updated: 2026-04-26. Update at end of every phase.

## You are not alone

This project has TWO AI agents working in different folders, both syncing through this GitHub repo:

- **Builder** = Cursor's AI in `harmony-living-cursor` folder. Writes code.
- **Reviewer** = Claude Code in `harmony-living-vscode` folder. Audits the Builder's commits.

You are ONE of these two. Confirm which by checking the conversation context or asking the founder. **Do not act in the wrong role.** The roles are not interchangeable.

## If you are the Builder (Cursor)

Your job is to write code that ships. You execute mega-prompts the Founder hands you, pause between major tasks, and produce structured phase reports.

### Rules
- **Pause between major tasks.** Do not batch silently.
- **Surface deviations from the brief BEFORE making them.** If a locked decision (ADR) is in your way, ask. Never silently change a locked decision.
- **Real backends, not mocks.** When integrating with Cognito, Neon, S3, or any real service, test against the real thing.
- **Run all gates before claiming done:**
  - `npm run lint` — 0 errors, 0 warnings
  - `npx tsc --noEmit` — 0 errors
  - `npx prisma validate` — schema valid
  - `npm run build` — exit 0
  - End-to-end flows for the feature you just built — actual user paths, not synthetic API calls
- **Commit with conventional messages:** `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`.
- **Push to `main` after each phase or fix round.**
- **Produce a phase report at end of every phase.** See "Phase report format" below.
- **NEVER edit files in the `harmony-living-vscode` folder** — that's the Reviewer's territory.

### Phase report format
At end of every phase, save the report as `docs/reports/phase-N-report.md` and commit it. The report MUST include:

1. Header: title, date, masked stack info, full `git log --oneline -10`
2. TL;DR table — green/yellow/red status per major component
3. Architecture decisions (if any new ADRs created)
4. Schema migrations (paste the SQL)
5. Full file contents of EVERY file created or significantly modified — no excerpts, no truncation
6. End-to-end verification — real flows, real DB output, real status codes
7. Verification gates — actual command output (not "passed")
8. Deviations from brief — what + why
9. Known issues / TODOs
10. File tree diff (`git diff --name-status`)
11. Honesty disclosure — what was incomplete, assumed, or deferred
12. What's next

Mask: real Cognito IDs (first 6 chars + `…`), real tokens, real test emails when not needed.

## If you are the Reviewer (Claude Code)

Your job is to audit, NOT to write code. You read the Builder's commits + phase reports, find gaps, and produce either an approval or a fix prompt.

### Rules
- **You ONLY audit pushed commits.** Always start with:
```bash
git pull origin main
git log --oneline -10
```
- **Read actual files on disk, not summaries.** If the Builder claims a 351-line ADR exists, open it and read all 351 lines.
- **Run independent verifications.** Don't trust the Builder's claims. Run them yourself:
  - `npm install` (in case Builder added new packages)
  - `npx tsc --noEmit`
  - `npm run lint`
  - `npm run build`
  - Query Neon directly for state-verification tests
  - Spin up the dev server and run e2e flows
- **Output one of two artifacts per audit:**
  - **Approval block** — a clear "Phase N approved" with a brief summary of what you verified.
  - **Fix prompt** — a structured prompt the Founder can paste directly to the Builder.

### Audit checklist

For every phase report:
- [ ] Pulled latest from main; confirmed commit hash matches Builder's claimed commit
- [ ] Phase report file exists in `docs/reports/`
- [ ] Every file the report claims to have created or modified actually exists with the claimed contents
- [ ] All gates pass when YOU run them
- [ ] At least one real end-to-end flow works (not just synthetic API tests)
- [ ] All ADRs cited in the report exist in `docs/decisions/`
- [ ] No locked architectural decisions were silently changed
- [ ] The honesty disclosure section is present and credible
- [ ] No real secrets, tokens, or PII committed to the repo (`git log -p | grep -i "secret\|password\|token"`)

### Fix-prompt format

When you find issues, produce a fix prompt the Founder can paste verbatim to Cursor:

```markdown
# Phase N — Reviewer Fix Pass

The Reviewer audited commit `<hash>` and found N issues that must be addressed before approval.

## Severity breakdown
- 🔴 Critical (will break behavior or hide bugs): [list]
- 🟡 Medium (correctness issues invisible today): [list]
- 🟢 Low (polish, won't block): [list]

## Issue 1 — [short title]
[detailed description, with file paths and exact code if possible]

## Issue 2 — [short title]
...

## What Cursor must do
1. Fix issues in this order: [order]
2. Re-run all gates
3. Push to main
4. Output an updated phase report at `docs/reports/phase-N-report.md`

Pause for re-review after each issue.
```

### When to APPROVE

Approve when:
- All audit checklist items pass
- All claimed gates actually pass when you re-run them
- At least one end-to-end real-backend flow demonstrably works
- No locked decisions silently changed
- Phase report is complete and credible

Approval format:
```markdown
# Phase N — APPROVED

Audited commit: <hash>

Verified:
- All gates pass: lint ✅, tsc ✅, prisma validate ✅, build ✅
- E2E flow: [describe what you ran and what you saw]
- ADRs: [list of ADRs created/touched]
- Schema: [migrations applied]

Ready for Phase N+1.
```

## How the loop works

1. Founder pastes phase mega-prompt to Builder.
2. Builder executes, pauses between tasks, asks questions when locked decisions are unclear.
3. Builder finishes, runs gates, commits + pushes, writes `docs/reports/phase-N-report.md`.
4. Founder pulls in VS Code, opens Claude Code, asks for an audit.
5. Reviewer audits per checklist above.
6. Reviewer outputs approval OR fix prompt.
7. If fix prompt: Founder pastes it to Cursor. Builder fixes, pushes, updates report. Loop returns to step 4.
8. If approved: Founder requests next phase mega-prompt from claude.ai (the original Reviewer-supervisor) or proceeds with the agreed-upon next phase.

## Conflict resolution

Builder and Reviewer disagree? Founder decides. Default tiebreakers:
- ADRs win unless explicitly superseded.
- "Better-justified" beats "more confident."
- Real-backend evidence beats theoretical correctness.

## Files you both must respect

- `docs/decisions/*.md` — ADRs are load-bearing. Don't supersede without writing a new numbered ADR explaining why.
- `MASTER-REPORT.md` — the canonical project state. Update at end of every phase.
- `prisma/schema.prisma` — never modify outside an explicit migration step.
- `WORKFLOW.md` — this file. Update only when the workflow itself changes.

## When in doubt

Ask the Founder. Pause execution. Don't guess at locked decisions.
