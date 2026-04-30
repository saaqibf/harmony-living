# Harmony Living — Working Agreement

> Both AI tools used in this repo MUST read this file before doing anything else.
> Last updated: 2026-04-29. Update at end of every phase.

## You are not alone

This project has **ONE author** — Saaqib Fagbenro, the founder. He works through **TWO different AI tools** in two different folders to keep build and review independent:

- **The founder, when building**, uses Claude Code in the `harmony-living-vscode` folder. We call this **the Builder seat**.
- **The founder, when reviewing**, uses Cursor's AI in the `harmony-living-cursor` folder. We call this **the Reviewer seat**.

You are **ONE** of these two AI tools. Confirm which by checking the conversation context or asking the founder. **Do not act in the wrong role.** The roles are not interchangeable — the value of separation comes from each role doing its job without contamination from the other.

When git commits, reports, or any document refer to "the Builder" or "the Reviewer," **the author is the founder.** The AI tool is the implementation device, not the author.

## If you are Claude Code (Builder seat — `harmony-living-vscode`)

Your job is to help the founder write code that ships. You execute mega-prompts the founder hands you, pause between major tasks, and produce structured phase reports.

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
- **NEVER edit files in the `harmony-living-cursor` folder** — that workspace is for the Reviewer seat (Cursor's AI) only.

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

## If you are Cursor's AI (Reviewer seat — `harmony-living-cursor`)

Your job is to audit, NOT to write code. You read commits and phase reports from the Builder seat, find gaps, and produce either an approval or a fix prompt.

### Rules
- **You ONLY audit pushed commits.** Always start with:
```bash
git pull origin main
git log --oneline -10
```
- **Read actual files on disk, not summaries.** If the phase report claims a 351-line ADR exists, open it and read all 351 lines.
- **Run independent verifications.** Don't trust unchecked claims in phase reports. Run them yourself:
  - `npm install` (in case Builder added new packages)
  - `npx tsc --noEmit`
  - `npm run lint`
  - `npm run build`
  - Query Neon directly for state-verification tests
  - Spin up the dev server and run e2e flows
- **Output one of two artifacts per audit:**
  - **Approval block** — a clear "Phase N approved" with a brief summary of what you verified.
  - **Fix prompt** — a structured prompt the founder can paste to Claude Code (Builder seat).

### Audit checklist

For every phase report:
- [ ] Pulled latest from main; confirmed commit hash matches the phase report
- [ ] Phase report file exists in `docs/reports/`
- [ ] Every file the report claims to have created or modified actually exists with the claimed contents
- [ ] All gates pass when YOU run them
- [ ] At least one real end-to-end flow works (not just synthetic API tests)
- [ ] All ADRs cited in the report exist in `docs/decisions/`
- [ ] No locked architectural decisions were silently changed
- [ ] The honesty disclosure section is present and credible
- [ ] No real secrets, tokens, or PII committed to the repo (`git log -p | grep -i "secret\|password\|token"`)

### Fix-prompt format

When you find issues, produce a fix prompt the founder can paste verbatim to Claude Code:

```markdown
# Phase N — Reviewer Fix Pass

The Reviewer seat audited commit `<hash>` and found N issues that must be addressed before approval.

## Severity breakdown
- 🔴 Critical (will break behavior or hide bugs): [list]
- 🟡 Medium (correctness issues invisible today): [list]
- 🟢 Low (polish, won't block): [list]

## Issue 1 — [short title]
[detailed description, with file paths and exact code if possible]

## Issue 2 — [short title]
...

## What the Builder seat (Claude Code) must do
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

**The founder never copy-pastes phase mega-prompts.** Claude Code self-generates and self-executes them.

1. **Claude Code (Builder seat) proposes the next phase plan** — drafts what it will build, presents it to the founder, and asks for approval or changes.
2. **Founder approves** (or redirects). Claude Code proceeds once approved.
3. **Claude Code executes** — builds step-by-step, pauses between major tasks, asks if a locked decision is in the way, runs all gates, commits + pushes, writes `docs/reports/phase-N-report.md`.
4. **Claude Code notifies the founder** that the phase is done and ready for review.
5. **Founder pulls in Cursor** (`harmony-living-cursor`) and asks the Reviewer seat to audit.
6. **Reviewer seat outputs approval OR fix prompt.**
7. **If fix prompt:** Founder pastes it to Claude Code; Claude Code fixes, pushes, updates the report. Loop returns to step 5.
8. **If approved:** Claude Code drafts the next phase plan. Loop returns to step 1.

## Conflict resolution

The two seats disagree? Founder decides. Default tiebreakers:
- ADRs win unless explicitly superseded.
- "Better-justified" beats "more confident."
- Real-backend evidence beats theoretical correctness.

## Files both seats must respect

- `docs/decisions/*.md` — ADRs are load-bearing. Don't supersede without writing a new numbered ADR explaining why.
- `MASTER-REPORT.md` — the canonical project state. Update at end of every phase.
- `prisma/schema.prisma` — never modify outside an explicit migration step.
- `WORKFLOW.md` — this file. Update only when the workflow itself changes.

## When in doubt

Ask the Founder. Pause execution. Don't guess at locked decisions.
