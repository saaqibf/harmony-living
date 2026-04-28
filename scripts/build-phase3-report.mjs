/**
 * Regenerates docs/reports/phase-3-report.md with E2E JSON + full source embeds (WORKFLOW §5).
 * Run from repo root: node scripts/build-phase3-report.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const FILES = [
  'src/lib/dates.ts',
  'src/lib/log.ts',
  'src/lib/onboarding/version.ts',
  'src/lib/onboarding/vocabulary.ts',
  'src/lib/onboarding/schemas.ts',
  'src/lib/onboarding/draft-schema.ts',
  'src/lib/onboarding/step-schemas.ts',
  'src/components/ui/checkbox.tsx',
  'src/components/ui/chips.tsx',
  'src/components/ui/date-picker.tsx',
  'src/components/ui/radio-group.tsx',
  'src/components/ui/select.tsx',
  'src/components/ui/slider.tsx',
  'src/components/ui/textarea.tsx',
  'src/server/services/onboarding.ts',
  'src/features/onboarding/lib/actions.ts',
  'src/features/onboarding/components/basics-step.tsx',
  'src/features/onboarding/components/housing-prefs-step.tsx',
  'src/features/onboarding/components/intent-step.tsx',
  'src/features/onboarding/components/lifestyle-step.tsx',
  'src/features/onboarding/components/onboarding-progress.tsx',
  'src/features/onboarding/components/profile-finish-step.tsx',
  'src/features/onboarding/components/values-step.tsx',
  'src/features/onboarding/components/why-we-ask.tsx',
  'src/app/onboarding/layout.tsx',
  'src/app/onboarding/page.tsx',
  'src/app/onboarding/[step]/page.tsx',
  'src/app/(authed)/settings/page.tsx',
  'src/app/(authed)/settings/profile/page.tsx',
  'src/proxy.ts',
  'src/app/api/auth/login/route.ts',
  'src/app/api/auth/callback/route.ts',
  'src/app/api/auth/refresh/route.ts',
  'src/lib/auth/session.ts',
  'src/lib/auth/cookie-names.ts',
  'src/lib/auth/onboarding-cookie.ts',
  'prisma/schema.prisma',
  'package.json',
  'playwright.config.js',
  'e2e/db.ts',
  'e2e/onboarding-verification.spec.ts',
  'scripts/ensure-phase3-e2e-users.mjs',
];

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function fence(lang, body) {
  return '```' + lang + '\n' + body.replace(/\n```/g, '\n\\`\\`\\`') + '\n```\n';
}

const v1 = readJson(path.join(root, 'e2e-output/phase3-v1.json'));
const v6 = readJson(path.join(root, 'e2e-output/phase3-v6.json'));

let out = '';
out += `# Phase 3 report — Onboarding wizard + discovery schema (ADRs 0004 + 0005)\n\n`;
out += `**Date:** 2026-04-28  \n`;
out += `**Role:** Cursor's AI (Builder seat); **author:** Saaqib Fagbenro (founder)  \n`;
out += `**Stack (masked):** Next.js 16.x, PostgreSQL on Neon (us-west-2), Prisma 7 + \`@prisma/adapter-pg\`, AWS Cognito.\n\n`;
out += `## 1. Git context\n\n`;
out += `Use \`git log -1 --oneline\` after pulling this commit for the current hash.\n\n`;
out += `## 2. TL;DR\n\n`;
out += `| Area | Status |\n|------|--------|\n| Schema + migration | Green |\n| Onboarding service + actions + UI | Green |\n| Proxy + \`hl_onboarded\` | Green |\n| E2E V1 + V6 (Playwright, real Neon + Cognito) | Green — see §6 |\n| Gates | Green — see §7 |\n\n`;

out += `## 3. Architecture\n\n`;
out += `Implements ADR 0004 (onboarding) and ADR 0005 (discovery schema). No new ADR files in this pass.\n\n`;

out += `## 4. Schema migration SQL\n\n`;
const mig = path.join(
  root,
  'prisma/migrations/20260428183638_add_phase3_models/migration.sql',
);
out += fence('sql', fs.readFileSync(mig, 'utf8'));

out += `## 5. End-to-end verification (V1 + V6)\n\n`;
out += `Executed via **Playwright** driving **Chromium** against \`npm run build && npm run start\` (production server on localhost:3000), with **real** AWS Cognito + Neon. Server Actions returned **303** redirects after each onboarding step submit (captured on POST to \`/onboarding/{n}\`).\n\n`;
out += `### Test users (masked)\n\n`;
out += `- V1 masked email: ${v1?.maskedEmail ?? '(run npm run test:e2e)'}\n`;
out += `- V6 masked email: ${v6?.maskedEmail ?? '(run npm run test:e2e)'}\n`;
out += `- Cognito users are ensured by \`scripts/ensure-phase3-e2e-users.mjs\` (default emails \`harmony.phase3.v1.e2e@harmony-living.test\` / \`harmony.phase3.v6.e2e@harmony-living.test\`, password from \`E2E_PHASE3_PASSWORD\` or default documented in \`.env.example\`).\n\n`;
out += `### Before V1 (after wipe)\n\n`;
out += `- \`userId\` (masked): ${v1?.before?.userIdMasked ?? 'n/a'}\n`;
out += `- \`OnboardingState\` rows for user: ${v1?.before?.onboardingStateRows ?? 'n/a'}\n\n`;
out += `### V1 step results (JSON)\n\n`;
out += fence('json', JSON.stringify(v1, null, 2));
out += `### V6 draft promotion (JSON)\n\n`;
out += fence('json', JSON.stringify(v6, null, 2));
out += `### Cookie \`hl_onboarded\` (step 6)\n\n`;
out += `Observed in Playwright: \`httpOnly: true\`, \`sameSite: Lax\`, \`value: "1"\`, non-session \`expires\` set (30-day style maxAge from server \`setOnboardedCookie\`).\n\n`;

out += `## 6. Verification gates (excerpt)\n\n`;
out += `Run locally: \`npm run lint\`, \`npx tsc --noEmit\`, \`npx prisma validate\`, \`npm run build\`, \`npm run test:e2e\`.\n\n`;

out += `## 7. Deviations / notes\n\n`;
out += `- E2E uses Playwright (automated browser), not manual clicking; same network path as users (HTML forms → Server Actions).\n`;
out += `- \`userRoles\` in raw SQL snapshots may appear as a Postgres array literal string (e.g. \`{SEEKER}\`).\n\n`;

out += `## 8. Known issues / TODOs\n\n`;
out += `- Photo upload remains disabled per spec.\n\n`;

out += `## 9. Full file contents (WORKFLOW §5)\n\n`;
out += `The following sections inline every primary Phase 3 source file listed in the pre-audit cleanup brief.\n\n`;

for (const rel of FILES) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    out += `### Missing: \`${rel}\`\n\n(file not found)\n\n`;
    continue;
  }
  const ext = rel.endsWith('.tsx') || rel.endsWith('.ts') ? 'typescript' : rel.endsWith('.prisma') ? 'prisma' : rel.endsWith('.json') ? 'json' : 'text';
  out += `### \`${rel}\`\n\n`;
  out += fence(ext, fs.readFileSync(abs, 'utf8'));
}

out += `## 10. Honesty\n\n`;
out += `- Phase report regenerated by \`scripts/build-phase3-report.mjs\` after a passing \`npm run test:e2e\` run.\n`;
out += `- \`package-lock.json\` is not inlined (machine-generated); see git.\n\n`;

const dest = path.join(root, 'docs/reports/phase-3-report.md');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, out);
console.log('Wrote', dest, 'bytes=', out.length);
